import React, { useState, useRef } from 'react';
import Tesseract from 'tesseract.js';
import Select from 'react-select';

const AIAssistant = () => {
  const groqApiKey = "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"; // ⚠️ Replace this in production!
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
    english: 'Respond the answer fully in English.',
    tamil: 'Respond the answer fully in Tamil.',
    hindi: 'Respond the answer fully in Hindi.',
    kannada: 'Respond the answer fully in Kannada without using english as much as possible.',
    malayalam: 'Respond the answer fully in Malayalam.',
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

  const isMathRelated = (text) => {
    const mathKeywords = [
      'math', 'algebra', 'geometry', 'calculus', 'trigonometry', 'integral', 'derivative', 'theorem',
      'equation', 'logarithm', 'matrix', 'probability', 'statistics', 'function', 'number', 'prime', 'maths'
    ];
    return mathKeywords.some(keyword => text.toLowerCase().includes(keyword));
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    if (!isMathRelated(input)) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Please ask only math-related questions!' }]);
      setInput('');
      return;
    }

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const currentMessages = [...messages, userMessage];

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${groqApiKey}`
        },
        body: JSON.stringify({
          model: mode === 'general' ? 'llama3-8b-8192' : 'mixtral-8x7b-32768',
          messages: [
            {
              role: 'system',
              content: `You are a math learning assistant helping students understand only mathematics topics. Do not answer questions unrelated to mathematics. Provide helpful explanations with examples. ${languagePrompts[language.value] || ''}`
            },
            ...currentMessages
          ],
          temperature: 0.7,
          max_tokens: 1024
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const assistantResponse = data.choices[0]?.message?.content || "Sorry, I couldn't generate a response.";
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: assistantResponse
      }]);
    } catch (error) {
      console.error('Error calling Groq API:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error connecting to the AI service. Please try again.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleStartRecording = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert("Speech Recognition not supported in your browser.");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = {
      english: 'en-US',
      tamil: 'ta-IN',
      hindi: 'hi-IN',
      kannada: 'kn-IN',
      malayalam: 'ml-IN'
    }[language.value] || 'en-US';

    recognition.interimResults = false;
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(prev => prev + ' ' + transcript);
    };
    recognition.onerror = (e) => {
      console.error("Speech recognition error:", e);
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
      const { data: { text } } = await Tesseract.recognize(file, 'eng');
      setInput(prev => prev + ' ' + text);
    } catch (err) {
      console.error("OCR error:", err);
    }
    setLoading(false);
  };

  return (
    <div style={{ height: 'calc(100vh - 140px)', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '24px', color: '#6a0dad' }}>AI Learning Assistant</h2>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            onClick={() => setMode('general')}
            style={{
              padding: '10px 15px',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              background: mode === 'general' ? '#6a0dad' : '#f0e6ff',
              color: mode === 'general' ? 'white' : '#6a0dad',
              fontWeight: 'bold'
            }}
          >
            General Help
          </button>
          <Select
            options={[
              { value: 'english', label: 'English' },
              { value: 'tamil', label: 'Tamil' },
              { value: 'hindi', label: 'Hindi' },
              { value: 'kannada', label: 'Kannada' },
              { value: 'malayalam', label: 'Malayalam' }
            ]}
            value={language}
            onChange={setLanguage}
            styles={{ container: base => ({ ...base, width: 150 }) }}
          />
        </div>
      </div>

      <div style={{
        marginTop: '15px',
        border: '1px solid #e0e0e0',
        borderRadius: '10px',
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100% - 70px)',
        overflow: 'hidden'
      }}>
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px',
          background: '#C3B1E1'
        }}>
          {messages.map((msg, idx) => (
            <div
              key={idx}
              style={{
                background: msg.role === 'user' ? '#e6f0ff' : '#eaeaea',
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                padding: '10px 15px',
                borderRadius: '8px',
                marginBottom: '10px',
                maxWidth: '80%',
                position: 'relative'
              }}
            >
              {msg.content}
              {msg.role === 'assistant' && (
                <button
                  onClick={() => speakText(msg.content)}
                  style={{
                    position: 'absolute',
                    bottom: 5,
                    right: 5,
                    background: '#6a0dad',
                    border: 'none',
                    borderRadius: '5px',
                    color: 'white',
                    padding: '3px 8px',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  🔊
                </button>
              )}
            </div>
          ))}
          {loading && (
            <div style={{
              background: '#eaeaea',
              padding: '10px 15px',
              borderRadius: '8px',
              marginBottom: '10px',
              maxWidth: '80%'
            }}>
              Thinking...
            </div>
          )}
        </div>

        <div style={{
          display: 'flex',
          gap: '10px',
          padding: '15px',
          borderTop: '1px solid #C3B1E1',
          background: '#fff',
          flexWrap: 'wrap'
        }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder={`Ask the ${mode === 'general' ? 'math assistant' : 'coding expert'} a question...`}
            style={{
              flex: 1,
              padding: '12px 15px',
              borderRadius: '8px',
              border: '1px solid #e0e0e0',
              fontSize: '14px'
            }}
          />
          <button
            onClick={handleSend}
            disabled={loading}
            style={{
              padding: '12px 18px',
              background: '#6a0dad',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            Send
          </button>
          
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            style={{ padding: '12px', fontSize: '14px' }}
          />
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
