import React, { useState } from 'react';
import axios from 'axios';

const AskPDF = ({ fileName }) => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    if (!question || !fileName) {
      alert('Please enter a question and ensure a file is uploaded.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:11000/api/ask', {
        question,
        filename: fileName,
      });
      setAnswer(response.data.answer);
    } catch (err) {
      console.error('Error getting answer', err);
      setAnswer('Error getting answer');
    }
    setLoading(false);
  };

  return (
    <div style={{ marginTop: '20px' }}>
      <h2>Ask a Question about the PDF</h2>
      <input
        type="text"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Type your question"
        style={{ width: '60%', padding: '10px' }}
      />
      <button onClick={handleAsk} style={{ marginLeft: '10px', padding: '10px 20px' }}>
        Ask
      </button>
      {loading && <p>Loading...</p>}
      {answer && (
        <div style={{ marginTop: '20px' }}>
          <h3>Answer:</h3>
          <p>{answer}</p>
        </div>
      )}
    </div>
  );
};

export default AskPDF;
