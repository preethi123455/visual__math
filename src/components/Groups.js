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

const BACKEND_URL = "https://visual-math-oscg.onrender.com/ai-discussion";

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
    } catch {
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

    setAiInsights(
      await fetchAI(`Give a short fun 20-word summary for ${domain}.`)
    );

    setRecommendedTopics(
      await fetchAI(`Give 3 short math discussion questions for ${domain}.`)
    );
  };

  const handleThumbsUp = (domain) => {
    setInterestedCount((prev) => ({
      ...prev,
      [domain]: (prev[domain] || 0) + 1,
    }));
  };

  /* ---------------- GOOGLE CALENDAR LINK ---------------- */
  const getGoogleCalendarLink = () => {
    if (!scheduledTime || !meetLink) return "#";

    const start = new Date(scheduledTime).toISOString().replace(/-|:|\.\d+/g, "");
    const end = new Date(
      new Date(scheduledTime).getTime() + 60 * 60 * 1000
    )
      .toISOString()
      .replace(/-|:|\.\d+/g, "");

    const details = encodeURIComponent(
      `Join the math discussion:\n${meetLink}\n\nAI Insights:\n${aiInsights}`
    );

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      selectedDomain
    )}&dates=${start}/${end}&details=${details}`;
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🎓 Math Meet Quest</h1>

      <input
        type="datetime-local"
        value={scheduledTime}
        onChange={(e) => setScheduledTime(e.target.value)}
        style={{ ...styles.input, marginBottom: 20 }}
      />

      <div style={styles.grid}>
        {domains.map((domain) => (
          <motion.div
            key={domain}
            whileHover={{ scale: 1.05 }}
            style={styles.card}
            onClick={() => createMeet(domain)}
          >
            <h2 style={styles.cardTitle}>{domain}</h2>

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
        <motion.div style={styles.resultCard} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h2 style={styles.resultTitle}>{selectedDomain} Arena</h2>

          <input value={meetLink} readOnly style={styles.input} />

          <p>🕒 {new Date(scheduledTime).toLocaleString()}</p>

          <p>{aiInsights}</p>
          <p>{recommendedTopics}</p>

          <a href={meetLink} target="_blank" rel="noopener noreferrer">
            <button style={styles.button}>🚀 Join Meet</button>
          </a>

          {/* 🌟 GOOGLE CALENDAR BUTTON */}
          <a
            href={getGoogleCalendarLink()}
            target="_blank"
            rel="noopener noreferrer"
          >
            <button style={{ ...styles.button, background: "#34a853" }}>
              📅 Add to Google Calendar
            </button>
          </a>
        </motion.div>
      )}
    </div>
  );
}

/* ---------------- STYLES ---------------- */
const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#121212",
    color: "#ffffff",
    padding: "20px",
    textAlign: "center",
  },
  title: { fontSize: "2.5rem", color: "#facc15" },
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
  cardTitle: { color: "#facc15" },
  likeButton: {
    background: "none",
    border: "none",
    color: "#facc15",
    cursor: "pointer",
  },
  resultCard: {
    backgroundColor: "#1f2937",
    border: "2px solid #facc15",
    padding: "20px",
    borderRadius: "10px",
    marginTop: "20px",
  },
  resultTitle: { color: "#facc15" },
  input: {
    backgroundColor: "#374151",
    color: "white",
    padding: "10px",
    borderRadius: "5px",
    border: "none",
    width: "80%",
  },
  button: {
    backgroundColor: "#facc15",
    color: "#121212",
    padding: "10px 20px",
    borderRadius: "5px",
    fontWeight: "bold",
    cursor: "pointer",
    border: "none",
    margin: "10px",
  },
};
