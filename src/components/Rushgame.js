import React, { useState, useEffect } from 'react';

const MathRPG = () => {
  const [question, setQuestion] = useState('');
  const [userAnswer, setUserAnswer] = useState('');
  const [result, setResult] = useState('');
  const [enemyHP, setEnemyHP] = useState(100);
  const [playerHP, setPlayerHP] = useState(100);
  const [loading, setLoading] = useState(false);

  const GROQ_API_KEY = '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';

  const generateQuestion = async () => {
    setLoading(true);
    setResult('');
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: 'llama3-8b-8192',
          messages: [
            {
              role: 'system',
              content: 'Generate a fun and simple math question for students. Provide only the question text.'
            }
          ]
        })
      });

      const data = await response.json();
      const q = data.choices?.[0]?.message?.content?.trim();
      setQuestion(q || 'Solve: 2 + 2');
    } catch (error) {
      console.error('Question generation failed:', error);
      setQuestion('Solve: 5 + 3');
    } finally {
      setLoading(false);
    }
  };

  const checkAnswer = async () => {
    if (!userAnswer.trim()) {
      setResult('⚠ Please enter an answer!');
      return;
    }

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: 'llama3-8b-8192',
          messages: [
            {
              role: 'system',
              content: 'You are a math teacher. You will be given a question and a student\'s answer. Respond strictly with only one of: "Correct", "Partially Correct", or "Wrong".'
            },
            {
              role: 'user',
              content: `Question: ${question}\nStudent Answer: ${userAnswer}`
            }
          ]
        })
      });

      const data = await response.json();
      const evaluation = data.choices?.[0]?.message?.content?.toLowerCase();

      if (evaluation.includes('correct')) {
        setEnemyHP(prev => Math.max(prev - 20, 0));
        setResult('✅ Correct! You dealt damage!');
      } else if (evaluation.includes('partially')) {
        setEnemyHP(prev => Math.max(prev - 10, 0));
        setPlayerHP(prev => Math.max(prev - 10, 0));
        setResult('⚠ Partially correct. Minor damage exchanged!');
      } else {
        setPlayerHP(prev => Math.max(prev - 20, 0));
        setResult('❌ Wrong! The Evil Denominator hit back!');
      }

      setUserAnswer('');
      setTimeout(() => generateQuestion(), 1500);
    } catch (error) {
      console.error('Answer checking failed:', error);
      setResult('Something went wrong. Try again!');
    }
  };

  useEffect(() => {
    generateQuestion();
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      padding: '2rem',
      color: '#fff',
      backgroundImage: 'url(https://static.vecteezy.com/system/resources/previews/001/401/677/non_2x/abstract-polygonal-shape-black-background-free-vector.jpg)',
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
      textAlign: 'center',
      fontFamily: 'Verdana, sans-serif'
    }}>
      <h1 style={{
        fontSize: '2.5rem',
        marginBottom: '1.5rem',
        textShadow: '2px 2px 4px #000'
      }}>⚔ MathRPG: Defeat the Evil Denominator!</h1>

      <div style={{
        display: 'flex',
        justifyContent: 'space-around',
        marginBottom: '2rem'
      }}>
        <div>
          <img
            src="https://static.vecteezy.com/system/resources/thumbnails/028/111/315/small/of-man-in-black-hoodie-in-server-data-center-room-with-neon-light-generative-ai-photo.jpg"
            alt="Evil Denominator"
            style={{ width: '140px', marginBottom: '0.5rem' }}
          />
          <p>💀 Enemy HP: {enemyHP}</p>
        </div>
        <div>
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQmpLR-S1mh4vZ11FDRCqq84Kysf0xYzaE2nw&s"
            alt="Hero"
            style={{ width: '140px', marginBottom: '0.5rem' }}
          />
          <p>🛡 Your HP: {playerHP}</p>
        </div>
      </div>

      <div style={{
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        padding: '2rem',
        borderRadius: '20px',
        maxWidth: '600px',
        margin: '0 auto',
        boxShadow: '0 0 15px rgba(0,0,0,0.6)'
      }}>
        <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>
          <strong>📜 Question:</strong> {loading ? 'Loading...' : question}
        </p>
        <input
          type="text"
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          placeholder="Enter your answer..."
          style={{
            padding: '0.8rem',
            fontSize: '1rem',
            borderRadius: '10px',
            border: 'none',
            width: '80%',
            marginBottom: '1rem'
          }}
        />
        <br />
        <button
          onClick={checkAnswer}
          style={{
            backgroundColor: '#00bcd4',
            color: '#fff',
            padding: '0.8rem 1.6rem',
            fontSize: '1rem',
            borderRadius: '10px',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          🔥 Cast Spell
        </button>
        <p style={{
          marginTop: '1rem',
          fontWeight: 'bold',
          fontSize: '1.1rem'
        }}>{result}</p>
      </div>
    </div>
  );
};

export default MathRPG;
