import React, { useState, useEffect, useRef } from "react";

const MathRPG = () => {
  const [question, setQuestion] = useState("");
  const [userAnswer, setUserAnswer] = useState("");
  const [result, setResult] = useState("");
  const [enemyHP, setEnemyHP] = useState(100);
  const [playerHP, setPlayerHP] = useState(100);
  const [loading, setLoading] = useState(false);
  const [chartsReady, setChartsReady] = useState(false);

  const gaugeRef = useRef(null);

  const BACKEND_URL = "https://visual-math-oscg.onrender.com/generate-quiz";

  /* ---------------- SAFE GOOGLE CHARTS LOADER ---------------- */
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://www.gstatic.com/charts/loader.js";
    script.async = true;

    script.onload = () => {
      window.google.charts.load("current", { packages: ["gauge"] });
      window.google.charts.setOnLoadCallback(() => {
        setChartsReady(true);
      });
    };

    document.body.appendChild(script);
  }, []);

  /* ---------------- SAFE GAUGE DRAW ---------------- */
  useEffect(() => {
    if (!chartsReady || !gaugeRef.current) return;

    const data = window.google.visualization.arrayToDataTable([
      ["Label", "Value"],
      ["Player", playerHP],
      ["Enemy", enemyHP],
    ]);

    const options = {
      width: 420,
      height: 200,
      redFrom: 0,
      redTo: 30,
      yellowFrom: 30,
      yellowTo: 60,
      greenFrom: 60,
      greenTo: 100,
      minorTicks: 5,
      max: 100,
    };

    const chart = new window.google.visualization.Gauge(gaugeRef.current);
    chart.draw(data, options);
  }, [chartsReady, playerHP, enemyHP]);

  /* ---------------- QUESTION GENERATION ---------------- */
  const generateQuestion = async () => {
    setLoading(true);
    setResult("");

    try {
      const response = await fetch(BACKEND_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content:
                "Generate a fun and simple math question for students. Provide only the question text.",
            },
            { role: "user", content: "Give one simple math question." },
          ],
        }),
      });

      const data = await response.json();
      setQuestion(data.choices?.[0]?.message?.content || "Solve: 2 + 2");
    } catch {
      setQuestion("Solve: 5 + 3");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- ANSWER CHECK ---------------- */
  const checkAnswer = async () => {
    if (!userAnswer.trim()) {
      setResult("⚠ Please enter an answer!");
      return;
    }

    try {
      const response = await fetch(BACKEND_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content:
                "Respond strictly with only one of: 'Correct', 'Partially Correct', or 'Wrong'.",
            },
            {
              role: "user",
              content: `Question: ${question}\nStudent Answer: ${userAnswer}`,
            },
          ],
        }),
      });

      const data = await response.json();
      const evalText =
        data.choices?.[0]?.message?.content?.toLowerCase() || "";

      if (evalText.includes("correct") && !evalText.includes("partially")) {
        setEnemyHP((hp) => Math.max(hp - 20, 0));
        setResult("✅ Correct! Critical hit!");
      } else if (evalText.includes("partially")) {
        setEnemyHP((hp) => Math.max(hp - 10, 0));
        setPlayerHP((hp) => Math.max(hp - 10, 0));
        setResult("⚠ Partial hit!");
      } else {
        setPlayerHP((hp) => Math.max(hp - 20, 0));
        setResult("❌ Miss! Enemy attacks!");
      }

      setUserAnswer("");

      setTimeout(() => {
        if (enemyHP > 0 && playerHP > 0) generateQuestion();
      }, 1200);
    } catch {
      setResult("Something went wrong!");
    }
  };

  useEffect(() => {
    generateQuestion();
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "2rem",
        color: "#fff",
        backgroundImage:
          "url(https://static.vecteezy.com/system/resources/previews/001/401/677/non_2x/abstract-polygonal-shape-black-background-free-vector.jpg)",
        backgroundSize: "cover",
        textAlign: "center",
        fontFamily: "Verdana, sans-serif",
      }}
    >
      <h1 style={{ fontSize: "2.5rem" }}>
        ⚔ MathRPG: Defeat the Evil Denominator!
      </h1>

      {/* 🧠 GOOGLE GAUGE (SAFE) */}
      <div
        ref={gaugeRef}
        style={{
          margin: "20px auto",
          background: "#fff",
          borderRadius: "12px",
          padding: "10px",
          width: "420px",
        }}
      />

      <div
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.6)",
          padding: "2rem",
          borderRadius: "20px",
          maxWidth: "600px",
          margin: "0 auto",
        }}
      >
        <p>
          <strong>📜 Question:</strong>{" "}
          {loading ? "Loading..." : question}
        </p>

        <input
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          placeholder="Enter your answer..."
          style={{
            padding: "0.8rem",
            borderRadius: "10px",
            width: "80%",
          }}
        />

        <br />

        <button
          onClick={checkAnswer}
          disabled={loading || enemyHP === 0 || playerHP === 0}
          style={{
            marginTop: "1rem",
            backgroundColor: "#00bcd4",
            padding: "0.8rem 1.6rem",
            borderRadius: "10px",
            color: "#fff",
            border: "none",
            cursor: "pointer",
          }}
        >
          🔥 Cast Spell
        </button>

        <p style={{ marginTop: "1rem", fontWeight: "bold" }}>{result}</p>

        {(enemyHP === 0 || playerHP === 0) && (
          <p style={{ fontSize: "1.2rem" }}>
            {enemyHP === 0
              ? "🏆 You defeated the Evil Denominator!"
              : "💀 You were defeated. Try again!"}
          </p>
        )}
      </div>
    </div>
  );
};

export default MathRPG;
