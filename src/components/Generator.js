import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const Visualizer = () => {
  const mountRef = useRef(null);
  const rendererRef = useRef(null);
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
          Authorization: "Bearer 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",
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
      setRenderKey((prev) => prev + 1);
    } catch (err) {
      console.error(err);
      setExplanation("❌ Failed to fetch explanation.");
    }
  };

  useEffect(() => {
    if (!mountRef.current || !problem) return;

    if (rendererRef.current) {
      rendererRef.current.dispose?.();
      rendererRef.current.forceContextLoss?.();
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

    scene.add(new THREE.GridHelper(10, 10));
    scene.add(new THREE.AxesHelper(5));

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 10, 7.5);
    scene.add(light);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;

    const lower = problem.toLowerCase();

    if (/^[xyz=+\-*/^ 0-9]+$/.test(lower)) {
      const planeGeometry = new THREE.PlaneGeometry(10, 10);
      const planeMaterial = new THREE.MeshBasicMaterial({
        color: 0xffcc00,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.5,
      });
      const plane = new THREE.Mesh(planeGeometry, planeMaterial);
      plane.rotation.x = Math.PI / 2;
      scene.add(plane);
    }

    if (lower.includes("square")) {
      const square = new THREE.Mesh(
        new THREE.PlaneGeometry(4, 4),
        new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide })
      );
      square.rotation.x = Math.PI / 2;
      scene.add(square);
    }

    if (lower.includes("triangle")) {
      const triangleGeometry = new THREE.BufferGeometry();
      const triangleVertices = new Float32Array([0, 0, 0, 4, 0, 0, 2, 3, 0]);
      triangleGeometry.setAttribute("position", new THREE.BufferAttribute(triangleVertices, 3));
      const triangle = new THREE.Mesh(
        triangleGeometry,
        new THREE.MeshBasicMaterial({ color: 0xff00ff, side: THREE.DoubleSide })
      );
      triangle.rotation.x = Math.PI / 2;
      scene.add(triangle);
    }

    if (lower.includes("cube")) {
      const cube = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 2), new THREE.MeshNormalMaterial());
      scene.add(cube);
    }

    if (lower.includes("cuboid")) {
      const cuboid = new THREE.Mesh(
        new THREE.BoxGeometry(2, 1, 3),
        new THREE.MeshStandardMaterial({ color: 0x8e44ad })
      );
      cuboid.position.set(3, 0.5, 0);
      scene.add(cuboid);
    }

    if (lower.includes("pyramid")) {
      const pyramid = new THREE.Mesh(
        new THREE.ConeGeometry(2, 3, 4),
        new THREE.MeshStandardMaterial({ color: 0xe67e22 })
      );
      pyramid.position.set(-3, 1.5, 0);
      scene.add(pyramid);
    }

    if (lower.includes("circle")) {
      const circle = new THREE.Mesh(
        new THREE.CircleGeometry(2, 32),
        new THREE.MeshBasicMaterial({ color: 0xffff00 })
      );
      circle.rotation.x = -Math.PI / 2;
      circle.position.set(0, 0.01, 3);
      scene.add(circle);
    }

    if (lower.includes("sphere")) {
      const sphere = new THREE.Mesh(
        new THREE.SphereGeometry(1.5, 32, 32),
        new THREE.MeshStandardMaterial({ color: 0x3498db })
      );
      sphere.position.set(-4, 1.5, -2);
      scene.add(sphere);
    }

    if (lower.includes("cylinder")) {
      const cylinder = new THREE.Mesh(
        new THREE.CylinderGeometry(1, 1, 3, 32),
        new THREE.MeshStandardMaterial({ color: 0x2ecc71 })
      );
      cylinder.position.set(4, 1.5, -2);
      scene.add(cylinder);
    }

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      renderer.dispose?.();
      renderer.forceContextLoss?.();
      if (mountRef.current?.firstChild) {
        mountRef.current.removeChild(mountRef.current.firstChild);
      }
    };
  }, [renderKey]);

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>📐 3D Math Visualizer</h1>

      <input
        style={{ ...styles.input, color: "#000" }}
        placeholder="Enter any math concept (e.g., cube, sphere, x+y=1...)"
        value={problem}
        onChange={(e) => setProblem(e.target.value)}
      />
      <button style={styles.button} onClick={handleSubmit}>
        🔍 Explain & Visualize
      </button>

      {problem && <div ref={mountRef} style={styles.visual}></div>}

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
    backgroundColor: "#C3B1E1",
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
    backgroundColor: "#fff",
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
