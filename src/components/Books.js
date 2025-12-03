import React, { useState, useEffect } from "react";
import axios from "axios";

const App = () => {
  const [topic, setTopic] = useState("");
  const [bookContent, setBookContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voice, setVoice] = useState(null);

  // Load voice properly even if getVoices is empty initially
  useEffect(() => {
    const waitForVoices = () => {
      return new Promise((resolve) => {
        let voices = speechSynthesis.getVoices();
        if (voices.length) {
          resolve(voices);
        } else {
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
      const preferredVoice =
        voices.find((v) =>
          v.name.toLowerCase().includes("female") ||
          v.name.toLowerCase().includes("zira")
        ) || voices[0];
      setVoice(preferredVoice);
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
      const response = await axios.post(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          model: "llama3-8b-8192",
          messages: [
            {
              role: "system",
              content:
                "You are a helpful assistant that provides textbook-style explanations on mathematics topics.",
            },
            {
              role: "user",
              content: `Provide a textbook-style explanation for the topic: "${topic}".`,
            },
          ],
          temperature: 0.7,
        },
        {
          headers: {
            Authorization:
              "Bearer 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",
            "Content-Type": "application/json",
          },
        }
      );

      const reply = response.data.choices[0].message.content;
      setBookContent(reply);
    } catch (error) {
      console.error("Error fetching content:", error);
      alert("Failed to fetch book content.");
    } finally {
      setLoading(false);
    }
  };

  const handleReadAloud = () => {
    if (!bookContent || !voice) {
      alert("Voice not ready yet. Please try again.");
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

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial", maxWidth: "800px", margin: "auto" }}>
      <h1 style={{ textAlign: "center", marginBottom: "1.5rem" }}>📚 Math Topic Reader</h1>

      <input
        type="text"
        value={topic}
        placeholder="Enter a math topic..."
        onChange={(e) => setTopic(e.target.value)}
        style={{
          padding: "10px",
          width: "100%",
          marginBottom: "1rem",
          borderRadius: "5px",
          border: "1px solid #ccc",
        }}
      />

      <button
        onClick={fetchBookContent}
        style={{
          padding: "10px 20px",
          marginBottom: "1rem",
          background: "#28a745",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        {loading ? "Loading..." : "Generate Explanation"}
      </button>

      {bookContent && (
        <div style={{ marginTop: "2rem" }}>
          <h2>📖 Explanation:</h2>
          <pre
            style={{
              whiteSpace: "pre-wrap",
              lineHeight: 1.6,
              background: "#f8f9fa",
              padding: "1rem",
              borderRadius: "5px",
              border: "1px solid #ddd",
              fontSize: "16px",
            }}
          >
            {bookContent}
          </pre>

          <div style={{ marginTop: "1rem" }}>
            {!isSpeaking ? (
              <button
                onClick={handleReadAloud}
                style={{
                  background: "#007bff",
                  color: "white",
                  padding: "10px 20px",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  marginRight: "10px",
                }}
              >
                🔊 Read Aloud
              </button>
            ) : (
              <button
                onClick={stopReading}
                style={{
                  background: "#dc3545",
                  color: "white",
                  padding: "10px 20px",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                ⛔ Stop Reading
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
