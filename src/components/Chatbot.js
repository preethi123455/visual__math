import React, { useState, useRef } from "react";
import Tesseract from "tesseract.js";
import Select from "react-select";

const AIAssistant = () => {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hello! I'm your Math assistant. Ask me anything related to mathematics!",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("general"); // kept for future extension
  const [recording, setRecording] = useState(false);
  const [language, setLanguage] = useState({
    value: "english",
    label: "English",
  });

  const recognitionRef = useRef(null);

  const languagePrompts = {
    english: "Respond fully in English.",
    tamil: "Respond fully in Tamil.",
    hindi: "Respond fully in Hindi.",
    kannada: "Respond fully in Kannada.",
    malayalam: "Respond fully in Malayalam.",
  };

  const speakText = (text) => {
    if (!window.speechSynthesis) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang =
      {
        english: "en-US",
        tamil: "ta-IN",
        hindi: "hi-IN",
        kannada: "kn-IN",
        malayalam: "ml-IN",
      }[language.value] || "en-US";

    window.speechSynthesis.speak(utterance);
  };

  const isMathRelated = (text) => {
    const mathKeywords = [
      "math",
      "algebra",
      "geometry",
      "calculus",
      "trigonometry",
      "integral",
      "derivative",
      "theorem",
      "equation",
      "logarithm",
      "matrix",
      "probability",
      "statistics",
      "function",
      "number",
      "prime",
      "maths",
    ];

    return mathKeywords.some((keyword) =>
      text.toLowerCase().includes(keyword)
    );
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    if (!isMathRelated(input)) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Please ask only math-related questions!",
        },
      ]);
      setInput("");
      return;
    }

    const newMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    setLoading(true);

    try {
      // include previous chat history + new message
      const currentMessages = [...messages, newMessage];

      const response = await fetch(
        "https://visual-math-oscg.onrender.com/generate-quiz",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            // backend expects { messages }
            messages: [
              {
                role: "system",
                content: `You are a math learning assistant. 
Only answer mathematics topics.
Provide explanations with clear steps and examples.
${languagePrompts[language.value]}`,
              },
              ...currentMessages,
            ],
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Backend error: ${response.status}`);
      }

      const data = await response.json();

      const botReply =
        data.choices?.[0]?.message?.content ||
        "Sorry, I couldn't generate a response.";

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: botReply },
      ]);
    } catch (err) {
      console.error("Error:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Error connecting to AI service. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleStartRecording = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech Recognition not supported in your browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.lang =
      {
        english: "en-US",
        tamil: "ta-IN",
        hindi: "hi-IN",
        kannada: "kn-IN",
        malayalam: "ml-IN",
      }[language.value] || "en-US";

    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput((prev) => (prev ? prev + " " + transcript : transcript));
    };

    recognition.onerror = (e) => {
      console.error("Speech recognition error:", e);
      setRecording(false);
    };

    recognition.onend = () => {
      setRecording(false);
    };

    recognition.start();
    setRecording(true);
  };

  const handleStopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setRecording(false);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    try {
      const result = await Tesseract.recognize(file, "eng");
      setInput((prev) => (prev ? prev + " " + result.data.text : result.data.text));
    } catch (err) {
      console.error("OCR error:", err);
    }
    setLoading(false);
  };

  return (
    <div style={{ height: "calc(100vh - 140px)", padding: 20 }}>
      {/* Top bar */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h2 style={{ color: "#6a0dad" }}>AI Learning Assistant</h2>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button
            onClick={() => setMode("general")}
            style={{
              padding: "10px 15px",
              background: mode === "general" ? "#6a0dad" : "#f0e6ff",
              color: mode === "general" ? "white" : "#6a0dad",
              borderRadius: 6,
              border: "none",
              cursor: "pointer",
            }}
          >
            General Help
          </button>

          <Select
            options={[
              { value: "english", label: "English" },
              { value: "tamil", label: "Tamil" },
              { value: "hindi", label: "Hindi" },
              { value: "kannada", label: "Kannada" },
              { value: "malayalam", label: "Malayalam" },
            ]}
            value={language}
            onChange={setLanguage}
            styles={{
              container: (base) => ({ ...base, width: 150 }),
            }}
          />
        </div>
      </div>

      {/* Chat area */}
      <div
        style={{
          marginTop: 15,
          background: "#C3B1E1",
          borderRadius: 10,
          height: "calc(100% - 70px)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Messages */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: 20,
          }}
        >
          {messages.map((msg, idx) => (
            <div
              key={idx}
              style={{
                background: msg.role === "user" ? "#e6f0ff" : "#eaeaea",
                alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                padding: "10px 15px",
                borderRadius: 8,
                marginBottom: 10,
                maxWidth: "80%",
                position: "relative",
              }}
            >
              {msg.content}

              {msg.role === "assistant" && (
                <button
                  onClick={() => speakText(msg.content)}
                  style={{
                    position: "absolute",
                    right: 5,
                    bottom: 5,
                    background: "#6a0dad",
                    color: "white",
                    padding: "3px 8px",
                    borderRadius: 5,
                    border: "none",
                    cursor: "pointer",
                    fontSize: 12,
                  }}
                >
                  🔊
                </button>
              )}
            </div>
          ))}

          {loading && (
            <div
              style={{
                padding: 10,
                background: "#eaeaea",
                borderRadius: 8,
              }}
            >
              Thinking...
            </div>
          )}
        </div>

        {/* Input area */}
        <div
          style={{
            display: "flex",
            gap: 10,
            padding: 15,
            background: "white",
            alignItems: "center",
          }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask a math question..."
            style={{
              flex: 1,
              padding: "12px 15px",
              borderRadius: 8,
              border: "1px solid #ddd",
            }}
          />

          <button
            onClick={handleSend}
            disabled={loading}
            style={{
              padding: "12px 18px",
              background: "#6a0dad",
              color: "white",
              borderRadius: 8,
              border: "none",
              cursor: "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            Send
          </button>

          <button
            onClick={recording ? handleStopRecording : handleStartRecording}
            style={{
              padding: "10px 12px",
              background: recording ? "#ff4d4d" : "#f0e6ff",
              color: recording ? "white" : "#6a0dad",
              borderRadius: 8,
              border: "none",
              cursor: "pointer",
            }}
          >
            {recording ? "⏹ Stop" : "🎙 Speak"}
          </button>

          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            style={{ maxWidth: 180 }}
          />
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
