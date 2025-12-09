import React, { useState, useEffect } from "react";
import axios from "axios";

const MathTopicReader = () => {
  const [topic, setTopic] = useState("");
  const [bookContent, setBookContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voice, setVoice] = useState(null);

  // Your backend URL
  const BACKEND_URL = "https://visual-math-oscg.onrender.com/generate-quiz";

  // Load voice properly
  useEffect(() => {
    const waitForVoices = () => {
      return new Promise((resolve) => {
        let voices = speechSynthesis.getVoices();
        if (voices.length) resolve(voices);
        else {
          const interval = setInterval(() => {
            voices = speechSynthesis.getVoices();
            if (voices.length) {
              clearInterval(interval);
              resolve(voices);
            }
          }, 100);
        }
      });
    };

    waitForVoices().then((voices) => {
      const preferred =
        voices.find((v) => v.name.toLowerCase().includes("female")) || voices[0];
      setVoice(preferred);
    });
  }, []);

  const fetchBookContent = async () => {
    if (!topic.trim()) {
      alert("Please enter a math topic.");
      return;
    }

    setLoading(true);
    setBookContent("");

    try {
      const response = await axios.post(BACKEND_URL, {
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant that provides textbook-style explanations on mathematics topics. Explain with examples and clear steps.",
          },
          {
            role: "user",
            content: `Provide a textbook-style math explanation for the topic: "${topic}"`,
          },
        ],
      });

      const reply = response.data.choices[0].message.content;
      setBookContent(reply);
    } catch (err) {
      console.error("Error fetching content:", err);
      alert("Failed to fetch math explanation.");
    }

    setLoading(false);
  };

  const handleReadAloud = () => {
    if (!bookContent || !voice) {
      alert("Voice not ready yet.");
      return;
    }

    const utterance = new SpeechSynthesisUtterance(bookContent);
    utterance.voice = voice;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);

    speechSynthesis.speak(utterance);
  };

  const stopReading = () => {
    speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const styles = {
    container: {
      padding: "2rem",
      fontFamily: "Arial",
      maxWidth: "800px",
      margin: "auto",
    },
    input: {
      padding: "10px",
      width: "100%",
      marginBottom: "1rem",
      borderRadius: "5px",
      border: "1px solid #ccc",
    },
    button: {
      padding: "10px 20px",
      marginBottom: "1rem",
      background: "#28a745",
      color: "white",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer",
    },
    contentBox: {
      whiteSpace: "pre-wrap",
      lineHeight: 1.6,
      background: "#f8f9fa",
      padding: "1rem",
      borderRadius: "5px",
      border: "1px solid #ddd",
      fontSize: "16px",
    },
    readButton: {
      background: "#007bff",
      color: "white",
      padding: "10px 20px",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer",
      marginRight: "10px",
    },
    stopButton: {
      background: "#dc3545",
      color: "white",
      padding: "10px 20px",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer",
    },
  };

  return (
    <div style={styles.container}>
      <h1 style={{ textAlign: "center", marginBottom: "1.5rem" }}>
        📚 Math Topic Reader
      </h1>

      <input
        type="text"
        placeholder="Enter a math topic..."
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        style={styles.input}
      />

      <button onClick={fetchBookContent} style={styles.button}>
        {loading ? "Loading..." : "Generate Explanation"}
      </button>

      {bookContent && (
        <div style={{ marginTop: "2rem" }}>
          <h2>📖 Explanation:</h2>
          <pre style={styles.contentBox}>{bookContent}</pre>

          {!isSpeaking ? (
            <button onClick={handleReadAloud} style={styles.readButton}>
              🔊 Read Aloud
            </button>
          ) : (
            <button onClick={stopReading} style={styles.stopButton}>
              ⛔ Stop Reading
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default MathTopicReader;
