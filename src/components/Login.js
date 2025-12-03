import React, { useState } from "react";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errorMessage, setErrorMessage] = useState(""); // Added error handling

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message);
        localStorage.setItem("userEmail", formData.email); // Store email in localStorage
        window.location.href = "/profile"; // Navigate if successful
      } else {
        setErrorMessage(data.message || "Invalid email or password"); // Show error if login fails
      }
    } catch (error) {
      setErrorMessage("Server error. Please try again later.");
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Login</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          required
          onChange={handleChange}
          style={styles.input}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          required
          onChange={handleChange}
          style={styles.input}
        />
        {errorMessage && <p style={styles.error}>{errorMessage}</p>} {/* Display error if login fails */}
        <button type="submit" style={styles.button}>Login</button>
      </form>
      <p style={styles.linkText}>
        Don't have an account? <a href="/signup" style={styles.link}>Sign Up</a>
      </p>
    </div>
  );
};

const styles = {
  container: {
    width: "350px",
    margin: "auto",
    padding: "20px",
    textAlign: "center",
    backgroundColor: "#F8F9FF",
    borderRadius: "10px",
    boxShadow: "0px 4px 10px rgba(0,0,0,0.1)",
  },
  heading: { color: "#6B21A8" },
  form: { display: "flex", flexDirection: "column", gap: "10px" },
  input: {
    padding: "10px",
    borderRadius: "5px",
    border: "1px solid #6B21A8",
  },
  button: {
    padding: "10px",
    backgroundColor: "#6B21A8",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  error: {
    color: "red",
    fontSize: "14px",
    marginBottom: "10px",
  },
  linkText: { marginTop: "10px", color: "#6B21A8" },
  link: {
    textDecoration: "none",
    color: "#8B5CF6",
    fontWeight: "bold",
  },
};

export default Login;
