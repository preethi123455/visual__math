import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const Visualizer = () => {
  const mountRef = useRef(null);
  const rendererRef = useRef(null);
  const [problem, setProblem] = useState("");
  const [explanation, setExplanation] = useState("");
  const [renderKey, setRenderKey] = useState(0);

  // BACKEND URL — SAFE
  const BACKEND_URL = "https://visual-math-oscg.onrender.com/generate-quiz";

  const handleSubmit = async () => {
    if (!problem.trim()) return;

    try {
      const res = await fetch(BACKEND_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content:
                "You are a math visual explanation assistant. Explain topics visually and step-by-step.",
            },
            {
              role: "user",
              content: `Explain this mathematical concept visually and step-by-step: ${problem}`,
            },
          ],
        }),
      });

      if (!res.ok) {
        throw new Error("Backend error: " + res.status);
      }

      const data = await res.json();
      const text = data.choices?.[0]?.message?.content || "❌ Unable to fetch explanation.";

      setExplanation(text);
      setRenderKey((prev) => prev + 1);
    } catch (err) {
      console.error(err);
      setExplanation("❌ Failed to fetch explanation.");
    }
  };

  useEffect(() => {
    if (!mountRef.current) return;

    // Clear old canvas
    if (rendererRef.current) {
      rendererRef.current.dispose();
      rendererRef.current.forceContextLoss();
      if (mountRef.current.firstChild) {
        mountRef.current.removeChild(mountRef.current.firstChild);
      }
    }

    // Setup Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("skyblue");

    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(6, 6, 6);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(
      mountRef.current.clientWidth,
      mountRef.current.clientHeight
    );
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Helpers
    scene.add(new THREE.GridHelper(10, 10));
    scene.add(new THREE.AxesHelper(5));

    // Render objects based on concept
    const renderConcept = (concept) => {
      const lower = concept.toLowerCase();

      if (lower.includes("plane") || lower.includes("x + y + z = 1")) {
        const geometry = new THREE.PlaneGeometry(10, 10);
        const material = new THREE.MeshBasicMaterial({
          color: 0xffffff,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.6,
        });
        const plane = new THREE.Mesh(geometry, material);
        plane.rotation.x = Math.PI / 4;
        plane.rotation.y = Math.PI / 4;
        scene.add(plane);
      }

      if (lower.includes("vector")) {
        const dir = new THREE.Vector3(1, 1, 0).normalize();
        const origin = new THREE.Vector3(0, 0, 0);
        const arrow = new THREE.ArrowHelper(dir, origin, 4, 0xff0000);
        scene.add(arrow);
      }

      if (lower.includes("line")) {
        const material = new THREE.LineBasicMaterial({ color: 0x0000ff });
        const points = [
          new THREE.Vector3(-5, -5, -5),
          new THREE.Vector3(5, 5, 5),
        ];
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geometry, material);
        scene.add(line);
      }

      if (lower.includes("cube")) {
        const cube = new THREE.Mesh(
          new THREE.BoxGeometry(),
          new THREE.MeshNormalMaterial()
        );
        scene.add(cube);
      }

      if (lower.includes("circle")) {
        const circle = new THREE.Mesh(
          new THREE.CircleGeometry(2, 32),
          new THREE.MeshBasicMaterial({ color: 0xffff00 })
        );
        circle.rotation.x = -Math.PI / 2;
        scene.add(circle);
      }
    };

    renderConcept(problem);

    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      renderer.dispose();
      renderer.forceContextLoss();
      if (mountRef.current?.firstChild) {
        mountRef.current.removeChild(mountRef.current.firstChild);
      }
    };
  }, [renderKey]);

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>📐 3D Math Visualizer</h1>

      <input
        style={styles.input}
        placeholder="Enter concept: vector, cube, line, plane..."
        value={problem}
        onChange={(e) => setProblem(e.target.value)}
      />

      <button style={styles.button} onClick={handleSubmit}>
        🔍 Explain & Visualize
      </button>

      <div ref={mountRef} style={styles.visual}></div>

      {explanation && (
        <div style={styles.explanationBox}>
          <h3>🧠 Step-by-Step Explanation:</h3>
          <p style={styles.explanationText}>{explanation}</p>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    textAlign: "center",
    fontFamily: "Arial",
    backgroundColor: "skyblue",
    minHeight: "100vh",
    padding: 20,
    color: "white",
  },
  header: { fontSize: "2.4rem", marginBottom: 20 },
  input: {
    padding: 10,
    width: "60%",
    borderRadius: 6,
    border: "none",
  },
  button: {
    padding: "10px 20px",
    marginLeft: 10,
    borderRadius: 8,
    background: "white",
    color: "#0077cc",
    border: "2px solid #0077cc",
    cursor: "pointer",
  },
  visual: {
    width: "100%",
    height: 400,
    borderRadius: 10,
    background: "white",
    marginTop: 20,
  },
  explanationBox: {
    marginTop: 30,
    background: "white",
    padding: 20,
    borderRadius: 10,
    color: "#003366",
    maxWidth: 900,
    margin: "30px auto",
    textAlign: "left",
  },
  explanationText: { fontSize: "1.1rem", lineHeight: 1.6 },
};

export default Visualizer;
