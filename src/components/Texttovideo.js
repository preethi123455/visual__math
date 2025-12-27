import React, { useState, useRef } from "react";

export default function Texttovideo() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [videoURL, setVideoURL] = useState(null);

  const canvasRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);

  // 🔴 CHANGE THIS ONLY IF USING RENDER
  const BACKEND_URL = "http://localhost:5000/solve-math";

  const startRecording = (stream) => {
    recordedChunksRef.current = [];
    const recorder = new MediaRecorder(stream, { mimeType: "video/webm" });

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) recordedChunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(recordedChunksRef.current, {
        type: "video/webm"
      });
      setVideoURL(URL.createObjectURL(blob));
    };

    recorder.start();
    mediaRecorderRef.current = recorder;
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
  };

  const handleSubmit = async () => {
    if (!input.trim()) return;

    setLoading(true);
    setVideoURL(null);

    try {
      const res = await fetch(BACKEND_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problem: input })
      });

      if (!res.ok) throw new Error("Backend error");

      const data = await res.json();
      const steps = data.solution
        .split("\n")
        .filter((s) => s.trim());

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const stream = canvas.captureStream(30);
      startRecording(stream);

      await animateSteps(steps, canvas);

      stopRecording();
    } catch (err) {
      console.error(err);
      alert("❌ Backend not running or error occurred");
    } finally {
      setLoading(false);
    }
  };

  const animateSteps = async (steps, canvas) => {
    const ctx = canvas.getContext("2d");

    const speak = (text) =>
      new Promise((resolve) => {
        const u = new SpeechSynthesisUtterance(text);
        u.onend = resolve;
        speechSynthesis.speak(u);
      });

    for (let i = 0; i < steps.length; i++) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "#007acc";
      ctx.font = "bold 22px Arial";
      ctx.fillText(`Step ${i + 1}`, 20, 40);

      ctx.fillStyle = "#000";
      ctx.font = "18px Arial";
      wrapText(ctx, steps[i], 20, 80, 560, 24);

      await speak(steps[i]);
      await new Promise((r) => setTimeout(r, 400));
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
    <div style={{ padding: 20, textAlign: "center" }}>
      <h2>📽 Math Video Solver</h2>

      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Enter math problem"
        style={{ padding: 10, width: "60%" }}
      />

      <button onClick={handleSubmit} style={{ marginLeft: 10 }}>
        {loading ? "Generating..." : "Generate Video"}
      </button>

      <canvas
        ref={canvasRef}
        width={600}
        height={220}
        style={{ marginTop: 20, border: "1px solid #ccc" }}
      />

      {videoURL && (
        <>
          <video src={videoURL} controls width="600" />
          <br />
          <a href={videoURL} download="solution.webm">
            <button>⬇ Download</button>
          </a>
        </>
      )}
    </div>
  );
}
