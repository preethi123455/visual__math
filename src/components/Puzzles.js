import React, { useEffect, useState } from "react";

const Puzzles = () => {
  // Your backend endpoint (NO API KEY IN FRONTEND)
  const BACKEND_URL = "https://visual-math-oscg.onrender.com/generate-puzzle";

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

  // Fetch puzzle from backend (backend already calls Groq)
  const fetchChallenge = async () => {
    try {
      const res = await fetch(BACKEND_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) throw new Error("Backend error");

      const data = await res.json();

      // Backend returns: { puzzle: "...", answer: "..." }
      if (data.puzzle && data.answer) {
        setChallenge(data.puzzle);
        setCorrectAnswer(data.answer.trim());
      } else {
        setChallenge("❌ Invalid puzzle format received.");
        setCorrectAnswer("");
      }
    } catch (error) {
      console.error("Puzzle Error:", error);
      setChallenge("❌ Could not load puzzle. Try again.");
    }
  };

  useEffect(() => {
    fetchChallenge();

    const saved = JSON.parse(localStorage.getItem("leaderboard")) || leaderboard;
    setLeaderboard(saved);

    const entry = saved.find((e) => e.name === "You");
    setScore(entry ? entry.score : 0);
  }, []);

  // Update leaderboard ranking
  const updateLeaderboard = (newScore) => {
    const updated = leaderboard.map((entry) =>
      entry.name === "You" ? { ...entry, score: newScore } : entry
    );

    updated.sort((a, b) => b.score - a.score);
    setLeaderboard(updated);
    localStorage.setItem("leaderboard", JSON.stringify(updated));

    const rank = updated.findIndex((e) => e.name === "You") + 1;

    let msg = `🏆 You are Ranked #${rank}!`;

    if (rank === 1) msg = "🔥 You're at the TOP! Amazing!";
    else if (rank <= 3) msg = "🎉 You're in the Top 3 — Great job!";

    setMessage(msg);
  };

  const handleSubmit = () => {
    if (!userAnswer.trim()) {
      alert("Please enter an answer!");
      return;
    }

    if (userAnswer.trim().toLowerCase() === correctAnswer.toLowerCase()) {
      const newScore = score + 10;
      setScore(newScore);
      updateLeaderboard(newScore);
      alert("✅ Correct! Here's a new puzzle!");

      setUserAnswer("");
      fetchChallenge();
    } else {
      alert("❌ Incorrect! Try again.");
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>🎯 Gamified Math Challenges</h1>

      <div style={styles.card}>
        <h2 style={styles.subheading}>🧩 Puzzle of the Day</h2>
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

        <p style={styles.score}>⭐ Your Score: {score}</p>

        {message && <p style={styles.message}>{message}</p>}
      </div>

      <div style={styles.leaderboard}>
        <h2 style={styles.subheading}>🏅 Leaderboard</h2>

        {leaderboard.map((entry, i) => (
          <div key={i} style={styles.leaderEntry}>
            {i + 1}. {entry.name}: {entry.score} pts
          </div>
        ))}
      </div>
    </div>
  );
};

// --------------------- STYLING ---------------------

const styles = {
  container: {
    backgroundColor: "#C3B1E1",
    minHeight: "100vh",
    padding: 20,
    fontFamily: "Segoe UI",
  },
  header: {
    textAlign: "center",
    color: "#007acc",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "white",
    maxWidth: 600,
    margin: "0 auto 20px",
    padding: 20,
    borderRadius: 10,
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
  },
  subheading: {
    textAlign: "center",
    color: "#005f99",
    marginBottom: 10,
  },
  puzzle: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 15,
    color: "#333",
  },
  input: {
    width: "100%",
    padding: 10,
    borderRadius: 5,
    border: "1px solid #ccc",
    marginBottom: 10,
  },
  button: {
    width: "100%",
    background: "#007acc",
    color: "white",
    padding: 10,
    borderRadius: 5,
    cursor: "pointer",
    fontWeight: "bold",
  },
  score: {
    textAlign: "center",
    marginTop: 15,
    fontWeight: "bold",
  },
  message: {
    textAlign: "center",
    marginTop: 10,
    color: "#28a745",
    fontWeight: "bold",
  },
  leaderboard: {
    maxWidth: 600,
    margin: "0 auto",
    padding: 15,
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
  },
  leaderEntry: {
    padding: "5px 0",
    fontSize: 16,
    borderBottom: "1px solid #ddd",
  },
};

export default Puzzles;
