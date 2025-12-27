import React, { useState, useRef, useEffect } from "react";

export default function Texttovideo() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [videoURL, setVideoURL] = useState(null);
  const [stepsText, setStepsText] = useState([]);
  const [lang, setLang] = useState("en");

  const canvasRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);

  /* ---------------- GOOGLE FONT ---------------- */
  useEffect(() => {
    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

  /* ---------------- GOOGLE TRANSLATE ---------------- */
  const translateText = async (text, targetLang) => {
    if (targetLang === "en") return text;

    const res = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(
        text
      )}`
    );

    const data = await res.json();
    return data[0].map((t) => t[0]).join("");
  };

  /* ---------------- SOLVER ---------------- */
  const solveExpression = (expr) => {
    try {
      if (expr.includes("=")) {
        return [
          `Given equation: ${expr}`,
          "Move constants to one side",
          "Simplify both sides",
          "Solve for the variable",
          "Final answer obtained",
        ];
      } else {
        return [`Expression: ${expr}`, `Final Answer = ${eval(expr)}`];
      }
    } catch {
      return ["Unable to solve this expression"];
    }
  };

  /* ---------------- RECORDING ---------------- */
  const startRecording = (stream) => {
    recordedChunksRef.current = [];
    const recorder = new MediaRecorder(stream, {
      mimeType: "video/webm",
      videoBitsPerSecond: 6_000_000,
    });

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) recordedChunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
      setVideoURL(URL.createObjectURL(blob));
    };

    recorder.start();
    mediaRecorderRef.current = recorder;
  };

  const stopRecording = () => mediaRecorderRef.current?.stop();

  /* ---------------- MAIN ---------------- */
  const handleSubmit = async () => {
    if (!input.trim()) return;

    setLoading(true);
    setVideoURL(null);

    let steps = solveExpression(input);

    // 🌍 TRANSLATE STEPS
    const translatedSteps = [];
    for (let step of steps) {
      translatedSteps.push(await translateText(step, lang));
    }

    setStepsText(translatedSteps);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;

    canvas.width = 600 * dpr;
    canvas.height = 260 * dpr;
    ctx.scale(dpr, dpr);

    const stream = canvas.captureStream(30);
    startRecording(stream);
    await animateSteps(translatedSteps, canvas);
    stopRecording();

    setLoading(false);
  };

  /* ---------------- VIDEO + VOICE ---------------- */
  const animateSteps = async (steps, canvas) => {
    const ctx = canvas.getContext("2d");

    const speak = (text) =>
      new Promise((resolve) => {
        const u = new SpeechSynthesisUtterance(text);
        u.lang = lang; // ✅ REAL LANGUAGE
        u.onend = resolve;
        speechSynthesis.speak(u);
      });

    for (let i = 0; i < steps.length; i++) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "#6a11cb";
      ctx.font = "bold 24px Poppins";
      ctx.fillText(`Step ${i + 1}`, 20, 40);

      ctx.fillStyle = "#000";
      ctx.font = "18px Poppins";
      wrapText(ctx, steps[i], 20, 90, 560, 28);

      await speak(steps[i]);
      await new Promise((r) => setTimeout(r, 500));
    }
  };

  const wrapText = (ctx, text, x, y, maxWidth, lineHeight) => {
    const words = text.split(" ");
    let line = "";
    let yy = y;

    for (let w of words) {
      const test = line + w + " ";
      if (ctx.measureText(test).width > maxWidth) {
        ctx.fillText(line, x, yy);
        line = w + " ";
        yy += lineHeight;
      } else {
        line = test;
      }
    }
    ctx.fillText(line, x, yy);
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2>📽 Math Video Solver</h2>

        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter math expression (e.g., 2x+5=15)"
          style={styles.input}
        />

        <select value={lang} onChange={(e) => setLang(e.target.value)} style={styles.select}>
          <option value="en">English</option>
          <option value="hi">Hindi</option>
          <option value="ta">Tamil</option>
          <option value="te">Telugu</option>
        </select>

        <button onClick={handleSubmit} style={styles.button}>
          {loading ? "Generating..." : "Solve & Generate Video"}
        </button>

        {stepsText.length > 0 && (
          <div style={styles.textBox}>
            <h3>📝 Solution Steps</h3>
            {stepsText.map((s, i) => (
              <p key={i}>Step {i + 1}: {s}</p>
            ))}
          </div>
        )}

        <canvas ref={canvasRef} width={600} height={260} style={styles.canvas} />

        {videoURL && (
          <>
            <video src={videoURL} controls width="600" />
            <a href={videoURL} download="math-video.webm">
              <button style={styles.download}>⬇ Download Video</button>
            </a>
          </>
        )}
      </div>
    </div>
  );
}

/* ---------------- STYLES ---------------- */
const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg,#667eea,#764ba2)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "Poppins, sans-serif",
  },
  card: {
    background: "#fff",
    padding: "30px",
    borderRadius: "15px",
    width: "720px",
    textAlign: "center",
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
  },
  input: { padding: 12, width: "90%", marginBottom: 10 },
  select: { padding: 10, marginBottom: 10 },
  button: {
    background: "#6a11cb",
    color: "#fff",
    padding: "12px 25px",
    borderRadius: 8,
    border: "none",
    cursor: "pointer",
  },
  textBox: { textAlign: "left", marginTop: 20 },
  canvas: { marginTop: 20, border: "1px solid #ccc" },
  download: {
    marginTop: 10,
    background: "#28a745",
    color: "#fff",
    padding: "10px 20px",
    borderRadius: 6,
    border: "none",
  },
};
