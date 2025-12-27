import React, { useState, useEffect } from "react";

const QuizGenerator = () => {
  const BACKEND_URL = "https://visual-math-oscg.onrender.com/generate-quiz";

  const [level, setLevel] = useState(null);
  const [userInput, setUserInput] = useState("");
  const [quiz, setQuiz] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [answers, setAnswers] = useState({});
  const [feedback, setFeedback] = useState(null);

  /* ---------------- GOOGLE CHARTS LOADER ---------------- */
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://www.gstatic.com/charts/loader.js";
    script.onload = () => {
      window.google.charts.load("current", { packages: ["corechart"] });
    };
    document.body.appendChild(script);
  }, []);

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
              - "options"
              - "correctAnswer"`,
            },
            { role: "user", content: userInput },
          ],
        }),
      });

      const data = await response.json();
      const content = data.choices[0].message.content;
      const jsonMatch = content.match(/\[([\s\S]*)]/);
      setQuiz(JSON.parse(jsonMatch[0]));
    } catch (err) {
      setError("Failed to generate quiz.");
    }

    setLoading(false);
  };

  const handleAnswerChange = (qIndex, option) => {
    setAnswers({ ...answers, [qIndex]: option });
  };

  const drawChart = (correct, wrong) => {
    if (!window.google) return;

    const data = window.google.visualization.arrayToDataTable([
      ["Result", "Count"],
      ["Correct", correct],
      ["Wrong", wrong],
    ]);

    const options = {
      title: "Quiz Performance",
      colors: ["#28a745", "#dc3545"],
      pieHole: 0.4,
    };

    const chart = new window.google.visualization.PieChart(
      document.getElementById("chart_div")
    );
    chart.draw(data, options);
  };

  const handleSubmitAnswers = () => {
    let correct = 0;

    quiz.forEach((q, index) => {
      if (answers[index] === q.correctAnswer) correct++;
    });

    const wrong = quiz.length - correct;

    setFeedback({
      score: `${correct} / ${quiz.length}`,
      message:
        correct === quiz.length
          ? "Excellent! Perfect score!"
          : "Nice try! Review and try again.",
    });

    setTimeout(() => drawChart(correct, wrong), 500);
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
          <input
            style={styles.input}
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Enter a math topic"
          />

          <button
            style={styles.generateButton}
            onClick={handleContentSubmit}
          >
            Generate Quiz
          </button>

          {quiz.map((q, index) => (
            <div key={index} style={styles.questionBlock}>
              <p><strong>{q.question}</strong></p>
              {q.options.map((opt) => (
                <label key={opt} style={{ display: "block" }}>
                  <input
                    type="radio"
                    name={`q-${index}`}
                    onChange={() => handleAnswerChange(index, opt)}
                  />
                  {opt}
                </label>
              ))}
            </div>
          ))}

          {quiz.length > 0 && !feedback && (
            <button
              style={styles.submitButton}
              onClick={handleSubmitAnswers}
            >
              Submit Answers
            </button>
          )}

          {feedback && (
            <div style={styles.feedbackBox}>
              <h3>Results</h3>
              <p>Score: {feedback.score}</p>
              <p>{feedback.message}</p>

              {/* 📊 GOOGLE CHART */}
              <div id="chart_div" style={{ width: "100%", height: "300px" }} />

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

/* Styles unchanged */
const styles = {
  container: {
    padding: 30,
    maxWidth: 700,
    margin: "auto",
    backgroundColor: "#C3B1E1",
    borderRadius: 12,
  },
  header: { textAlign: "center", color: "#007acc" },
  levelSelector: { textAlign: "center" },
  label: { fontWeight: "bold" },
  levelButton: {
    padding: 10,
    margin: 10,
    backgroundColor: "#007acc",
    color: "white",
    borderRadius: 8,
    border: "none",
  },
  quizBox: { marginTop: 20 },
  input: { width: "100%", padding: 10, marginBottom: 10 },
  generateButton: {
    backgroundColor: "#007acc",
    color: "white",
    padding: 10,
    borderRadius: 6,
  },
  questionBlock: { marginTop: 15 },
  submitButton: {
    backgroundColor: "#28a745",
    color: "white",
    padding: 10,
    borderRadius: 6,
  },
  feedbackBox: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "white",
    borderRadius: 10,
  },
  resetButton: {
    marginTop: 10,
    backgroundColor: "#007acc",
    color: "white",
    padding: 10,
    borderRadius: 6,
  },
};

export default QuizGenerator;
