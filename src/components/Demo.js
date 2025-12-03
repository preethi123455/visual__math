import React, { useState } from 'react';
import { motion } from 'framer-motion';

const API_KEY = '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';
const API_URL = 'https://api.groq.com/openai/v1/chat/completions';

const containerStyle = {
  background: '#C3B1E1',
  fontFamily: 'Comic Sans MS, sans-serif',
  minHeight: '100vh',
  padding: '30px',
  textAlign: 'center',
  color: '#333',
};

const LlamaTutorGame = () => {
  const [baseQuestion, setBaseQuestion] = useState('');
  const [chosenLevel, setChosenLevel] = useState(null);
  const [modifiedQuestion, setModifiedQuestion] = useState('');
  const [steps, setSteps] = useState([]);
  const [selectedStep, setSelectedStep] = useState(null);
  const [loading, setLoading] = useState(false);
  const [quizIndex, setQuizIndex] = useState(null);
  const [userAnswer, setUserAnswer] = useState(null);

  const modifyQuestion = (level) => {
    const templates = [
      `Explain like I’m 5: ${baseQuestion}`,
      `Break down this concept like a puzzle: ${baseQuestion}`,
      `Give me a coding example and explanation: ${baseQuestion}`,
      `Show me common mistakes and how to fix them: ${baseQuestion}`,
      `Explain this like a teacher preparing a fun class: ${baseQuestion}`,
    ];
    return templates[level - 1] || baseQuestion;
  };

  const handleStartLevel = async (level) => {
    const modified = modifyQuestion(level);
    setModifiedQuestion(modified);
    setChosenLevel(level);
    setLoading(true);
    setSteps([]);
    setSelectedStep(null);
    setUserAnswer(null);
    setQuizIndex(null);

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model: 'llama3-8b-8192',
          messages: [
            { role: 'system', content: 'You are a fun llama tutor giving step-by-step instructions with examples and humor!' },
            { role: 'user', content: modified },
          ],
          temperature: 0.7,
        }),
      });

      const data = await res.json();
      const fullText = data.choices[0].message.content;
      const stepsArray = fullText
        .split(/\n(?=\d+\.|\- )/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
      setSteps(stepsArray);
    } catch (err) {
      alert('Error fetching explanation.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuiz = () => {
    setQuizIndex(Math.floor(Math.random() * steps.length));
    setUserAnswer(null);
  };

  const handleAnswer = (index) => {
    setUserAnswer(index);
  };

  return (
    <div style={containerStyle}>
      <h1 style={{ fontSize: '2.5rem' }}> LLaMA Learning Adventure</h1>
      <p>Type a question and choose your learning level 🎮</p>

      <input
        type="text"
        placeholder="e.g., What is a binary tree?"
        value={baseQuestion}
        onChange={(e) => setBaseQuestion(e.target.value)}
        style={{
          width: '60%',
          padding: '12px',
          fontSize: '1rem',
          borderRadius: '10px',
          border: '2px solid #333',
          marginBottom: '20px',
        }}
      />
      <br />
      {baseQuestion && (
        <div>
          <h3>🎮 Choose your Level</h3>
          {[1, 2, 3, 4, 5].map((num) => (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              key={num}
              onClick={() => handleStartLevel(num)}
              style={{
                margin: '5px',
                padding: '10px 18px',
                backgroundColor: '#ff6f61',
                color: 'white',
                fontSize: '1rem',
                borderRadius: '10px',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Level {num}
            </motion.button>
          ))}
        </div>
      )}

      {loading && <p>🧠 Loading steps from the LLaMA brain...</p>}

      {steps.length > 0 && (
        <>
          <h2 style={{ marginTop: '30px' }}>🧩 Steps for Level {chosenLevel}</h2>
          <p style={{ fontStyle: 'italic' }}>“{modifiedQuestion}”</p>

          <div>
            {steps.map((_, index) => (
              <motion.button
                key={index}
                onClick={() => setSelectedStep(index)}
                whileHover={{ scale: 1.1 }}
                style={{
                  margin: '4px',
                  padding: '10px 15px',
                  backgroundColor: '#4caf50',
                  color: '#fff',
                  fontSize: '1rem',
                  borderRadius: '50%',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                {index + 1}
              </motion.button>
            ))}
          </div>

          {selectedStep !== null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              style={{
                marginTop: '20px',
                padding: '20px',
                backgroundColor: '#fff',
                borderRadius: '12px',
                color: '#222',
                fontSize: '1.1rem',
                maxWidth: '600px',
                margin: 'auto',
              }}
            >
              <h3>📘 Step {selectedStep + 1}</h3>
              <p>{steps[selectedStep]}</p>
            </motion.div>
          )}

          <motion.button
            onClick={handleQuiz}
            whileHover={{ scale: 1.1 }}
            style={{
              marginTop: '30px',
              padding: '10px 20px',
              fontSize: '1rem',
              backgroundColor: '#ff9800',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
            }}
          >
            🧠 Quiz Me on This Level!
          </motion.button>
        </>
      )}

      {quizIndex !== null && (
        <div style={{ marginTop: '30px', backgroundColor: '#fff', padding: '25px', borderRadius: '10px', maxWidth: '600px', margin: 'auto' }}>
          <h2>🎉 Challenge Time!</h2>
          <p><strong>Which step number says this?</strong></p>
          <p style={{ fontStyle: 'italic' }}>{steps[quizIndex]}</p>

          <div style={{ marginTop: '15px' }}>
            {steps.map((_, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(idx)}
                style={{
                  margin: '4px',
                  padding: '10px 14px',
                  fontSize: '1rem',
                  backgroundColor: userAnswer === idx
                    ? (idx === quizIndex ? '#4caf50' : '#f44336')
                    : '#2196f3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  cursor: 'pointer',
                }}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          {userAnswer !== null && (
            <p style={{ marginTop: '20px', fontSize: '1.2rem' }}>
              {userAnswer === quizIndex ? '✅ Yay! Correct! 🎯' : '❌ Not quite. Try again next time!'}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default LlamaTutorGame;
