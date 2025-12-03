import React, { useState } from "react";

const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    age: "", // Added age
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch("http://localhost:5000/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await response.json();
    alert(data.message);
    if (response.ok) window.location.href = "/login";
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Signup</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input type="text" name="name" placeholder="Name" required onChange={handleChange} style={styles.input} />
        <input type="email" name="email" placeholder="Email" required onChange={handleChange} style={styles.input} />
        <input type="tel" name="phone" placeholder="Phone Number" required onChange={handleChange} style={styles.input} />
        <input type="number" name="age" placeholder="Age" required onChange={handleChange} style={styles.input} /> {/* New Age Field */}
        <input type="password" name="password" placeholder="Password" required onChange={handleChange} style={styles.input} />
        <button type="submit" style={styles.button}>Sign Up</button>
      </form>
      <p style={styles.linkText}>Already have an account? <a href="/login" style={styles.link}>Login</a></p>
    </div>
  );
};

const styles = {
  container: { width: "350px", margin: "auto", padding: "20px", textAlign: "center", backgroundColor: "#F8F9FF", borderRadius: "10px", boxShadow: "0px 4px 10px rgba(0,0,0,0.1)" },
  heading: { color: "#6B21A8" },
  form: { display: "flex", flexDirection: "column", gap: "10px" },
  input: { padding: "10px", borderRadius: "5px", border: "1px solid #6B21A8" },
  button: { padding: "10px", backgroundColor: "#6B21A8", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" },
  linkText: { marginTop: "10px", color: "#6B21A8" },
  link: { textDecoration: "none", color: "#8B5CF6", fontWeight: "bold" }
};

export default Signup;
