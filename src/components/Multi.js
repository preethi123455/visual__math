import React, { useState } from "react";

const DualLanguageMathExplainer = () => {
  const [problem, setProblem] = useState("");
  const [language, setLanguage] = useState("english");
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // IMPORTANT: No API key here. Frontend -> Backend -> Groq.
  const BACKEND_URL = "https://visual-math-oscg.onrender.com/generate-quiz";

  const getExplanation = async () => {
    if (!problem.trim()) {
      setError("Please enter a math problem.");
      return;
    }

    setLoading(true);
    setExplanation("");
    setError(null);

    let langPrompt = "Explain this math problem clearly";

    const langMap = {
      tamil: " in Tamil",
      hindi: " in Hindi",
      telugu: " in Telugu",
      kannada: " in Kannada",
      malayalam: " in Malayalam",
      both: " in both English and Tamil",
    };

    langPrompt += langMap[language] || " in English";

    try {
      const response = await fetch(BACKEND_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content: `${langPrompt}. Provide step-by-step explanation suitable for students.`,
            },
            {
              role: "user",
              content: problem,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error("Backend error: " + response.status);
      }

      const data = await response.json();

      setExplanation(data.choices[0].message.content);
    } catch (err) {
      setError(err.message);
    }

    setLoading(false);
  };

  const styles = {
    container: {
      maxWidth: "700px",
      margin: "50px auto",
      padding: "20px",
      backgroundColor: "#C3B1E1",
      borderRadius: "10px",
      fontFamily: "Segoe UI, sans-serif",
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    },
    title: {
      fontSize: "22px",
      fontWeight: "bold",
      textAlign: "center",
      marginBottom: "15px",
      color: "#1565c0",
    },
    textarea: {
      width: "100%",
      height: "100px",
      padding: "10px",
      border: "1px solid rgb(158,21,192)",
      borderRadius: "6px",
      marginBottom: "15px",
      fontSize: "16px",
    },
    select: {
      width: "100%",
      padding: "10px",
      fontSize: "16px",
      border: "1px solid rgb(181,21,192)",
      borderRadius: "6px",
      marginBottom: "15px",
    },
    button: {
      padding: "10px 20px",
      fontSize: "16px",
      backgroundColor: "#1565c0",
      color: "white",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
    },
    explanationBox: {
      marginTop: "20px",
      backgroundColor: "purple",
      padding: "15px",
      borderRadius: "6px",
      border: "1px solid rgb(166,21,192)",
      lineHeight: "1.6",
      whiteSpace: "pre-wrap",
      color: "white",
    },
    errorBox: {
      marginTop: "10px",
      padding: "10px",
      backgroundColor: "#ffcdd2",
      borderRadius: "6px",
      color: "#b71c1c",
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.title}>🎓 Multi-Language Math Explainer</div>

      <textarea
        style={styles.textarea}
        placeholder="Enter a math problem (e.g., Solve x^2 + 5x + 6 = 0)"
        value={problem}
        onChange={(e) => setProblem(e.target.value)}
      />

      <select
        style={styles.select}
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
      >
        <option value="english">English</option>
        <option value="tamil">Tamil</option>
        <option value="hindi">Hindi</option>
        <option value="telugu">Telugu</option>
        <option value="kannada">Kannada</option>
        <option value="malayalam">Malayalam</option>
        <option value="both">Both (English + Tamil)</option>
      </select>

      <button style={styles.button} onClick={getExplanation} disabled={loading}>
        {loading ? "Generating..." : "Get Explanation"}
      </button>

      {error && <div style={styles.errorBox}>{error}</div>}
      {explanation && <div style={styles.explanationBox}>{explanation}</div>}
    </div>
  );
};

export default DualLanguageMathExplainer;
