import React, { useState, useRef, useEffect } from "react";

const AIChalkboardTutor = () => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(false);

  const canvasRef = useRef(null);
  const handRef = useRef(null);

  const BACKEND_URL =
    "https://visual-math-oscg.onrender.com/chalk-explain"; // ✅ secure backend route

  const fetchSolution = async () => {
    if (!question.trim()) return;

    setLoading(true);
    setSteps([]);
    speechSynthesis.cancel();

    try {
      const res = await fetch(BACKEND_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, studentAnswer: answer }),
      });

      const data = await res.json();
      const message = data.choices?.[0]?.message?.content || "";

      const lines = message
        .split(/\n+/)
        .filter((line) => line.trim())
        .map((s, i) => `${i + 1}. ${s.trim().slice(0, 70)}`);

      setSteps(lines);
      speakText(lines[0]);
    } catch (err) {
      console.error("Chalkboard Error:", err);
    }

    setLoading(false);
  };

  const drawSteps = async (ctx) => {
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    ctx.font = "24px 'Gloria Hallelujah', cursive";
    ctx.fillStyle = "#00ffcc";
    ctx.shadowColor = "#00ffcc";
    ctx.shadowBlur = 4;

    let y = 260;

    for (let i = 0; i < steps.length; i++) {
      const text = steps[i];
      const x = 40;

      for (let j = 0; j <= text.length; j++) {
        ctx.clearRect(x, y - 30, canvasRef.current.width - 60, 35);
        ctx.fillText(text.slice(0, j), x, y);

        const width = ctx.measureText(text.slice(0, j)).width;

        if (handRef.current) {
          handRef.current.style.display = "block";
          handRef.current.style.left = `${x + width + 30}px`;
          handRef.current.style.top = `${y - 20}px`;
        }

        await new Promise((res) => setTimeout(res, 25));
      }

      speakText(text);
      y += 60;
      await new Promise((res) => setTimeout(res, 1000));
    }

    if (handRef.current) handRef.current.style.display = "none";
  };

  const speakText = (text) => {
    speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "en-US";
    utter.rate = 0.9;
    speechSynthesis.speak(utter);
  };

  useEffect(() => {
    if (steps.length > 0) {
      const ctx = canvasRef.current.getContext("2d");
      drawSteps(ctx);
    }
  }, [steps]);

  useEffect(() => {
    const resize = () => {
      canvasRef.current.width = window.innerWidth;
      canvasRef.current.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  return (
    <div style={styles.container}>
      <link
        href="https://fonts.googleapis.com/css2?family=Gloria+Hallelujah&display=swap"
        rel="stylesheet"
      />

      <h1 style={styles.title}>📐 AI Chalkboard Tutor</h1>

      <textarea
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Enter math problem..."
        rows={3}
        style={styles.textarea}
      />

      <input
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="Enter your answer"
        style={styles.input}
      />

      <button onClick={fetchSolution} style={styles.button} disabled={loading}>
        {loading ? "Thinking..." : "Explain & Check"}
      </button>

      <canvas ref={canvasRef} style={styles.canvas} />
      <img
        ref={handRef}
        src="https://cdn-icons-png.flaticon.com/512/892/892634.png"
        alt="Hand Writing"
        style={styles.hand}
      />
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: "#000",
    height: "100vh",
    width: "100vw",
    overflow: "hidden",
    position: "relative",
    color: "#fff",
  },
  title: {
    position: "absolute",
    top: 10,
    left: "50%",
    transform: "translateX(-50%)",
    color: "#00ffcc",
    zIndex: 10,
  },
  textarea: {
    position: "absolute",
    top: 70,
    left: "50%",
    transform: "translateX(-50%)",
    width: "60%",
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#111",
    color: "#00ffcc",
    zIndex: 10,
  },
  input: {
    position: "absolute",
    top: 150,
    left: "50%",
    transform: "translateX(-50%)",
    width: "60%",
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#111",
    color: "#00ffcc",
    zIndex: 10,
  },
  button: {
    position: "absolute",
    top: 210,
    left: "50%",
    transform: "translateX(-50%)",
    padding: "14px 30px",
    backgroundColor: "#00b4d8",
    borderRadius: 10,
    zIndex: 10,
    cursor: "pointer",
    color: "#fff",
  },
  canvas: {
    position: "absolute",
    top: 0,
    left: 0,
    backgroundColor: "#000",
  },
  hand: {
    position: "absolute",
    width: 50,
    display: "none",
    zIndex: 20,
  },
};

export default AIChalkboardTutor;
