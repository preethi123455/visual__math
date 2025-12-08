import React, { useState } from "react";

const QuizGenerator = () => {
  const BACKEND_URL = "https://your-backend-url.com"; // 🔥 Replace after deployment

  const [level, setLevel] = useState(null);
  const [userInput, setUserInput] = useState("");
  const [quiz, setQuiz] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [answers, setAnswers] = useState({});
  const [feedback, setFeedback] = useState(null);

  const handleLevelSelect = (lvl) => {
    setLevel(lvl);
    setUserInput("");
    setQuiz([]);
    setAnswers({});
    setFeedback(null);
  };

  const handleContentSubmit = async () => {
    if (!userInput.trim()) return setError("Enter a topic.");

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${BACKEND_URL}/api/generate-quiz`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: userInput, level }),
      });

      const data = await response.json();
      setQuiz(data.quiz);
    } catch (err) {
      setError("Quiz generation failed");
    }

    setLoading(false);
  };

  const handleSubmitAnswers = () => {
    let correct = 0;

    quiz.forEach((q, i) => {
      if (answers[i] === q.correctAnswer) correct++;
    });

    setFeedback({
      score: `${correct} / ${quiz.length}`,
      message: correct === quiz.length ? "Great job!" : "Keep practicing!",
    });
  };

  return (
    <div style={{ padding: 20 }}>
      {!level ? (
        <>
          <h2>Select a level:</h2>
          {["Beginner", "Intermediate", "Advanced"].map((lvl) => (
            <button key={lvl} onClick={() => handleLevelSelect(lvl)}>
              {lvl}
            </button>
          ))}
        </>
      ) : (
        <>
          <input
            placeholder="Enter topic"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
          />

          <button onClick={handleContentSubmit}>
            {loading ? "Generating..." : "Generate Quiz"}
          </button>

          {quiz.map((q, i) => (
            <div key={i}>
              <strong>{q.question}</strong>
              {q.options.map((opt) => (
                <label>
                  <input
                    type="radio"
                    name={"q" + i}
                    onChange={() => setAnswers({ ...answers, [i]: opt })}
                  />
                  {opt}
                </label>
              ))}
            </div>
          ))}

          {quiz.length > 0 && !feedback && (
            <button onClick={handleSubmitAnswers}>Submit</button>
          )}

          {feedback && (
            <div>
              <h3>Score: {feedback.score}</h3>
              <p>{feedback.message}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default QuizGenerator;
