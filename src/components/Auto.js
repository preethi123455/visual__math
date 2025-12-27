import React, { useState } from "react";
import Tesseract from "tesseract.js";

const App = () => {
  const [topic, setTopic] = useState("");
  const [question, setQuestion] = useState(null);
  const [extractedText, setExtractedText] = useState("");
  const [evaluationResult, setEvaluationResult] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔹 Generate Math Question
  const generateProblem = async () => {
    if (!topic) return;
    setLoading(true);
    setQuestion(null);
    setEvaluationResult("");

    try {
      const res = await fetch("http://localhost:5000/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: `Generate a math question from topic "${topic}".
Return exactly:
Wordings:
Equation:
Hint:`,
            },
          ],
        }),
      });

      const data = await res.json();
      const text = data.reply || "";

      const lines = text.split("\n");

      setQuestion({
        wording:
          lines.find(l => l.toLowerCase().startsWith("wordings"))?.split(":")[1]?.trim() || "N/A",
        equation:
          lines.find(l => l.toLowerCase().startsWith("equation"))?.split(":")[1]?.trim() || "N/A",
        hint:
          lines.find(l => l.toLowerCase().startsWith("hint"))?.split(":")[1]?.trim() || "N/A",
      });
    } catch (err) {
      console.error(err);
      alert("Failed to generate question");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 OCR + Evaluate
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !question) return;

    setLoading(true);
    setEvaluationResult("");

    try {
      const { data } = await Tesseract.recognize(file, "eng");
      const studentAnswer = data.text.trim();
      setExtractedText(studentAnswer);

      const res = await fetch("http://localhost:5000/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: `
Question: ${question.wording}
Correct Equation: ${question.equation}
Student Answer: ${studentAnswer}

Evaluate correctness and explain briefly.`,
            },
          ],
        }),
      });

      const result = await res.json();
      setEvaluationResult(result.reply || "No evaluation received");
    } catch (err) {
      console.error(err);
      setEvaluationResult("Error evaluating answer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: "#C3B1E1", minHeight: "100vh", padding: "2rem" }}>
      <div style={{ background: "#fff", padding: "2rem", borderRadius: 16, maxWidth: 700, margin: "auto" }}>
        <h2>AI Math Evaluator</h2>

        <input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Enter topic (e.g. Linear Equations)"
          style={{ width: "100%", padding: 10 }}
        />

        <button onClick={generateProblem} disabled={loading}>
          Generate Question
        </button>

        {question && (
          <>
            <p><b>Question:</b> {question.wording}</p>
            <p><b>Hint:</b> {question.hint}</p>

            <input type="file" accept="image/*" onChange={handleImageUpload} />
          </>
        )}

        {extractedText && <p><b>OCR Text:</b> {extractedText}</p>}
        {evaluationResult && <p><b>Result:</b> {evaluationResult}</p>}
      </div>
    </div>
  );
};

export default App;
