import React, { useState } from 'react';

const ContentExplorer = () => {
  const groqApiKey = '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'; // Replace with your actual Groq API key
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const categories = [
    { id: 'all', name: 'All Content', icon: '🔍' },
    { id: 'articles', name: 'Articles', icon: '📰' },
    { id: 'videos', name: 'Videos', icon: '🎬' },
    { id: 'books', name: 'Books', icon: '📚' },
    { id: 'courses', name: 'Courses', icon: '🧠' }
  ];

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${groqApiKey}`
        },
        body: JSON.stringify({
          model: 'llama3-8b-8192',
          messages: [
            {
              role: 'system',
              content: `You are an AI content recommendation engine. Strictly return a valid JSON array with no explanations. 
              The JSON should follow this exact structure:
              [
                {
                  "title": "React for Beginners",
                  "type": "course",
                  "source": "Udemy",
                  "description": "An introductory React course covering hooks and components.",
                  "duration": "10 hours"
                }
              ]`
            },
            {
              role: 'user',
              content: `Find educational resources about: ${searchTerm}`
            }
          ],
          temperature: 0.7,
          max_tokens: 1024
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      let rawContent = data.choices[0]?.message?.content?.trim();
      const jsonMatch = rawContent.match(/\[.*\]/s);
      if (!jsonMatch) throw new Error("Failed to extract valid JSON from response.");

      const parsedResults = JSON.parse(jsonMatch[0]);
      if (Array.isArray(parsedResults)) {
        setSearchResults(parsedResults);
      } else {
        throw new Error("Invalid JSON format received.");
      }
    } catch (error) {
      console.error('Error searching content:', error);
      setError('Failed to retrieve content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredResults =
    activeCategory === 'all'
      ? searchResults
      : searchResults.filter((result) => result.type.toLowerCase() === activeCategory);

  return (
    <div style={{ padding: '30px', fontFamily: 'Arial' }}>
      <h2 style={{ color: '#6a0dad', marginBottom: '20px' }}>Content Explorer</h2>

      <div style={{ background: '#fafafa', padding: '20px', borderRadius: '12px' }}>
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search for learning resources..."
              style={{
                flex: 1,
                padding: '12px 15px',
                borderRadius: '8px',
                border: '1px solid #e0e0e0',
                fontSize: '16px'
              }}
            />
            <button
              onClick={handleSearch}
              disabled={loading || !searchTerm.trim()}
              style={{
                background: '#6a0dad',
                color: '#fff',
                padding: '12px 18px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>

          <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '10px' }}>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                style={{
                  padding: '8px 15px',
                  borderRadius: '20px',
                  border: 'none',
                  background: activeCategory === category.id ? '#6a0dad' : '#f0e6ff',
                  color: activeCategory === category.id ? 'white' : '#6a0dad',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                <span>{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div
            style={{
              color: '#d32f2f',
              padding: '15px',
              borderRadius: '8px',
              background: '#ffebee',
              marginBottom: '20px'
            }}
          >
            {error}
          </div>
        )}

        {loading && (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <h3>Searching for resources...</h3>
            <p>Finding the best educational content for you.</p>
          </div>
        )}

        {!loading && filteredResults.length > 0 && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '20px'
            }}
          >
            {filteredResults.map((result, index) => (
              <div
                key={index}
                style={{
                  padding: '20px',
                  borderRadius: '10px',
                  border: '1px solid #e0e0e0',
                  background: 'white',
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.05)'
                }}
              >
                <h3>{result.title}</h3>
                <p style={{ margin: '10px 0' }}>{result.description}</p>
                <span style={{ fontSize: '14px', color: '#555' }}>{result.source}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentExplorer;
