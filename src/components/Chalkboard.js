import React, { useState, useRef, useEffect } from "react";

const AIChalkboardTutor = () => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(false);

  const canvasRef = useRef(null);
  const handRef = useRef(null);

  const apiKey = "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"; // Replace with your actual API key

  const fetchSolution = async () => {
    if (!question.trim()) return;

    setLoading(true);
    setSteps([]);
    speechSynthesis.cancel();

    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "llama3-8b-8192",
          messages: [
            {
              role: "system",
              content: "You are a helpful math tutor. Solve the math problem with a final answer. Explain each step in less than 8 words.",
            },
            {
              role: "user",
              content: `Question: ${question}. My Answer: ${answer}`,
            },
          ],
        }),
      });

      const data = await response.json();
      const message = data.choices?.[0]?.message?.content || "";
      const lines = message.split(/\n+/).filter((line) => line.trim());
      const formattedSteps = lines.map((s, i) => `${i + 1}. ${s.trim().slice(0, 70)}`);
      setSteps(formattedSteps);
      speakText(formattedSteps[0]);
    } catch (err) {
      console.error("API Error:", err);
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

        const textMetrics = ctx.measureText(text.slice(0, j));
        if (handRef.current) {
          handRef.current.style.display = "block";
          handRef.current.style.left = `${x + textMetrics.width + 30}px`;
          handRef.current.style.top = `${y - 20}px`;
        }

        await new Promise((r) => setTimeout(r, 25));
      }

      speakText(text);
      y += 60;
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    if (handRef.current) {
      handRef.current.style.display = "none";
    }
  };

  const speakText = (text) => {
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.9;
    speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (steps.length > 0 && canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      drawSteps(ctx);
    }
  }, [steps]);

  useEffect(() => {
    const resizeCanvas = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
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
        placeholder="Enter math problem (e.g., 2x + 3 = 7)"
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
    fontFamily: "Arial, sans-serif",
    backgroundColor: "#000",
    margin: 0,
    padding: 0,
    overflow: "hidden",
    height: "100vh",
    width: "100vw",
    position: "relative",
    color: "#fff",
  },
  title: {
    position: "absolute",
    top: "10px",
    left: "50%",
    transform: "translateX(-50%)",
    fontSize: "1.5rem",
    color: "#00ffcc",
    zIndex: 10,
  },
  textarea: {
    position: "absolute",
    top: "70px",
    left: "50%",
    transform: "translateX(-50%)",
    width: "60%",
    padding: "12px",
    fontSize: "16px",
    borderRadius: "10px",
    border: "1px solid #ccc",
    resize: "none",
    zIndex: 10,
    backgroundColor: "#111",
    color: "#00ffcc",
  },
  input: {
    position: "absolute",
    top: "150px",
    left: "50%",
    transform: "translateX(-50%)",
    width: "60%",
    padding: "12px",
    fontSize: "16px",
    borderRadius: "10px",
    border: "1px solid #ccc",
    zIndex: 10,
    backgroundColor: "#111",
    color: "#00ffcc",
  },
  button: {
    position: "absolute",
    top: "210px",
    left: "50%",
    transform: "translateX(-50%)",
    padding: "14px 30px",
    backgroundColor: "#00b4d8",
    color: "#fff",
    borderRadius: "10px",
    fontSize: "18px",
    cursor: "pointer",
    border: "none",
    zIndex: 10,
  },
  canvas: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "#000",
  },
  hand: {
    position: "absolute",
    width: "50px",
    height: "50px",
    display: "none",
    pointerEvents: "none",
    zIndex: 20,
    transition: "left 0.05s linear, top 0.05s linear",
  },
};

export default AIChalkboardTutor;
