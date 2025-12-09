import React, { useState } from "react";

const QuizGenerator = () => {
  // NO API KEY IN FRONTEND
  const BACKEND_URL = "https://visual-math-oscg.onrender.com/generate-quiz";

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
      const response = await fetch(BACKEND_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content: `Generate a multiple-choice quiz with 3 ${level.toLowerCase()}-level math questions.
              Format the response as a JSON array.
              Each object must contain:
              - "question"
              - "options" (array of 4)
              - "correctAnswer" (string)`,
            },
            { role: "user", content: userInput },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error("Backend error: " + response.status);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content?.trim();

      const jsonMatch = content.match(/\[([\s\S]*)]/);
      if (!jsonMatch) throw new Error("Invalid JSON received.");

      const parsedQuiz = JSON.parse(jsonMatch[0]);
      setQuiz(parsedQuiz);
    } catch (err) {
      setError(err.message || "Failed to generate quiz.");
    }

    setLoading(false);
  };

  const handleAnswerChange = (qIndex, option) => {
    setAnswers({ ...answers, [qIndex]: option });
  };

  const handleSubmitAnswers = () => {
    let correct = 0;
    let recommendations = [];

    quiz.forEach((q, index) => {
      if (answers[index] === q.correctAnswer) correct++;
      else recommendations.push(userInput);
    });

    setFeedback({
      score: `${correct} / ${quiz.length}`,
      message:
        correct === quiz.length
          ? "Excellent! You got everything correct!"
          : "Good try! Review the topics below.",
      recommendations: [...new Set(recommendations)].map(
        (topic) => `Study more about ${topic}.`
      ),
    });
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>Visualizing Math: AI Quiz Generator</h2>

      {!level ? (
        <div style={styles.levelSelector}>
          <p style={styles.label}>Choose your difficulty level:</p>

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
          <p style={styles.label}>Enter a math topic for {level} level:</p>

          <input
            type="text"
            style={styles.input}
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="e.g., Algebra, Geometry, Calculus"
          />

          <button
            style={styles.generateButton}
            onClick={handleContentSubmit}
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
                const correct = q.correctAnswer;

                return (
                  <div key={index} style={styles.questionBlock}>
                    <p>
                      <strong>{q.question}</strong>
                    </p>

                    {q.options.map((option) => {
                      const isSelected = answers[index] === option;

                      let style = {};
                      if (isSubmitted) {
                        if (option === correct) {
                          style = { color: "green", fontWeight: "bold" };
                        } else if (isSelected && option !== correct) {
                          style = {
                            color: "red",
                            textDecoration: "line-through",
                          };
                        }
                      }

                      return (
                        <label
                          key={option}
                          style={{ display: "block", marginBottom: 5, ...style }}
                        >
                          <input
                            type="radio"
                            name={`q-${index}`}
                            checked={isSelected}
                            onChange={() => handleAnswerChange(index, option)}
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
                <button style={styles.submitButton} onClick={handleSubmitAnswers}>
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
                <>
                  <h4>Recommended Topics:</h4>
                  <ul>
                    {feedback.recommendations.map((rec, i) => (
                      <li key={i}>{rec}</li>
                    ))}
                  </ul>
                </>
              )}

              <button
                style={styles.resetButton}
                onClick={() => setLevel(null)}
              >
                Take Another Quiz
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Internal CSS styles
const styles = {
  container: {
    padding: 30,
    maxWidth: 700,
    margin: "auto",
    backgroundColor: "#C3B1E1",
    borderRadius: 12,
    boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
    fontFamily: "Arial",
  },
  header: { textAlign: "center", color: "#007acc" },
  levelSelector: { textAlign: "center" },
  label: { fontWeight: "bold", marginBottom: 10 },
  levelButton: {
    padding: "10px 20px",
    margin: 10,
    backgroundColor: "#007acc",
    color: "white",
    borderRadius: 8,
    border: "none",
    cursor: "pointer",
  },
  quizBox: { marginTop: 20 },
  input: {
    width: "100%",
    padding: 12,
    borderRadius: 6,
    border: "1px solid #ccc",
    marginBottom: 10,
  },
  generateButton: {
    backgroundColor: "#007acc",
    color: "white",
    padding: "10px 15px",
    borderRadius: 6,
    border: "none",
    cursor: "pointer",
  },
  error: { color: "red", marginTop: 10 },
  quizContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#e6f4ff",
    borderRadius: 10,
  },
  quizHeader: { color: "#007acc" },
  questionBlock: { marginBottom: 20 },
  submitButton: {
    backgroundColor: "#28a745",
    color: "white",
    padding: "10px 15px",
    borderRadius: 6,
    cursor: "pointer",
  },
  feedbackBox: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "white",
    borderRadius: 10,
    border: "1px solid #ccc",
  },
  resetButton: {
    marginTop: 10,
    backgroundColor: "#007acc",
    color: "white",
    padding: "10px 15px",
    borderRadius: 6,
    cursor: "pointer",
  },
};

export default QuizGenerator;
