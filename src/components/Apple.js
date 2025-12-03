import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Howl } from "howler";

// Background music and sound effect
const backgroundMusic = new Howl({
  src: ["/sounds/bg.mp3"],
  loop: true,
  volume: 0.3,
});

const giveSound = new Howl({
  src: ["/sounds/give.mp3"],
  volume: 1,
});

const WordProblemCartoon = () => {
  const [question, setQuestion] = useState("");
  const [scene, setScene] = useState(null);
  const [dialogues, setDialogues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [voices, setVoices] = useState([]);

  // Load voices
  useEffect(() => {
    const loadVoices = () => {
      const v = window.speechSynthesis.getVoices();
      if (v.length > 0) setVoices(v);
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  // Speak dialogue aloud
  const speak = (text, voiceName) => {
    const utterance = new SpeechSynthesisUtterance(text);
    const voice = voices.find((v) => v.name.includes(voiceName)) || voices[0];
    if (voice) utterance.voice = voice;
    utterance.pitch = 1;
    utterance.rate = 1;
    window.speechSynthesis.speak(utterance);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setScene(null);
    setDialogues([]);
    window.speechSynthesis.cancel();

    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer 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"
        },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content:
                "Extract characters, objects, actions, quantities, and results in a fun storytelling JSON like: { \"initialState\": {\"Tom\": 5}, \"action\": {\"give\": {\"from\": \"Tom\", \"to\": \"Jerry\", \"object\": \"chocolate\", \"quantity\": 2}}, \"finalState\": {\"Tom\": 3, \"Jerry\": 2} }"
            },
            { role: "user", content: question }
          ],
          model: "llama3-8b-8192"
        })
      });

      const data = await response.json();
      const message = data.choices?.[0]?.message?.content;
      const jsonMatch = message.match(/\{[\s\S]*\}/);
      const parsed = JSON.parse(jsonMatch[0]);

      setScene(parsed);
      giveSound.play();
      backgroundMusic.play();

      const action = parsed.action?.give;
      if (action) {
        const generatedDialogues = [
          `${action.from}: Hey ${action.to}, I have some ${action.object}s. Would you like some?`,
          `${action.to}: Oh, that's very kind of you! Yes, please.`,
          `${action.from}: Here you go, ${action.quantity} ${action.object}(s) just for you.`,
          `${action.to}: Thank you so much! I really appreciate it.`,
          `${action.from}: You're welcome! Enjoy!`
        ];

        setDialogues(generatedDialogues);

        generatedDialogues.forEach((line, index) => {
          const isFrom = line.startsWith(`${action.from}:`);
          const voice = isFrom ? "Google UK English Male" : "Google UK English Female";
          setTimeout(() => speak(line, voice), 1500 * (index + 1));
        });

        setTimeout(() => {
          speak(`${action.from} gives ${action.quantity} ${action.object}(s) to ${action.to}.`, "Google US English");
        }, 9000);
      }

    } catch (error) {
      console.error("Error:", error);
      setScene(null);
    }

    setLoading(false);
  };

  const renderScene = () => {
    if (!scene) return null;
    const action = scene.action?.give;

    return (
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2 }}
        className="scene"
        style={styles.scene}
      >
        <h2 style={styles.sceneTitle}>🎬 Cartoon Comic Scene</h2>

        <div style={styles.charRow}>
          {Object.entries(scene.initialState).map(([name, quantity]) => (
            <motion.div
              key={name}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 100 }}
              style={styles.charBox}
            >
              <div style={{ fontSize: 40 }}>🧍</div>
              <strong>{name}</strong>
              <div>🎒 {quantity} item(s)</div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 1 }}
          style={styles.storyBox}
        >
          <p>✨ {action.from} walks to {action.to} and gives them {action.quantity} {action.object}(s)! 🎁</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          style={styles.dialogueBox}
        >
          <h4>🗣️ Dialogues:</h4>
          {dialogues.map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </motion.div>

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1.5 }}
          style={styles.resultBox}
        >
          <h4>📊 Final State:</h4>
          {Object.entries(scene.finalState).map(([name, quantity]) => (
            <p key={name}>
              {name} now has <strong>{quantity}</strong> {action.object}(s)
            </p>
          ))}
        </motion.div>
      </motion.div>
    );
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🍿 Cartoon Math Story</h1>
      <textarea
        style={styles.input}
        rows={4}
        placeholder="Enter a fun math story..."
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
      />
      <button onClick={handleSubmit} disabled={loading} style={styles.button}>
        {loading ? "Loading..." : "Play Scene"}
      </button>
      {renderScene()}
    </div>
  );
};

const styles = {
  container: {
    fontFamily: "Comic Sans MS, cursive",
    background: "linear-gradient(to right, #C3B1E1, #ffe8d1)",
    minHeight: "100vh",
    padding: "20px"
  },
  title: {
    textAlign: "center",
    fontSize: "2.5rem",
    color: "#333",
    marginBottom: "20px"
  },
  input: {
    width: "100%",
    maxWidth: "600px",
    margin: "0 auto",
    display: "block",
    padding: "12px",
    fontSize: "1.1rem",
    borderRadius: "10px",
    border: "2px solid #ffb347",
    outline: "none",
    resize: "none",
    boxShadow: "2px 2px 10px rgba(0,0,0,0.1)"
  },
  button: {
    display: "block",
    margin: "20px auto",
    padding: "10px 30px",
    fontSize: "1.2rem",
    backgroundColor: "#ffb347",
    color: "#fff",
    border: "none",
    borderRadius: "20px",
    cursor: "pointer",
    boxShadow: "3px 3px 8px rgba(0,0,0,0.2)",
    transition: "background 0.3s ease"
  },
  scene: {
    maxWidth: "800px",
    margin: "40px auto",
    backgroundColor: "#fffdf0",
    borderRadius: "20px",
    padding: "20px",
    boxShadow: "4px 4px 20px rgba(0,0,0,0.15)",
    textAlign: "center"
  },
  sceneTitle: {
    fontSize: "1.8rem",
    marginBottom: "15px",
    color: "#4a4a4a"
  },
  charRow: {
    display: "flex",
    justifyContent: "center",
    gap: "40px",
    marginBottom: "25px",
    flexWrap: "wrap"
  },
  charBox: {
    backgroundColor: "#ffe9b0",
    padding: "15px 20px",
    borderRadius: "15px",
    boxShadow: "2px 2px 8px rgba(0,0,0,0.1)",
    textAlign: "center",
    width: "140px"
  },
  storyBox: {
    backgroundColor: "#d9f8c4",
    padding: "15px",
    borderRadius: "12px",
    fontSize: "1.1rem",
    margin: "20px 0",
    boxShadow: "2px 2px 10px rgba(0,0,0,0.1)"
  },
  dialogueBox: {
    backgroundColor: "#e6e6fa",
    padding: "15px",
    borderRadius: "12px",
    fontSize: "1rem",
    margin: "20px 0",
    textAlign: "left",
    boxShadow: "2px 2px 10px rgba(0,0,0,0.1)"
  },
  resultBox: {
    backgroundColor: "#ffebc8",
    padding: "15px",
    borderRadius: "12px",
    fontSize: "1.1rem",
    boxShadow: "2px 2px 10px rgba(0,0,0,0.1)"
  }
};

export default WordProblemCartoon;
