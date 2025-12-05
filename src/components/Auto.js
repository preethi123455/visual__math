import React, { useState } from "react";
import Tesseract from "tesseract.js";

const App = () => {
  const [topic, setTopic] = useState("");
  const [question, setQuestion] = useState({});
  const [image, setImage] = useState(null);
  const [extractedText, setExtractedText] = useState("");
  const [evaluationResult, setEvaluationResult] = useState("");
  const [loading, setLoading] = useState(false);

  const groqApiKey = "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";
  const mode = "general"; // 👈 ADDED so 'mode' does not break build

  const generateProblem = async () => {
    if (!topic) return;
    setLoading(true);
    setEvaluationResult("");
    setQuestion({});

    const prompt = `
Generate a math question from the topic "${topic}". Return ONLY in this format:

Wordings: <some question wording>
Equation: <corresponding equation>
Hint: <hint to help the student solve it>

DO NOT include any extra explanation.
`;

    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${groqApiKey}`,
        },
        body: JSON.stringify({
          model: mode === "general" ? "llama-3.1-8b-instant" : "llama-3.3-70b-versatile",
          messages: [{ role: "user", content: prompt }],
        }),
      });

      const data = await res.json();
      const msg = data.choices[0].message.content;
      const lines = msg.split("\n");

      setQuestion({
        wording: lines.find(l => l.toLowerCase().startsWith("wordings:"))?.replace(/wordings:\s*/i, "").trim() || "Not found",
        equation: lines.find(l => l.toLowerCase().startsWith("equation:"))?.replace(/equation:\s*/i, "").trim() || "Not found",
        hint: lines.find(l => l.toLowerCase().startsWith("hint:"))?.replace(/hint:\s*/i, "").trim() || "Not found",
      });

    } catch (err) {
      console.error(err);
      alert("Failed to generate question.");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setEvaluationResult("");
    setExtractedText("");
    setLoading(true);

    try {
      const { data: { text } } = await Tesseract.recognize(file, "eng");
      setExtractedText(text.trim());
      await evaluateAnswer(text.trim());
    } catch (err) {
      console.error("OCR error:", err);
      alert("Failed to read the image.");
    } finally {
      setLoading(false);
    }
  };

  const evaluateAnswer = async (studentAnswer) => {
    if (!question.wording || !question.equation) {
      alert("Please generate a question first.");
      return;
    }

    setLoading(true);

    const prompt = `
Question: ${question.wording}
Correct Equation: ${question.equation}
Student's Answer (from image): ${studentAnswer}

Evaluate ONLY if the final answer is correct or not. Consider multiple solving methods.
If correct: say CORRECT with motivation
If incorrect: explain mistake + step-by-step fix.
`;

    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${groqApiKey}`,
        },
        body: JSON.stringify({
          model: mode === "general" ? "llama-3.1-8b-instant" : "llama-3.3-70b-versatile",
          messages: [{ role: "user", content: prompt }],
        }),
      });

      const data = await response.json();
      setEvaluationResult(data.choices[0].message.content);

    } catch (err) {
      console.error(err);
      setEvaluationResult("Error evaluating the answer.");
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: {
      backgroundColor: "#C3B1E1",
      minHeight: "100vh",
      padding: "2rem",
      fontFamily: "Segoe UI, sans-serif",
    },
    card: {
      backgroundColor: "#ffffff",
      padding: "2rem",
      borderRadius: "16px",
      maxWidth: "700px",
      margin: "auto",
      boxShadow: "0 6px 18px rgba(0,0,0,0.1)",
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* 🔥 UI unchanged */}
      </div>
    </div>
  );
};

export default App;
