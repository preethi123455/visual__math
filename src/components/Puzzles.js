import React, { useEffect, useState } from "react";

const Puzzles = () => {
  const [challenge, setChallenge] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [userAnswer, setUserAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [leaderboard, setLeaderboard] = useState([
    { name: "Alice", score: 80 },
    { name: "Bob", score: 70 },
    { name: "Charlie", score: 60 },
    { name: "You", score: 0 },
  ]);
  const [message, setMessage] = useState("");

  const API_KEY = "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"; // Use this for testing only
  const MODEL_ID = "llama3-8b-8192";

  const fetchChallenge = async () => {
    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model: MODEL_ID,
          messages: [
            {
              role: "system",
              content: "You are an assistant that generates simple math puzzles. Provide a puzzle and its answer in the format: 'Puzzle: ... Answer: ...'.",
            },
            {
              role: "user",
              content: "Please provide a simple math puzzle suitable for a beginner.",
            },
          ],
          temperature: 0.7,
          max_tokens: 100,
        }),
      });

      if (!response.ok) {
        throw new Error(`API responded with status ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      const puzzleMatch = content.match(/Puzzle:\s*(.+)/);
      const answerMatch = content.match(/Answer:\s*(.+)/);

      if (puzzleMatch && answerMatch) {
        setChallenge(puzzleMatch[1].trim());
        setCorrectAnswer(answerMatch[1].trim());
      } else {
        setChallenge("Oops! Puzzle format was incorrect.");
        setCorrectAnswer("");
      }
    } catch (error) {
      console.error("Error fetching puzzle:", error);
      setChallenge("Error loading puzzle. Please try again.");
      setCorrectAnswer("");
    }
  };

  useEffect(() => {
    fetchChallenge();
    const stored = JSON.parse(localStorage.getItem("leaderboard")) || leaderboard;
    setLeaderboard(stored);
    const yourEntry = stored.find((entry) => entry.name === "You");
    setScore(yourEntry ? yourEntry.score : 0);
  }, []);

  const updateLeaderboard = (newScore) => {
    const updated = leaderboard.map((entry) =>
      entry.name === "You" ? { ...entry, score: newScore } : entry
    );
    updated.sort((a, b) => b.score - a.score);
    setLeaderboard(updated);
    localStorage.setItem("leaderboard", JSON.stringify(updated));

    const rank = updated.findIndex((entry) => entry.name === "You") + 1;
    let motivation = `You're currently ranked ${rank}. Keep going!`;
    if (rank === 1) motivation = "You're at the top! Fantastic work!";
    else if (rank <= 3) motivation = "You're in the top 3! Great job!";
    setMessage(motivation);
  };

  const handleSubmit = () => {
    if (userAnswer.trim().toLowerCase() === correctAnswer.toLowerCase()) {
      const newScore = score + 10;
      setScore(newScore);
      updateLeaderboard(newScore);
      alert("✅ Correct! Here's a new puzzle.");
      setUserAnswer("");
      fetchChallenge();
    } else {
      alert("❌ Incorrect. Try again!");
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Gamified Math Challenges</h1>

      <div style={styles.card}>
        <h2 style={styles.subheading}>Puzzle</h2>
        <p style={styles.puzzle}>{challenge}</p>
        <input
          type="text"
          placeholder="Enter your answer"
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          style={styles.input}
        />
        <button onClick={handleSubmit} style={styles.button}>
          Submit
        </button>
        <p style={styles.score}>Your Score: {score}</p>
        {message && <p style={styles.message}>{message}</p>}
      </div>

      <div style={styles.leaderboard}>
        <h2 style={styles.subheading}>Leaderboard</h2>
        {leaderboard.map((entry, index) => (
          <div key={index} style={styles.leaderEntry}>
            {index + 1}. {entry.name}: {entry.score} pts
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: "#C3B1E1",
    minHeight: "100vh",
    padding: "20px",
    fontFamily: "'Segoe UI', sans-serif",
  },
  header: {
    textAlign: "center",
    color: "#007acc",
    marginBottom: "20px",
  },
  card: {
    backgroundColor: "#ffffff",
    maxWidth: "600px",
    margin: "0 auto 20px",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
  },
  subheading: {
    textAlign: "center",
    color: "#005f99",
    marginBottom: "10px",
  },
  puzzle: {
    fontSize: "18px",
    color: "#333",
    marginBottom: "15px",
    textAlign: "center",
  },
  input: {
    width: "100%",
    padding: "10px",
    borderRadius: "5px",
    border: "1px solid #ccc",
    marginBottom: "10px",
  },
  button: {
    backgroundColor: "#007acc",
    color: "#fff",
    border: "none",
    padding: "10px 20px",
    borderRadius: "5px",
    cursor: "pointer",
    width: "100%",
  },
  score: {
    textAlign: "center",
    fontWeight: "bold",
    marginTop: "15px",
  },
  message: {
    textAlign: "center",
    color: "#28a745",
    marginTop: "10px",
  },
  leaderboard: {
    maxWidth: "600px",
    margin: "0 auto",
    backgroundColor: "#f9f9f9",
    padding: "15px",
    borderRadius: "10px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
  },
  leaderEntry: {
    padding: "5px 0",
    fontSize: "16px",
  },
};

export default Puzzles;
