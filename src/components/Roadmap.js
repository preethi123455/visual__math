import React, { useState } from "react";
import ReactFlow, { MiniMap, Controls, Background } from "reactflow";
import "reactflow/dist/style.css";

const Roadmap = () => {
  const [level, setLevel] = useState("");
  const [topic, setTopic] = useState("");
  const [roadmapData, setRoadmapData] = useState({ nodes: [], edges: [] });
  const [loading, setLoading] = useState(false);

  // ✅ USE EXISTING BACKEND ROUTE
  const BACKEND_URL =
    "https://visual-math-oscg.onrender.com/generate-quiz";

  const fetchRoadmap = async () => {
    if (!topic.trim() || !level) {
      alert("Please select a level and enter a topic");
      return;
    }

    setLoading(true);
    setRoadmapData({ nodes: [], edges: [] });

    try {
      const response = await fetch(BACKEND_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content: `
You are a roadmap generator.
Return ONLY valid JSON in this exact format:

{
  "nodes": [
    { "id": "1", "position": { "x": 0, "y": 0 }, "data": { "label": "Topic" } }
  ],
  "edges": [
    { "id": "e1-2", "source": "1", "target": "2" }
  ]
}

NO explanation.
NO markdown.
NO text outside JSON.
              `,
            },
            {
              role: "user",
              content: `Create a ${level} learning roadmap for ${topic}`,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error("Backend returned error");
      }

      const data = await response.json();
      const content = data?.choices?.[0]?.message?.content;

      if (!content) {
        throw new Error("Empty AI response");
      }

      // 🔥 Extract JSON safely
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("Invalid JSON format from AI");
      }

      const parsed = JSON.parse(jsonMatch[0]);

      // ReactFlow safety
      const nodes = parsed.nodes.map((n) => ({
        ...n,
        data: { label: String(n.data.label) },
      }));

      setRoadmapData({
        nodes,
        edges: parsed.edges || [],
      });
    } catch (err) {
      console.error("Roadmap error:", err);
      alert("Failed to generate roadmap. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>
        🧠 Math Learning <span style={styles.highlight}>Roadmap</span>
      </h1>

      <p style={styles.description}>
        Select level and enter topic to generate a learning roadmap
      </p>

      <div style={styles.levelButtons}>
        {["Beginner", "Intermediate", "Advanced"].map((lvl) => (
          <button
            key={lvl}
            onClick={() => setLevel(lvl)}
            style={level === lvl ? styles.selectedBtn : styles.levelBtn}
          >
            {lvl}
          </button>
        ))}
      </div>

      <input
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        placeholder="Enter topic (e.g., Algebra)"
        style={styles.input}
      />

      <br />

      <button
        onClick={fetchRoadmap}
        style={styles.generateBtn}
        disabled={loading}
      >
        {loading ? "Generating..." : "Generate Roadmap"}
      </button>

      {roadmapData.nodes.length > 0 && (
        <div style={styles.flowContainer}>
          <ReactFlow
            nodes={roadmapData.nodes}
            edges={roadmapData.edges}
            fitView
          >
            <MiniMap />
            <Controls />
            <Background variant="dots" gap={12} size={1} />
          </ReactFlow>
        </div>
      )}
    </div>
  );
};

// ---------------- STYLES ----------------
const styles = {
  container: {
    textAlign: "center",
    padding: "30px",
    background: "linear-gradient(to right,#C3B1E1,#e0f7fa)",
    minHeight: "100vh",
  },
  title: { fontSize: "32px", fontWeight: "bold" },
  highlight: { color: "#007acc" },
  description: { marginBottom: "20px" },
  levelButtons: { marginBottom: "20px" },
  levelBtn: {
    padding: "10px 20px",
    margin: "0 10px",
    borderRadius: "10px",
    border: "2px solid #007acc",
    background: "#fff",
    cursor: "pointer",
  },
  selectedBtn: {
    padding: "10px 20px",
    margin: "0 10px",
    borderRadius: "10px",
    border: "2px solid #007acc",
    background: "#007acc",
    color: "#fff",
  },
  input: {
    padding: "12px",
    width: "300px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    marginBottom: "15px",
    textAlign: "center",
  },
  generateBtn: {
    padding: "10px 20px",
    background: "#007acc",
    color: "#fff",
    borderRadius: "10px",
    border: "none",
    cursor: "pointer",
  },
  flowContainer: {
    height: "500px",
    width: "90%",
    margin: "30px auto",
    background: "#fff",
    borderRadius: "10px",
    border: "2px solid #007acc",
  },
};

export default Roadmap;
