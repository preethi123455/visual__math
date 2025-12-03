import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const Visualizer = () => {
  const mountRef = useRef(null);
  const rendererRef = useRef(null); // Store renderer persistently
  const [problem, setProblem] = useState("");
  const [explanation, setExplanation] = useState("");
  const [renderKey, setRenderKey] = useState(0);

  const handleSubmit = async () => {
    if (!problem) return;

    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer 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", // Replace with a valid API key
        },
        body: JSON.stringify({
          model: "llama3-8b-8192",
          messages: [
            {
              role: "user",
              content: `Explain this mathematical concept visually and step-by-step: ${problem}`,
            },
          ],
        }),
      });

      const data = await res.json();
      const text = data.choices?.[0]?.message?.content || "❌ Unable to fetch explanation.";
      setExplanation(text);
      setRenderKey((prev) => prev + 1); // Trigger rerender
    } catch (err) {
      console.error(err);
      setExplanation("❌ Failed to fetch explanation.");
    }
  };

  useEffect(() => {
    if (!mountRef.current) return;

    // Clear previous canvas
    if (rendererRef.current) {
      rendererRef.current.dispose();
      rendererRef.current.forceContextLoss();
      if (mountRef.current.firstChild) {
        mountRef.current.removeChild(mountRef.current.firstChild);
      }
    }

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
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Helpers
    scene.add(new THREE.GridHelper(10, 10));
    scene.add(new THREE.AxesHelper(5));

    // Visual rendering based on concept
    const renderConcept = (concept) => {
      const lower = concept.toLowerCase();

      if (lower.includes("x + y + z = 1")) {
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
        const length = 4;
        const hex = 0xff0000;
        const arrowHelper = new THREE.ArrowHelper(dir, origin, length, hex);
        scene.add(arrowHelper);
      }

      if (lower.includes("line")) {
        const material = new THREE.LineBasicMaterial({ color: 0x0000ff });
        const points = [];
        points.push(new THREE.Vector3(-5, -5, -5));
        points.push(new THREE.Vector3(5, 5, 5));
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geometry, material);
        scene.add(line);
      }

      if (lower.includes("cube")) {
        const geometry = new THREE.BoxGeometry();
        const material = new THREE.MeshNormalMaterial();
        const cube = new THREE.Mesh(geometry, material);
        scene.add(cube);
      }

      if (lower.includes("circle")) {
        const geometry = new THREE.CircleGeometry(2, 32);
        const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
        const circle = new THREE.Mesh(geometry, material);
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
        placeholder="Enter math concept like 'vector', 'plane', 'x + y + z = 1'"
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
    fontFamily: "Arial, sans-serif",
    backgroundColor: "skyblue",
    color: "#fff",
    minHeight: "100vh",
    padding: "20px",
  },
  header: {
    fontSize: "2.5rem",
    marginBottom: "20px",
  },
  input: {
    padding: "10px",
    fontSize: "1rem",
    width: "60%",
    borderRadius: "6px",
    border: "none",
    outline: "none",
    marginBottom: "10px",
  },
  button: {
    padding: "10px 20px",
    fontSize: "1rem",
    backgroundColor: "#ffffff",
    color: "#0077cc",
    border: "2px solid #0077cc",
    borderRadius: "8px",
    cursor: "pointer",
    marginLeft: "10px",
  },
  visual: {
    width: "100%",
    height: "400px",
    border: "2px solid white",
    borderRadius: "10px",
    marginTop: "20px",
  },
  explanationBox: {
    backgroundColor: "#ffffff",
    color: "#003366",
    marginTop: "30px",
    padding: "20px",
    borderRadius: "10px",
    textAlign: "left",
    maxWidth: "900px",
    margin: "30px auto",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },
  explanationText: {
    fontSize: "1.1rem",
    lineHeight: "1.6",
  },
};

export default Visualizer;
