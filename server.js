// server.js
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const cors = require("cors");
const fetch = require("node-fetch");
require("dotenv").config(); // Load environment variables

const app = express();
app.use(express.json());

// ---------------- CORS FIXED ----------------
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://visual-frontend-bsfk.onrender.com"
    ],
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);

// ---------------- DATABASE CONNECTION ----------------
mongoose
  .connect(
    "mongodb+srv://preethi:Preethi123@cluster0.5zvyv1w.mongodb.net/educonnect?retryWrites=true&w=majority"
  )
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("Database Error:", err));

// ---------------- USER SCHEMA ----------------
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  phone: String,
  password: String,
});

const User = mongoose.model("User", userSchema);

// ---------------- TEST ROUTE ----------------
app.get("/", (req, res) => {
  res.send("Backend is running");
});

// ---------------- SIGNUP ----------------
app.post("/signup", async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      phone,
      password: hashedPassword,
    });

    await user.save();

    res.status(201).json({ message: "Signup successful!" });
  } catch (err) {
    res.status(400).json({ message: "User already exists!" });
  }
});

// ---------------- LOGIN ----------------
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await bcrypt.compare(password, user.password))) {
    res.status(200).json({ message: "Login successful!" });
  } else {
    res.status(401).json({ message: "Invalid credentials!" });
  }
});

// ---------------- QUIZ GENERATION (GROQ API) ----------------
app.post("/generate-quiz", async (req, res) => {
  try {
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify(req.body),
      }
    );

    const data = await response.json();

    res.json(data);
  } catch (error) {
    console.error("Groq API error:", error);
    res.status(500).json({ error: "Failed to generate quiz" });
  }
});

// ---------------- START SERVER ----------------
app.listen(process.env.PORT || 5000, () =>
  console.log("Server running on port " + (process.env.PORT || 5000))
);
