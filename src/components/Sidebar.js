import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from "./styles";

const Sidebar = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState(null);
  const [userEmail, setUserEmail] = useState(null);

  useEffect(() => {
    const storedEmail = localStorage.getItem("userEmail"); // ✅ Correct key
    if (storedEmail) {
      setUserEmail(storedEmail);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("userEmail"); // ✅ Correct key
    setUserEmail(null);
    navigate("/login");
  };

  const categories = {
    Learners: [
      { id: 'multi', label: 'Multilanguage Tutor', icon: '🌍' },
      { id: 'books', label: 'Book Generator', icon: '📖' },
      { id: 'content', label: 'Content Explorer', icon: '🔍' },
      { id: 'agenerator', label: 'Learning with 3D Art', icon: '🎨' },
      { id: 'movie', label: 'Math Fun Movie', icon: '🎬' },
      { id: 'chalk', label: 'Blackboard Tutor', icon: '🧑‍🏫' },
      { id: 'main', label: 'Smart Math (Aptitude)', icon: '🧠' },
      { id: 'road', label: 'Road Map Generator', icon: '🗺️' },
      { id: 'video', label: 'Video Visuals', icon: '📺' },
      { id: 'chatbot', label: 'Chatbot', icon: '💬' },
      { id: 'pdf', label: 'Paper Analysis', icon: '📄' }
    ],
    Evaluators: [
      { id: 'quiz', label: 'Quiz Generator', icon: '📝' },
      { id: 'auto', label: 'AI Problem Generator', icon: '⚙️' }
    ],
    Groups: [
      { id: 'groups', label: 'Groups', icon: '👥' }
    ],
    games: [
      { id: 'rush', label: 'MathRush Game', icon: '🚀' },
      { id: 'challenge', label: 'Gamified Challenges', icon: '🏆' },
      { id: 'demo', label: 'Demo Gaming', icon: '🕹️' }
    ]
  };

  return (
    <div style={{ ...styles.sidebar, height: '100vh', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
      <div style={{ ...styles.navbar, position: 'sticky', top: 0, background: '#fff', padding: '10px', display: 'flex', justifyContent: 'space-between' }}>
        {userEmail ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
          <span style={{ fontWeight: 'bold', color: '#6B21A8' }}>Welcome: {userEmail}</span>
          <button style={styles.button} onClick={handleLogout}>🚪 Logout</button>
        </div>
        
        ) : (
          <>
            <button style={styles.button} onClick={() => navigate('/login')}>🔐 Login</button>
            <button style={styles.button} onClick={() => navigate('/')}>✍ Sign Up</button>
          </>
        )}
      </div>

      <div style={{ ...styles.navbar, position: 'sticky', top: 0, background: '#fff', padding: '10px', display: 'flex', justifyContent: 'space-between' }}>
        <button style={styles.button}>⚡ Go Pro</button>
      </div>

      <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
        {Object.keys(categories).map(category => (
          <button
            key={category}
            style={{
              width: '200px',
              padding: '12px',
              fontSize: '16px',
              fontWeight: 'bold',
              textAlign: 'center',
              backgroundColor: activeCategory === category ? '#6a0dad' : '#4a0c8a',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              transition: '0.3s',
              boxShadow: activeCategory === category ? '0px 4px 6px rgba(0,0,0,0.2)' : 'none'
            }}
            onClick={() => setActiveCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      <nav style={{ flexGrow: 1, overflowY: 'auto', paddingBottom: '20px', paddingLeft: '20px' }}>
        {activeCategory && categories[activeCategory].map(item => (
          <div
            key={item.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '8px 12px',
              fontSize: '16px',
              cursor: 'pointer',
              transition: '0.2s',
              borderRadius: '5px',
              backgroundColor: '#f4f4f4',
              margin: '5px 0',
              boxShadow: '0px 2px 4px rgba(0,0,0,0.1)'
            }}
            onClick={() => navigate(`/${item.id}`)}
          >
            <span style={{ fontSize: '20px', marginRight: '10px' }}>{item.icon}</span>
            {item.label}
          </div>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
