import React, { useState, useRef } from 'react';
import Tesseract from 'tesseract.js';
import Select from 'react-select';

const AIAssistant = () => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hello! I'm your Math assistant. Ask me anything related to mathematics!" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('general');
  const [recording, setRecording] = useState(false);
  const [language, setLanguage] = useState({ value: 'english', label: 'English' });

  const recognitionRef = useRef(null);

  const languagePrompts = {
    english: 'Respond fully in English.',
    tamil: 'Respond fully in Tamil.',
    hindi: 'Respond fully in Hindi.',
    kannada: 'Respond fully in Kannada without English.',
    malayalam: 'Respond fully in Malayalam.',
  };

  const speakText = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = {
      english: 'en-US',
      tamil: 'ta-IN',
      hindi: 'hi-IN',
      kannada: 'kn-IN',
      malayalam: 'ml-IN'
    }[language.value] || 'en-US';

    window.speechSynthesis.speak(utterance);
  };

  // Math filter
  const isMathRelated = (text) => {
    const mathKeywords = [
      'math','algebra','geometry','calculus','trigonometry','integral','derivative','theorem',
      'equation','logarithm','matrix','probability','statistics','function','number','prime','maths'
    ];
    return mathKeywords.some(keyword => text.toLowerCase().includes(keyword));
  };

  // -----------------------------------------
  // SEND MESSAGE
  // -----------------------------------------
  const handleSend = async () => {
    if (!input.trim()) return;

    if (!isMathRelated(input)) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Please ask only math-related questions!'
      }]);
      setInput('');
      return;
    }

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const currentMessages = [...messages, userMessage];

      // CALL YOUR BACKEND (NOT Groq directly)
      const response = await fetch("https://visual-math-oscg.onrender.com/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: mode === "general" ? "llama-3.1-8b-instant" : "llama-3.3-70b-versatile",
          messages: [
            {
              role: "system",
              content: `You are a math learning assistant. 
              Only answer math-related questions. 
              Give explanations with examples. 
              ${languagePrompts[language.value] || ""}`
            },
            ...currentMessages
          ],
          temperature: 0.7,
          max_tokens: 1024
        })
      });

      if (!response.ok) {
        throw new Error("API error: " + response.status);
      }

      const data = await response.json();
      const assistantText =
        data.choices?.[0]?.message?.content ||
        "Sorry, I couldn't generate a response.";

      setMessages(prev => [...prev, { role: "assistant", content: assistantText }]);
    } catch (error) {
      console.error("Backend error:", error);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again."
      }]);
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------------------
  // SPEECH RECOGNITION
  // -----------------------------------------
  const handleStartRecording = () => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      alert("Speech Recognition not supported in your browser.");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.lang = {
      english: "en-US",
      tamil: "ta-IN",
      hindi: "hi-IN",
      kannada: "kn-IN",
      malayalam: "ml-IN",
    }[language.value];

    recognition.onresult = (event) => {
      setInput(prev => prev + " " + event.results[0][0].transcript);
    };
    recognition.onerror = (e) => console.error("Speech error:", e);

    recognition.start();
    setRecording(true);
  };

  const handleStopRecording = () => {
    recognitionRef.current?.stop();
    setRecording(false);
  };

  // -----------------------------------------
  // IMAGE OCR
  // -----------------------------------------
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    try {
      const { data: { text } } = await Tesseract.recognize(file, "eng");
      setInput(prev => prev + " " + text);
    } catch (err) {
      console.error("OCR error:", err);
    }
    setLoading(false);
  };

  return (
    <div style={{ height: "calc(100vh - 140px)", padding: "20px", fontFamily: "Arial" }}>
      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ color: "#6a0dad" }}>AI Learning Assistant</h2>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button
            onClick={() => setMode("general")}
            style={{
              padding: "10px 15px",
              border: "none",
              borderRadius: "6px",
              background: mode === "general" ? "#6a0dad" : "#f0e6ff",
              color: mode === "general" ? "white" : "#6a0dad",
              fontWeight: "bold",
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
            styles={{ container: base => ({ ...base, width: 150 }) }}
          />
        </div>
      </div>

      {/* CHAT AREA */}
      <div style={{
        marginTop: "15px",
        border: "1px solid #ddd",
        borderRadius: "10px",
        display: "flex",
        flexDirection: "column",
        height: "calc(100% - 70px)"
      }}>
        <div style={{ flex: 1, padding: 20, background: "#C3B1E1", overflowY: "auto" }}>
          {messages.map((msg, i) => (
            <div key={i} style={{
              background: msg.role === "user" ? "#e6f0ff" : "#eaeaea",
              alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
              padding: "10px 15px",
              borderRadius: 8,
              marginBottom: 10,
              maxWidth: "80%",
              position: "relative"
            }}>
              {msg.content}

              {msg.role === "assistant" && (
                <button
                  onClick={() => speakText(msg.content)}
                  style={{
                    position: "absolute",
                    bottom: 5,
                    right: 5,
                    background: "#6a0dad",
                    border: "none",
                    color: "white",
                    borderRadius: 5,
                    padding: "3px 8px",
                    fontSize: 12,
                    cursor: "pointer",
                  }}
                >
                  🔊
                </button>
              )}
            </div>
          ))}

          {loading && (
            <div style={{
              background: "#eaeaea",
              padding: "10px 15px",
              borderRadius: 8,
              maxWidth: "70%"
            }}>
              Thinking...
            </div>
          )}
        </div>

        {/* INPUT AREA */}
        <div style={{
          display: "flex",
          gap: 10,
          padding: 15,
          borderTop: "1px solid #ccc",
          background: "white",
          flexWrap: "wrap"
        }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSend()}
            placeholder="Ask the math assistant a question…"
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
              border: "none",
              borderRadius: 8,
              fontWeight: "bold",
              cursor: "pointer"
            }}
          >
            Send
          </button>

          <input type="file" accept="image/*" onChange={handleImageUpload} />
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
