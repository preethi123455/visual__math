// =======================
// IMPORTS
// =======================
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const Groq = require("groq-sdk"); // ✅ correct import

require("dotenv").config();

// =======================
// APP + PORT
// =======================
const app = express();
const PORT = process.env.PORT || 5000;

// =======================
// MIDDLEWARE
// =======================
app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://visual-frontend-bsfk.onrender.com",
    ],
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// =======================
// GROQ API INIT
// =======================
if (!process.env.GROQ_API_KEY) {
  console.warn("⚠️ GROQ_API_KEY is not set in environment variables.");
}
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// =======================
// MONGO CONNECTION
// =======================
mongoose
  .connect(
    "mongodb+srv://preethi:Preethi123@cluster0.5zvyv1w.mongodb.net/visualmath"
  )
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// =======================
// USER SCHEMA
// =======================
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  phone: String,
  password: String,
});

const User = mongoose.model("User", userSchema);

// =======================
// FILE SCHEMA
// =======================
const fileSchema = new mongoose.Schema({
  filename: String,
  originalName: String,
  uploadDate: { type: Date, default: Date.now },
});
const File = mongoose.model("File", fileSchema);

// =======================
// MULTER UPLOAD CONFIG
// =======================
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) =>
    cb(
      null,
      Date.now() +
        "-" +
        Math.round(Math.random() * 1e9) +
        "-" +
        file.originalname
    ),
});
const upload = multer({ storage });

// =======================
// ROUTES
// =======================
app.get("/", (req, res) => {
  res.send("Backend is running ✅");
});

// -----------------------
// SIGNUP
// -----------------------
app.post("/signup", async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "User already exists!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({ name, email, phone, password: hashedPassword });
    await user.save();

    res.status(201).json({ message: "Signup successful!" });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Signup failed" });
  }
});

// -----------------------
// LOGIN
// -----------------------
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials!" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Invalid credentials!" });
    }

    res.status(200).json({ message: "Login successful!" });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Login failed" });
  }
});

// -----------------------
// QUIZ + AI CHAT
// -----------------------
app.post("/generate-quiz", async (req, res) => {
  try {
    const { messages } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Messages array is required" });
    }

    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant", // ✅ always instant
      messages,
      temperature: 0.7,
      max_tokens: 1024,
    });

    res.json(response);
  } catch (err) {
    console.error("AI /generate-quiz error:", err);
    res.status(500).json({ error: "AI generation failed" });
  }
});

// -----------------------
// PDF UPLOAD
// -----------------------
app.post("/api/upload", upload.single("pdf"), async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ error: "No file uploaded" });

    const newFile = new File({
      filename: req.file.filename,
      originalName: req.file.originalname,
    });

    await newFile.save();

    res.json({ message: "Uploaded successfully", file: req.file.filename });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Upload failed" });
  }
});

// Serve uploaded files
app.use("/uploads", express.static(uploadDir));

// -----------------------
// RAG QA FROM PDF
// -----------------------
app.post("/api/ask", async (req, res) => {
  try {
    const { question, filename } = req.body;

    if (!question || !filename)
      return res
        .status(400)
        .json({ error: "Missing question or filename" });

    const filePath = path.join(uploadDir, filename);
    if (!fs.existsSync(filePath))
      return res.status(404).json({ error: "File not found" });

    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(dataBuffer);
    const text = pdfData.text || "";

    // Chunk roughly 200 words per chunk
    const chunks = text.match(/(?:[^\s]+\s+){1,200}/g) || [];

    const relevant = chunks
      .filter((chunk) =>
        chunk.toLowerCase().includes(question.toLowerCase())
      )
      .slice(0, 3);

    const context =
      relevant.join("\n---\n") ||
      "No directly relevant context found in the PDF. Answer based on your best understanding.";

    const messages = [
      {
        role: "system",
        content:
          "You are a helpful assistant answering questions based ONLY on the given PDF context. If the answer is not in the context, clearly say that.",
      },
      {
        role: "user",
        content: `Context:\n${context}\n\nQuestion: ${question}`,
      },
    ];

    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant", // ✅ instant here too
      messages,
      max_tokens: 400,
      temperature: 0.5,
    });

    res.json({ answer: response.choices[0].message.content });
  } catch (err) {
    console.error("AI /api/ask error:", err);
    res.status(500).json({ error: "RAG QA failed" });
  }
});

// =======================
// START SERVER
// =======================
app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
