import React, { useState } from "react";
import Tesseract from "tesseract.js";

const App = () => {
  const [topic, setTopic] = useState("");
  const [question, setQuestion] = useState({});
  const [image, setImage] = useState(null);
  const [extractedText, setExtractedText] = useState("");
  const [evaluationResult, setEvaluationResult] = useState("");
  const [loading, setLoading] = useState(false);

  const GROQ_API_KEY = "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";
  const MODEL = "llama3-8b-8192";

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
          Authorization: `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      const data = await res.json();
      const msg = data.choices[0].message.content;
      const lines = msg.split("\n");
      const wordingLine = lines.find((line) => line.toLowerCase().startsWith("wordings:"));
      const equationLine = lines.find((line) => line.toLowerCase().startsWith("equation:"));
      const hintLine = lines.find((line) => line.toLowerCase().startsWith("hint:"));

      setQuestion({
        wording: wordingLine ? wordingLine.replace(/wordings:\s*/i, "").trim() : "Not found",
        equation: equationLine ? equationLine.replace(/equation:\s*/i, "").trim() : "Not found",
        hint: hintLine ? hintLine.replace(/hint:\s*/i, "").trim() : "Not found",
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
      const { data: { text } } = await Tesseract.recognize(file, "eng", {
        logger: (m) => console.log(m),
      });
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

Evaluate ONLY if the final answer is correct or not. Consider multiple solving methods (do not stick to a single path). Avoid deep method checking.

If correct:
- Reply clearly that the answer is CORRECT.
- Appreciate the user with a short motivational message.

If incorrect:
- Mention it's INCORRECT and where it went wrong.
- Teach how to solve it step-by-step in a simple manner.
`;
    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      const data = await response.json();
      const evalMsg = data.choices[0].message.content;
      setEvaluationResult(evalMsg);
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
    },
    title: {
      textAlign: "center",
      color: "#007acc",
      marginBottom: "1.5rem",
      fontSize: "28px",
      fontWeight: "bold",
    },
    inputRow: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: "1rem",
    },
    input: {
      padding: "0.6rem",
      marginRight: "0.5rem",
      width: "65%",
      border: "1px solid #aaa",
      borderRadius: "6px",
    },
    button: {
      padding: "0.6rem 1rem",
      backgroundColor: "#007acc",
      color: "white",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
      fontWeight: "bold",
    },
    section: {
      marginTop: "1.5rem",
    },
    label: {
      fontWeight: "bold",
      color: "#007acc",
      display: "block",
      marginBottom: "0.5rem",
    },
    resultBox: {
      backgroundColor: "#e6f4ff",
      padding: "1rem",
      borderRadius: "10px",
      marginTop: "1rem",
      borderLeft: "6px solid #007acc",
    },
    paragraph: {
      marginBottom: "0.5rem",
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>📘 AI Math Evaluator</h2>

        <div style={styles.inputRow}>
          <input
            style={styles.input}
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Enter a math topic (e.g., Algebra, Fractions)"
          />
          <button style={styles.button} onClick={generateProblem} disabled={loading}>
            {loading ? "Generating..." : "Get Question"}
          </button>
        </div>

        {question.wording && (
          <div style={styles.section}>
            <p style={styles.paragraph}><b>📘 Question:</b> {question.wording}</p>
            <p style={styles.paragraph}><b>🧮 Equation:</b> {question.equation}</p>
            <p style={styles.paragraph}><b>💡 Hint:</b> {question.hint}</p>
          </div>
        )}

        {question.wording && (
          <div style={styles.section}>
            <label style={styles.label}>📤 Upload Your Solution Image:</label>
            <input type="file" accept="image/*" onChange={handleImageUpload} />
            {image && <p>✅ Uploaded: {image.name}</p>}
          </div>
        )}

        {extractedText && (
          <div style={styles.resultBox}>
            <h4>📝 Extracted Answer:</h4>
            <pre>{extractedText}</pre>
          </div>
        )}

        {evaluationResult && (
          <div style={styles.resultBox}>
            <h4>🧠 Evaluation Result:</h4>
            <p>{evaluationResult}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
