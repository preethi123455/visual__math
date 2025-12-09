import React, { useState } from "react";
import { motion } from "framer-motion";

const domains = [
  "Algebra Adventures",
  "Geometry Galaxy",
  "Calculus Conquest",
  "Probability Playground",
  "Number Theory Ninja",
  "Maths in Real Life",
];

const BACKEND_URL = "https://visual-math-oscg.onrender.com/ai-discussion"; // ✅ backend route

export default function GroupDiscussionForum() {
  const [selectedDomain, setSelectedDomain] = useState(null);
  const [meetLink, setMeetLink] = useState("");
  const [aiInsights, setAiInsights] = useState("");
  const [recommendedTopics, setRecommendedTopics] = useState("");
  const [customMeetLink, setCustomMeetLink] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [interestedCount, setInterestedCount] = useState({});

  const fetchAI = async (prompt) => {
    try {
      const res = await fetch(BACKEND_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();
      return data.reply;
    } catch (err) {
      console.error(err);
      return "AI failed to respond.";
    }
  };

  const createMeet = async (domain) => {
    if (!scheduledTime) {
      alert("Please choose a time before starting a meet!");
      return;
    }

    setSelectedDomain(domain);

    const roomName = domain.replace(/\s+/g, "") + "_" + Date.now();
    const generatedMeetLink = `https://meet.jit.si/${roomName}`;
    setMeetLink(generatedMeetLink);

    setInterestedCount((prev) => ({ ...prev, [domain]: 0 }));

    const insights = await fetchAI(
      `Give a short fun 20-word summary for a math meet on ${domain}.`
    );

    const topics = await fetchAI(
      `Give 3 short math discussion questions for domain: ${domain}.`
    );

    setAiInsights(insights);
    setRecommendedTopics(topics);
  };

  const handleThumbsUp = (domain) => {
    setInterestedCount((prev) => ({
      ...prev,
      [domain]: (prev[domain] || 0) + 1,
    }));
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🎓 Math Meet Quest</h1>
      <p style={styles.subtitle}>
        Pick a math world to explore. Start a Jitsi room with AI insights!
      </p>

      <input
        type="datetime-local"
        value={scheduledTime}
        onChange={(e) => setScheduledTime(e.target.value)}
        style={{ ...styles.input, marginBottom: "20px" }}
      />

      <div style={styles.grid}>
        {domains.map((domain, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.05 }}
            style={styles.card}
            onClick={() => createMeet(domain)}
          >
            <h2 style={styles.cardTitle}>{domain}</h2>
            <p style={styles.cardText}>🎯 Click to start & unlock AI topics</p>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleThumbsUp(domain);
              }}
              style={styles.likeButton}
            >
              👍 {interestedCount[domain] || 0}
            </button>
          </motion.div>
        ))}
      </div>

      {selectedDomain && (
        <motion.div
          style={styles.resultCard}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <h2 style={styles.resultTitle}>🧠 {selectedDomain} Discussion Arena</h2>

          <input type="text" value={meetLink} readOnly style={styles.input} />

          <p style={styles.sectionText}>
            🕒 Scheduled Time: {new Date(scheduledTime).toLocaleString()}
          </p>

          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>✨ AI Insights</h3>
            <p style={styles.sectionText}>{aiInsights}</p>
          </div>

          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>💡 Suggested Topics</h3>
            <p style={styles.sectionText}>{recommendedTopics}</p>
          </div>

          <a href={meetLink} target="_blank" rel="noopener noreferrer">
            <button style={styles.button}>🚀 Join Math Meet</button>
          </a>
        </motion.div>
      )}

      <motion.div style={styles.resultCard}>
        <h2 style={styles.resultTitle}>📌 Add Your Own Meet</h2>

        <input
          type="text"
          placeholder="Enter Jitsi Meet link"
          value={customMeetLink}
          onChange={(e) => setCustomMeetLink(e.target.value)}
          style={styles.input}
        />

        {customMeetLink && (
          <a
            href={
              customMeetLink.startsWith("https://meet.jit.si/")
                ? customMeetLink
                : `https://meet.jit.si/${customMeetLink}`
            }
            target="_blank"
            rel="noopener noreferrer"
          >
            <button style={styles.button}>🔗 Join Custom Meet</button>
          </a>
        )}
      </motion.div>
    </div>
  );
}

// ---------------- STYLES ----------------

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#121212",
    color: "#ffffff",
    padding: "20px",
    textAlign: "center",
  },
  title: { fontSize: "2.5rem", fontWeight: "bold", color: "#facc15" },
  subtitle: { fontSize: "1.2rem", color: "#9ca3af", marginBottom: "20px" },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "20px",
  },

  card: {
    backgroundColor: "#1f2937",
    border: "2px solid #facc15",
    padding: "20px",
    borderRadius: "10px",
    cursor: "pointer",
  },

  cardTitle: { fontSize: "1.5rem", fontWeight: "bold", color: "#facc15" },
  cardText: { color: "#d1d5db" },

  likeButton: {
    marginTop: "10px",
    background: "none",
    border: "none",
    color: "#facc15",
    cursor: "pointer",
    fontSize: "1.2rem",
  },

  resultCard: {
    backgroundColor: "#1f2937",
    border: "2px solid #facc15",
    padding: "20px",
    borderRadius: "10px",
    marginTop: "20px",
  },

  resultTitle: { fontSize: "1.8rem", fontWeight: "bold", color: "#facc15" },

  input: {
    backgroundColor: "#374151",
    color: "white",
    padding: "10px",
    borderRadius: "5px",
    border: "none",
    width: "80%",
    textAlign: "center",
    marginTop: "10px",
  },

  button: {
    backgroundColor: "#facc15",
    color: "#121212",
    padding: "10px 20px",
    borderRadius: "5px",
    fontWeight: "bold",
    cursor: "pointer",
    border: "none",
    marginTop: "10px",
  },

  section: { marginTop: "15px" },
  sectionTitle: { fontSize: "1.2rem", fontWeight: "bold", color: "#facc15" },
  sectionText: { color: "#d1d5db" },
};
