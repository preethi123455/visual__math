import React, { useState } from "react";
import { motion } from "framer-motion";

const BACKEND_URL = "https://visual-math-oscg.onrender.com/generate-llama-tutor";

const containerStyle = {
  background: "#C3B1E1",
  fontFamily: "Comic Sans MS, sans-serif",
  minHeight: "100vh",
  padding: "30px",
  textAlign: "center",
  color: "#333",
};

export default function LlamaTutorGame() {
  const [baseQuestion, setBaseQuestion] = useState("");
  const [chosenLevel, setChosenLevel] = useState(null);
  const [modifiedQuestion, setModifiedQuestion] = useState("");
  const [steps, setSteps] = useState([]);
  const [selectedStep, setSelectedStep] = useState(null);
  const [loading, setLoading] = useState(false);
  const [quizIndex, setQuizIndex] = useState(null);
  const [userAnswer, setUserAnswer] = useState(null);

  // -------- AI Question Template ---------
  const modifyQuestion = (level) => {
    const templates = [
      `Explain like I’m 5: ${baseQuestion}`,
      `Break this concept into a fun puzzle: ${baseQuestion}`,
      `Give coding example + explanation: ${baseQuestion}`,
      `Explain common mistakes + correct method: ${baseQuestion}`,
      `Teach this like a fun classroom teacher: ${baseQuestion}`,
    ];
    return templates[level - 1] || baseQuestion;
  };

  // -------- Handle AI request through backend --------
  const handleStartLevel = async (level) => {
    if (!baseQuestion.trim()) {
      alert("Please enter a question first!");
      return;
    }

    const modified = modifyQuestion(level);
    setModifiedQuestion(modified);
    setChosenLevel(level);
    setLoading(true);
    setSteps([]);
    setSelectedStep(null);
    setQuizIndex(null);
    setUserAnswer(null);

    try {
      const res = await fetch(BACKEND_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: modified }),
      });

      if (!res.ok) throw new Error("Backend error");

      const data = await res.json();
      const fullText = data.response || "";

      // Split clean steps (AI sometimes returns numbered or bulleted text)
      const stepsArray = fullText
        .split(/\n+/)
        .filter((line) => line.trim().length > 3)
        .map((line) => line.replace(/^\d+\.\s*/, "").trim());

      setSteps(stepsArray);
    } catch (err) {
      console.error(err);
      alert("Error fetching explanation! Try again.");
    }

    setLoading(false);
  };

  // ---------- Generate quiz ----------
  const handleQuiz = () => {
    if (steps.length === 0) return;
    setQuizIndex(Math.floor(Math.random() * steps.length));
    setUserAnswer(null);
  };

  const handleAnswer = (index) => {
    setUserAnswer(index);
  };

  return (
    <div style={containerStyle}>
      <h1 style={{ fontSize: "2.5rem" }}>🦙 LLaMA Learning Adventure</h1>
      <p>Type a question and choose your learning mode 🎮</p>

      {/* Base Question Input */}
      <input
        type="text"
        placeholder="e.g., What is a binary tree?"
        value={baseQuestion}
        onChange={(e) => setBaseQuestion(e.target.value)}
        style={{
          width: "60%",
          padding: "12px",
          fontSize: "1rem",
          borderRadius: "10px",
          border: "2px solid #333",
          marginBottom: "20px",
        }}
      />

      {/* Level Selection */}
      {baseQuestion && (
        <div>
          <h3>🎮 Choose your Learning Level</h3>
          {[1, 2, 3, 4, 5].map((num) => (
            <motion.button
              key={num}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleStartLevel(num)}
              style={{
                margin: "5px",
                padding: "10px 18px",
                backgroundColor: "#ff6f61",
                color: "white",
                fontSize: "1rem",
                borderRadius: "10px",
                border: "none",
                cursor: "pointer",
              }}
            >
              Level {num}
            </motion.button>
          ))}
        </div>
      )}

      {loading && <p>🧠 Fetching steps from the LLaMA brain...</p>}

      {/* Steps Display */}
      {steps.length > 0 && (
        <>
          <h2 style={{ marginTop: "30px" }}>🧩 Level {chosenLevel} Steps</h2>
          <p style={{ fontStyle: "italic" }}>“{modifiedQuestion}”</p>

          {/* Step selection buttons */}
          <div>
            {steps.map((step, index) => (
              <motion.button
                key={index}
                onClick={() => setSelectedStep(index)}
                whileHover={{ scale: 1.1 }}
                style={{
                  margin: "4px",
                  padding: "10px 15px",
                  backgroundColor: "#4caf50",
                  color: "#fff",
                  fontSize: "1rem",
                  borderRadius: "50%",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                {index + 1}
              </motion.button>
            ))}
          </div>

          {/* Step detail display */}
          {selectedStep !== null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              style={{
                marginTop: "20px",
                padding: "20px",
                backgroundColor: "#fff",
                borderRadius: "12px",
                color: "#222",
                fontSize: "1.1rem",
                maxWidth: "600px",
                margin: "auto",
              }}
            >
              <h3>📘 Step {selectedStep + 1}</h3>
              <p>{steps[selectedStep]}</p>
            </motion.div>
          )}

          {/* Quiz Button */}
          <motion.button
            onClick={handleQuiz}
            whileHover={{ scale: 1.1 }}
            style={{
              marginTop: "30px",
              padding: "10px 20px",
              fontSize: "1rem",
              backgroundColor: "#ff9800",
              color: "white",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
            }}
          >
            🧠 Quiz Me!
          </motion.button>
        </>
      )}

      {/* Quiz Section */}
      {quizIndex !== null && (
        <div
          style={{
            marginTop: "30px",
            backgroundColor: "#fff",
            padding: "25px",
            borderRadius: "10px",
            maxWidth: "600px",
            margin: "auto",
          }}
        >
          <h2>🎉 Challenge Time!</h2>
          <p><strong>Which step number says this?</strong></p>

          <p style={{ fontStyle: "italic" }}>{steps[quizIndex]}</p>

          <div style={{ marginTop: "15px" }}>
            {steps.map((_, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(idx)}
                style={{
                  margin: "4px",
                  padding: "10px 14px",
                  fontSize: "1rem",
                  backgroundColor:
                    userAnswer === idx
                      ? idx === quizIndex
                        ? "#4caf50"
                        : "#f44336"
                      : "#2196f3",
                  color: "white",
                  border: "none",
                  borderRadius: "50%",
                  cursor: "pointer",
                }}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          {userAnswer !== null && (
            <p style={{ marginTop: "20px", fontSize: "1.2rem" }}>
              {userAnswer === quizIndex
                ? "✅ Correct! LLaMA is proud 🦙✨"
                : "❌ Oops! Try again next time!"}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
