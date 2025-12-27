import React, { useState } from 'react';
import axios from 'axios';

const AskPDF = () => {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileUpload = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const res = await axios.post('http://localhost:11000/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setFileName(res.data.filename);
      alert('File uploaded successfully!');
    } catch (err) {
      console.error('Upload error:', err);
      alert('File upload failed.');
    }
    setLoading(false);
  };

  const handleAsk = async () => {
    if (!question || !fileName) {
      alert('Please select a file and enter a question.');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post('http://localhost:11000/api/ask', {
        filename: fileName,
        question,
      });
      setAnswer(res.data.answer);
    } catch (err) {
      console.error('Ask error:', err);
      setAnswer('Error fetching answer.');
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Ask Questions About Your PDF</h2>

      <input type="file" accept="application/pdf" onChange={handleFileUpload} />
      <br /><br />

      <input
        type="text"
        placeholder="Enter your question"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        style={{ width: '60%', padding: 10 }}
      />
      <button onClick={handleAsk} style={{ marginLeft: 10, padding: '10px 20px' }}>
        Ask
      </button>

      {loading && <p>Loading...</p>}

      {answer && (
        <div style={{ marginTop: 20 }}>
          <h3>Answer:</h3>
          <p>{answer}</p>
        </div>
      )}
    </div>
  );
};

export default AskPDF;
