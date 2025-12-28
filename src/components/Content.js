import React, { useState } from "react";

const ContentExplorer = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const categories = [
    { id: "all", name: "All Content", icon: "🔍" },
    { id: "articles", name: "Articles", icon: "📰" },
    { id: "videos", name: "Videos", icon: "🎬" },
    { id: "books", name: "Books", icon: "📚" },
    { id: "courses", name: "Courses", icon: "🧠" },
  ];

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    setLoading(true);
    setError(null);

    try {
      // 1️⃣ Backend AI content search
      const response = await fetch(
        "https://visual-math-oscg.onrender.com/generate-quiz",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [
              {
                role: "system",
                content: `You are an AI content recommendation engine. 
                Return ONLY a JSON array. No explanation.

                Format:
                [
                  {
                    "title": "React for Beginners",
                    "type": "course",
                    "source": "Udemy",
                    "description": "React course beginners.",
                    "duration": "10 hours"
                  }
                ]`,
              },
              {
                role: "user",
                content: `Find educational resources for topic: ${searchTerm}`,
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Backend Error: ${response.status}`);
      }

      const data = await response.json();
      let rawContent = data.choices?.[0]?.message?.content?.trim();

      // Extract JSON ONLY
      const jsonMatch = rawContent.match(/\[.*\]/s);
      const parsedResults = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

      // 2️⃣ Google Books API integration
      const GOOGLE_BOOKS_API = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
        searchTerm
      )}&maxResults=5`;
      const booksRes = await fetch(GOOGLE_BOOKS_API);
      const booksData = await booksRes.json();

      const booksResults =
        booksData.items?.map((item) => ({
          title: item.volumeInfo.title,
          type: "book",
          source: item.volumeInfo.publisher || "Google Books",
          description: item.volumeInfo.description || "No description available",
          duration: "",
        })) || [];

      // Combine backend + Google Books results
      setSearchResults([...parsedResults, ...booksResults]);
    } catch (err) {
      console.error("Search error:", err);
      setError("Failed to retrieve content. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const filteredResults =
    activeCategory === "all"
      ? searchResults
      : searchResults.filter(
          (result) => result.type.toLowerCase() === activeCategory
        );

  return (
    <div style={{ padding: "30px", fontFamily: "Arial" }}>
      <h2 style={{ color: "#6a0dad", marginBottom: "20px" }}>
        Content Explorer
      </h2>

      <div style={{ background: "#fafafa", padding: "20px", borderRadius: "12px" }}>
        <div style={{ marginBottom: "20px" }}>
          <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search for learning resources..."
              style={{
                flex: 1,
                padding: "12px 15px",
                borderRadius: "8px",
                border: "1px solid #e0e0e0",
                fontSize: "16px",
              }}
            />
            <button
              onClick={handleSearch}
              disabled={loading || !searchTerm.trim()}
              style={{
                background: "#6a0dad",
                color: "white",
                padding: "12px 18px",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </div>

          <div style={{ display: "flex", gap: "10px", overflowX: "auto" }}>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                style={{
                  padding: "8px 15px",
                  borderRadius: "20px",
                  background: activeCategory === category.id ? "#6a0dad" : "#f0e6ff",
                  color: activeCategory === category.id ? "white" : "#6a0dad",
                  border: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
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
              background: "#ffebee",
              color: "#d32f2f",
              padding: "15px",
              borderRadius: "8px",
              marginBottom: "20px",
            }}
          >
            {error}
          </div>
        )}

        {!loading && filteredResults.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "20px",
            }}
          >
            {filteredResults.map((result, index) => (
              <div
                key={index}
                style={{
                  padding: "20px",
                  borderRadius: "10px",
                  background: "white",
                  border: "1px solid #e0e0e0",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
                }}
              >
                <h3>{result.title}</h3>
                <p>{result.description}</p>
                <span
                  style={{
                    fontSize: "14px",
                    color: "#666",
                    display: "block",
                    marginTop: "5px",
                  }}
                >
                  Source: {result.source}
                </span>
              </div>
            ))}
          </div>
        )}

        {loading && (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <h3>Searching...</h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentExplorer;
