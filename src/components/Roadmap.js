import React, { useState } from "react";
import ReactFlow, { MiniMap, Controls, Background } from "reactflow";
import "reactflow/dist/style.css";

const Roadmap = () => {
  const [level, setLevel] = useState("");
  const [topic, setTopic] = useState("");
  const [roadmapData, setRoadmapData] = useState({ nodes: [], edges: [] });
  const [loading, setLoading] = useState(false);

  const BACKEND_URL =
    "https://visual-math-oscg.onrender.com/generate-roadmap"; // ✅ secure

  const fetchRoadmap = async () => {
    if (!topic.trim() || !level) {
      alert("Please select a level and enter a math topic.");
      return;
    }
    setLoading(true);

    try {
      const response = await fetch(BACKEND_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, level }),
      });

      if (!response.ok) throw new Error("Backend error");

      const data = await response.json();
      const roadmapText = data.choices?.[0]?.message?.content?.trim();
      if (!roadmapText) throw new Error("No roadmap received");

      const jsonMatch = roadmapText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("Invalid JSON in response");

      const parsed = JSON.parse(jsonMatch[0]);

      const formattedNodes = parsed.nodes.map((node) => ({
        ...node,
        data: { label: String(node.data.label) },
      }));

      setRoadmapData({ nodes: formattedNodes, edges: parsed.edges });
    } catch (err) {
      console.error("Roadmap error:", err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>
        🧠 Math Learning <span style={styles.highlight}>Roadmap Generator</span>
      </h1>
      <p style={styles.description}>
        Select your level and enter a math topic to generate your custom roadmap!
      </p>

      <div style={styles.levelButtons}>
        {["Beginner", "Intermediate", "Advanced"].map((lvl) => (
          <button
            key={lvl}
            onClick={() => setLevel(lvl)}
            style={level === lvl ? styles.selectedBtn : styles.levelBtn}
          >
            {lvl === "Beginner" ? "🟢" : lvl === "Intermediate" ? "🟡" : "🔴"}{" "}
            {lvl}
          </button>
        ))}
      </div>

      <input
        type="text"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        placeholder="Enter a math topic (e.g., Algebra)"
        style={styles.input}
      />

      <button onClick={fetchRoadmap} style={styles.generateBtn} disabled={loading}>
        {loading ? "Generating..." : "Generate Roadmap"}
      </button>

      {roadmapData.nodes.length > 0 && (
        <div style={styles.flowContainer}>
          <ReactFlow nodes={roadmapData.nodes} edges={roadmapData.edges} fitView>
            <MiniMap style={{ backgroundColor: "#e0f7fa" }} />
            <Controls />
            <Background variant="dots" gap={12} size={1} />
          </ReactFlow>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    textAlign: "center",
    padding: "30px",
    background: "linear-gradient(to right,#C3B1E1, #e0f7fa)",
    minHeight: "100vh",
    color: "#333",
  },
  title: { fontSize: "30px", fontWeight: "bold" },
  highlight: { color: "#007acc" },
  description: { fontSize: "16px", marginBottom: "20px" },
  levelButtons: { marginBottom: "20px" },
  levelBtn: {
    padding: "10px 20px",
    margin: "0 10px",
    fontSize: "16px",
    borderRadius: "10px",
    border: "2px solid #007acc",
    backgroundColor: "#ffffff",
    color: "#007acc",
    cursor: "pointer",
  },
  selectedBtn: {
    padding: "10px 20px",
    margin: "0 10px",
    fontSize: "16px",
    borderRadius: "10px",
    border: "2px solid #007acc",
    backgroundColor: "#007acc",
    color: "#ffffff",
    cursor: "pointer",
  },
  input: {
    padding: "12px",
    fontSize: "16px",
    width: "300px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    marginBottom: "15px",
    textAlign: "center",
  },
  generateBtn: {
    padding: "10px 20px",
    fontSize: "16px",
    fontWeight: "bold",
    color: "#fff",
    backgroundColor: "#007acc",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    marginLeft: "10px",
  },
  flowContainer: {
    height: "500px",
    width: "90%",
    margin: "30px auto",
    border: "2px solid #007acc",
    borderRadius: "10px",
    backgroundColor: "#fff",
    padding: "10px",
  },
};

export default Roadmap;
