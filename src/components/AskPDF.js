import React, { useState } from "react";
import axios from "axios";

const API_BASE = "http://localhost:5000";

export default function AskPDF() {
  const [fileName, setFileName] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("pdf", file); // ✅ MUST be "pdf"

    try {
      const res = await axios.post(`${API_BASE}/api/upload`, formData);
      setFileName(res.data.file);
      alert("✅ File uploaded successfully");
    } catch (err) {
      console.error(err);
      alert("❌ Upload failed");
    }
  };

  const handleAsk = async () => {
    if (!question || !fileName) {
      alert("Upload a PDF and ask a question");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/api/ask`, {
        question,
        filename: fileName,
      });
      setAnswer(res.data.answer);
    } catch (err) {
      console.error(err);
      setAnswer("❌ Failed to get answer");
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>📄 Ask Questions from PDF</h2>

      <input type="file" accept=".pdf" onChange={handleFileUpload} />

      <br /><br />

      <input
        type="text"
        placeholder="Ask a question..."
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        style={{ width: "60%", padding: 10 }}
      />

      <button onClick={handleAsk} style={{ marginLeft: 10 }}>
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
}
