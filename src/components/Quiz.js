import React, { useState } from "react";

const QuizGenerator = () => {
  // ✅ Load from .env (development only)
  const groqApiKey = process.env.REACT_APP_GROQ_API_KEY;

  const [level, setLevel] = useState(null);
  const [userInput, setUserInput] = useState("");
  const [quiz, setQuiz] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [answers, setAnswers] = useState({});
  const [feedback, setFeedback] = useState(null);

  const handleLevelSelect = (selectedLevel) => {
    setLevel(selectedLevel);
    setUserInput("");
    setQuiz([]);
    setFeedback(null);
    setAnswers({});
    setError(null);
  };

  const handleContentSubmit = async () => {
    if (!userInput.trim()) {
      setError("Please enter a topic before generating a quiz.");
      return;
    }

    setLoading(true);
    setError(null);
    setQuiz([]);
    setFeedback(null);

    try {
      const response = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${groqApiKey}`,
          },
          body: JSON.stringify({
            model: "llama-3.1-8b-instant",
            response_format: { type: "json_object" },
            messages: [
              {
                role: "system",
                content: `
                You MUST return ONLY valid JSON:
                {
                  "quiz": [
                    {
                      "question": "string",
                      "options": ["A","B","C","D"],
                      "correctAnswer": "string"
                    }
                  ]
                }
                `,
              },
              {
                role: "user",
                content: `Generate 3 ${level} level math questions on: ${userInput}`,
              },
            ],
            temperature: 0.5,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;

      const parsed = JSON.parse(content);
      setQuiz(parsed.quiz);
    } catch (err) {
      console.error("Quiz Error:", err);
      setError("Failed to generate quiz. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (index, selectedOption) => {
    setAnswers({ ...answers, [index]: selectedOption });
  };

  const handleSubmitAnswers = () => {
    let correctCount = 0;
    let recommendations = [];

    quiz.forEach((q, index) => {
      if (answers[index] === q.correctAnswer) correctCount++;
      else recommendations.push(userInput);
    });

    setFeedback({
      score: `${correctCount} / ${quiz.length}`,
      message:
        correctCount === quiz.length
          ? "Excellent work!"
          : "Good try! Here’s how you can improve.",
      recommendations: [...new Set(recommendations)].map(
        (t) => `Learn more about: ${t}`
      ),
    });
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>Visualizing Math: AI Quiz Generator</h2>

      {!level ? (
        <div style={styles.levelSelector}>
          <p style={styles.label}>Choose your level:</p>
          {["Beginner", "Intermediate", "Advanced"].map((lvl) => (
            <button
              key={lvl}
              style={styles.levelButton}
              onClick={() => handleLevelSelect(lvl)}
            >
              {lvl}
            </button>
          ))}
        </div>
      ) : (
        <div style={styles.quizBox}>
          <p style={styles.label}>Enter a math topic:</p>
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="e.g., Algebra, Geometry, Calculus"
            style={styles.input}
          />

          <button
            onClick={handleContentSubmit}
            style={styles.generateButton}
            disabled={loading}
          >
            {loading ? "Generating..." : "Generate Quiz"}
          </button>

          {error && <p style={styles.error}>{error}</p>}

          {quiz.length > 0 && (
            <div style={styles.quizContainer}>
              <h3 style={styles.quizHeader}>Quiz Questions</h3>

              {quiz.map((q, index) => {
                const isSubmitted = feedback !== null;

                return (
                  <div key={index} style={styles.questionBlock}>
                    <p>
                      <strong>{q.question}</strong>
                    </p>

                    {q.options.map((option) => {
                      const selected = answers[index] === option;
                      const correct = q.correctAnswer;

                      let optionStyle = {};
                      if (isSubmitted) {
                        if (option === correct)
                          optionStyle = { color: "green", fontWeight: "bold" };
                        else if (selected)
                          optionStyle = {
                            color: "red",
                            textDecoration: "line-through",
                          };
                      }

                      return (
                        <label style={{ display: "block", ...optionStyle }}>
                          <input
                            type="radio"
                            name={`q-${index}`}
                            checked={selected}
                            onChange={() =>
                              handleAnswerChange(index, option)
                            }
                            disabled={isSubmitted}
                          />
                          {option}
                        </label>
                      );
                    })}
                  </div>
                );
              })}

              {!feedback && (
                <button
                  onClick={handleSubmitAnswers}
                  style={styles.submitButton}
                >
                  Submit Answers
                </button>
              )}
            </div>
          )}

          {feedback && (
            <div style={styles.feedbackBox}>
              <h3>Results</h3>
              <p>Score: {feedback.score}</p>
              <p>{feedback.message}</p>

              {feedback.recommendations.length > 0 && (
                <ul>
                  {feedback.recommendations.map((rec) => (
                    <li>{rec}</li>
                  ))}
                </ul>
              )}

              <button style={styles.resetButton} onClick={() => setLevel(null)}>
                Take Another Quiz
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/* ------------------ STYLES ------------------ */

const styles = {
  container: {
    padding: "30px",
    maxWidth: "700px",
    margin: "auto",
    fontFamily: "Arial, sans-serif",
    backgroundColor: "#C3B1E1",
    borderRadius: "10px",
  },
  header: {
    textAlign: "center",
    color: "#007acc",
    marginBottom: "20px",
  },
  levelSelector: { textAlign: "center" },
  label: { fontWeight: "bold", marginBottom: "10px" },
  levelButton: {
    padding: "10px 20px",
    margin: "10px",
    backgroundColor: "#007acc",
    color: "white",
    borderRadius: "8px",
    cursor: "pointer",
  },
  quizBox: { marginTop: "20px" },
  input: {
    width: "100%",
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    marginBottom: "10px",
  },
  generateButton: {
    backgroundColor: "#007acc",
    color: "white",
    padding: "10px 15px",
    borderRadius: "6px",
    cursor: "pointer",
  },
  quizContainer: {
    marginTop: "20px",
    padding: "15px",
    backgroundColor: "#e6f4ff",
    borderRadius: "10px",
  },
  quizHeader: { color: "#007acc" },
  questionBlock: { marginBottom: "15px" },
  submitButton: {
    backgroundColor: "#28a745",
    color: "white",
    padding: "10px 15px",
    borderRadius: "6px",
    cursor: "pointer",
  },
  feedbackBox: {
    marginTop: "20px",
    padding: "15px",
    borderRadius: "10px",
    backgroundColor: "#fff",
    border: "1px solid #ccc",
  },
  resetButton: {
    marginTop: "15px",
    backgroundColor: "#007acc",
    color: "white",
    padding: "10px 15px",
    borderRadius: "6px",
  },
};

export default QuizGenerator;
