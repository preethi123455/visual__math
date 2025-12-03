import React, { useState, useRef } from "react";

export default function MathVideoSolverWithRecording() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [videoURL, setVideoURL] = useState(null);
  const canvasRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);

  const startRecording = (stream) => {
    recordedChunksRef.current = [];
    const recorder = new MediaRecorder(stream, { mimeType: "video/webm" });

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunksRef.current.push(event.data);
      }
    };

    recorder.onstop = () => {
      const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      setVideoURL(url);
    };

    recorder.start();
    mediaRecorderRef.current = recorder;
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
  };

  const handleSubmit = async () => {
    if (!input.trim()) return;

    setLoading(true);
    setVideoURL(null);

    const prompt = `Solve this math equation step-by-step for a student: ${input}`;

    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer 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"
        },
        body: JSON.stringify({
          model: "llama3-8b-8192",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.2
        })
      });

      const data = await res.json();
      const solution = data.choices?.[0]?.message?.content;
      if (!solution) throw new Error("No content from AI.");

      const steps = solution.split("\n").filter(line => line.trim() !== "");

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const stream = canvas.captureStream(30); // 30 FPS
      startRecording(stream);

      await animateAndSpeakSteps(steps, canvas);

      stopRecording();
    } catch (err) {
      console.error(err);
      alert("Error during video creation.");
    } finally {
      setLoading(false);
    }
  };

  const animateAndSpeakSteps = async (steps, canvas) => {
    const ctx = canvas.getContext("2d");
    const avatar = new Image();
    avatar.src = "https://i.postimg.cc/xjBLtnxz/teacher-avatar.png";
    await avatar.decode();

    const speak = (text) =>
      new Promise((resolve) => {
        const utter = new SpeechSynthesisUtterance(text);
        utter.rate = 1;
        utter.pitch = 1;
        utter.lang = "en-US";
        utter.onend = resolve;
        speechSynthesis.speak(utter);
      });

    for (let i = 0; i < steps.length; i++) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Avatar
      ctx.drawImage(avatar, 20, 40, 100, 100);

      // Step title
      ctx.fillStyle = "#007acc";
      ctx.font = "bold 24px Arial";
      ctx.fillText(`Step ${i + 1}:`, 140, 70);

      // Step text
      ctx.fillStyle = "#000000";
      ctx.font = "20px Arial";
      wrapText(ctx, steps[i], 140, 110, 440, 26);

      await speak(steps[i]);
      await new Promise((res) => setTimeout(res, 500));
    }
  };

  const wrapText = (ctx, text, x, y, maxWidth, lineHeight) => {
    const words = text.split(" ");
    let line = "";
    let testLine = "";

    const lines = [];

    for (let n = 0; n < words.length; n++) {
      testLine += words[n] + " ";
      const width = ctx.measureText(testLine).width;
      if (width > maxWidth && n > 0) {
        lines.push(line);
        line = words[n] + " ";
        testLine = words[n] + " ";
      } else {
        line = testLine;
      }
    }
    lines.push(line);

    for (let i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i], x, y + i * lineHeight);
    }
  };

  return (
    <div style={{ padding: 20, textAlign: "center", fontFamily: "Arial, sans-serif" }}>
      <h1>📽 Math AI Video Solver</h1>

      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Enter a math problem"
        style={{
          padding: "10px",
          width: "60%",
          fontSize: "16px",
          border: "1px solid #ccc",
          borderRadius: "4px"
        }}
      />
      <button
        onClick={handleSubmit}
        style={{ padding: "10px 20px", marginLeft: "10px", fontSize: "16px" }}
      >
        {loading ? "Generating..." : "Generate Video"}
      </button>

      <canvas
        ref={canvasRef}
        width={600}
        height={200}
        style={{ marginTop: "20px", border: "1px solid #ccc" }}
      />

      {videoURL && (
        <div style={{ marginTop: "20px" }}>
          <h3>🎬 Preview & Download</h3>
          <video src={videoURL} controls style={{ width: "600px" }} />
          <a href={videoURL} download="math_solution_video.webm">
            <button style={{ marginTop: "10px", padding: "10px 20px" }}>⬇️ Download Video</button>
          </a>
        </div>
      )}
    </div>
  );
}
