import React, { useState } from "react";

const QuizGenerator = () => {
  const groqApiKey = "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";
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
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${groqApiKey}`,
        },
        body: JSON.stringify({
          model: "llama3-8b-8192",
          messages: [
            {
              role: "system",
              content: `Generate a multiple-choice quiz with 3 ${level.toLowerCase()}-level math questions on the given topic.
                        Format the response as a JSON array. Each object should have:
                        - "question": string
                        - "options": array of 4 strings
                        - "correctAnswer": string`,
            },
            { role: "user", content: userInput },
          ],
          temperature: 0.7,
          max_tokens: 1024,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const match = data.choices[0].message.content.match(/\[([\s\S]*)\]/);
      if (!match) throw new Error("Invalid JSON format received.");
      const parsedQuiz = JSON.parse(match[0]);

      setQuiz(parsedQuiz);
      setAnswers({});
    } catch (error) {
      console.error("Error generating quiz:", error);
      setError(error.message || "Failed to generate quiz. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionIndex, selectedOption) => {
    setAnswers({ ...answers, [questionIndex]: selectedOption });
  };

  const handleSubmitAnswers = () => {
    let correctCount = 0;
    let recommendations = [];

    quiz.forEach((q, index) => {
      if (answers[index] === q.correctAnswer) {
        correctCount++;
      } else {
        recommendations.push(userInput);
      }
    });

    setFeedback({
      score: `${correctCount} / ${quiz.length}`,
      message:
        correctCount === quiz.length
          ? "Great job! Keep it up!"
          : "You can improve! Here are some suggestions.",
      recommendations: [...new Set(recommendations)].map(
        (topic) => `Consider learning more about ${topic}.`
      ),
    });
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>Visualizing Math: AI Quiz Generator</h2>

      {!level ? (
        <div style={styles.levelSelector}>
          <p style={styles.label}>Choose your level:</p>
          <button style={styles.levelButton} onClick={() => handleLevelSelect("Beginner")}>
            Beginner
          </button>
          <button style={styles.levelButton} onClick={() => handleLevelSelect("Intermediate")}>
            Intermediate
          </button>
          <button style={styles.levelButton} onClick={() => handleLevelSelect("Advanced")}>
            Advanced
          </button>
        </div>
      ) : (
        <div style={styles.quizBox}>
          <p style={styles.label}>Enter a math topic for {level} level:</p>
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
                const isCorrect = answers[index] === q.correctAnswer;
                const isSubmitted = feedback !== null;

                return (
                  <div key={index} style={styles.questionBlock}>
                    <p><strong>{q.question}</strong></p>
                    {q.options.map((option, optionIndex) => {
                      const selected = answers[index] === option;
                      const correctAnswer = q.correctAnswer;

                      let optionStyle = {};
                      if (isSubmitted) {
                        if (option === correctAnswer) {
                          optionStyle = { color: "green", fontWeight: "bold" };
                        } else if (selected && option !== correctAnswer) {
                          optionStyle = { color: "red", textDecoration: "line-through" };
                        }
                      }

                      return (
                        <label
                          key={optionIndex}
                          style={{ display: "block", marginBottom: "5px", ...optionStyle }}
                        >
                          <input
                            type="radio"
                            name={`question-${index}`}
                            value={option}
                            checked={selected}
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
                <button onClick={handleSubmitAnswers} style={styles.submitButton}>
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
                <div>
                  <h4>Suggestions:</h4>
                  <ul>
                    {feedback.recommendations.map((rec, index) => (
                      <li key={index}>{rec}</li>
                    ))}
                  </ul>
                </div>
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

// Internal CSS styles
const styles = {
  container: {
    padding: "30px",
    maxWidth: "700px",
    margin: "auto",
    fontFamily: "Arial, sans-serif",
    backgroundColor: "#C3B1E1",
    color: "#000",
    borderRadius: "10px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
  },
  header: {
    textAlign: "center",
    color: "#007acc",
    marginBottom: "20px",
  },
  levelSelector: {
    textAlign: "center",
  },
  label: {
    fontWeight: "bold",
    marginBottom: "10px",
  },
  levelButton: {
    padding: "10px 20px",
    margin: "10px",
    backgroundColor: "#007acc",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "16px",
  },
  quizBox: {
    marginTop: "20px",
  },
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
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  error: {
    color: "red",
    marginTop: "10px",
  },
  quizContainer: {
    marginTop: "20px",
    padding: "15px",
    backgroundColor: "#e6f4ff",
    borderRadius: "10px",
  },
  quizHeader: {
    color: "#007acc",
    marginBottom: "15px",
  },
  questionBlock: {
    marginBottom: "15px",
  },
  submitButton: {
    backgroundColor: "#28a745",
    color: "white",
    padding: "10px 15px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    marginTop: "10px",
  },
  feedbackBox: {
    marginTop: "20px",
    padding: "15px",
    backgroundColor: "#fff",
    borderRadius: "10px",
    border: "1px solid #ccc",
  },
  resetButton: {
    marginTop: "15px",
    backgroundColor: "#007acc",
    color: "white",
    padding: "10px 15px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
};

export default QuizGenerator;
