// server.js
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const cors = require("cors");
const fetch = require("node-fetch");
require("dotenv").config();

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: "*", // later replace with your frontend domain
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);

// ----------------------
// 🔵 DATABASE
// ----------------------
mongoose
  .connect(
    "mongodb+srv://preethi:Preethi123@cluster0.5zvyv1w.mongodb.net/educonnect"
  )
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// ----------------------
// 🔵 USER MODEL
// ----------------------
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  phone: String,
  password: String,
});
const User = mongoose.model("User", userSchema);

// ----------------------
// 🔵 SIMPLE TEST ROUTE
// ----------------------
app.get("/", (req, res) => {
  res.send("EduConnect Backend Running ✔️");
});

// ----------------------
// 🔵 SIGNUP ROUTE
// ----------------------
app.post("/signup", async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    const hashed = await bcrypt.hash(password, 10);

    const user = new User({ name, email, phone, password: hashed });
    await user.save();

    res.status(201).json({ message: "Signup successful" });
  } catch (err) {
    res.status(400).json({ message: "User already exists" });
  }
});

// ----------------------
// 🔵 LOGIN ROUTE
// ----------------------
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ message: "Invalid credentials" });

  res.json({ message: "Login successful" });
});

// ---------------------------------------------------
// ⭐ NEW: GROQ QUIZ GENERATION ROUTE (SAFE)
// ---------------------------------------------------
app.post("/api/generate-quiz", async (req, res) => {
  const { topic, level } = req.body;

  try {
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system",
              content: `
              Return ONLY JSON:
              {
                "quiz": [
                  {
                    "question": "string",
                    "options": ["A","B","C","D"],
                    "correctAnswer": "string"
                  }
                ]
              }
            `,
            },
            {
              role: "user",
              content: `Generate 3 ${level} level math questions about ${topic}`,
            },
          ],
        }),
      }
    );

    const data = await response.json();
    const parsed = JSON.parse(data.choices[0].message.content);

    res.json(parsed);
  } catch (err) {
    console.error("GROQ ERROR:", err);
    res.status(500).json({ error: "Quiz generation failed" });
  }
});

// ----------------------
// 🔵 START SERVER
// ----------------------
app.listen(process.env.PORT || 5000, () =>
  console.log("Server running on port", process.env.PORT || 5000)
);
