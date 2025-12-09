// server.js
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const cors = require("cors");

// FIX: dynamic import for node-fetch (because v3 is ESM only)
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

require("dotenv").config(); // loads GROQ_API_KEY

const app = express();
app.use(express.json());

// ------------------- CORS FIXED -------------------
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://visual-math-frontend.onrender.com" // ✅ REPLACE with your correct frontend domain
    ],
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);

// ------------------- MongoDB Connection -------------------
mongoose
  .connect(
    "mongodb+srv://preethi:Preethi123@cluster0.5zvyv1w.mongodb.net/educonnect?retryWrites=true&w=majority"
  )
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.log("❌ Database Error:", err));

// ------------------- User Schema -------------------
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  phone: String,
  password: String,
});

const User = mongoose.model("User", userSchema);

// ------------------- Test Route -------------------
app.get("/", (req, res) => {
  res.send("Backend is running");
});

// ------------------- Signup -------------------
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

// ------------------- Login -------------------
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await bcrypt.compare(password, user.password))) {
    res.status(200).json({ message: "Login successful!" });
  } else {
    res.status(401).json({ message: "Invalid credentials!" });
  }
});

// ------------------- AI Chat Route -------------------
app.post("/generate-quiz", async (req, res) => {
  try {
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`, // Secure from env
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

// ------------------- Server Start -------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
