const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");

const app = express();
const PORT = 10000;

// Middleware
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/mentorsDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const mentorSchema = new mongoose.Schema({
  fullName: String,
  email: String,
  phoneNumber: String,
  specialization: String,
  experience: Number,
  qualification: String,
  certificate: String, // Base64 string
});

const Mentor = mongoose.model("Mentor", mentorSchema);

// Multer Storage (Memory, No Uploads Folder)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Mentor Verification API
app.post("/mentor-verification", upload.single("certificate"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Certificate file is required" });
    }

    // Convert file to Base64
    const certificateBase64 = req.file.buffer.toString("base64");

    const newMentor = new Mentor({
      fullName: req.body.fullName,
      email: req.body.email,
      phoneNumber: req.body.phoneNumber,
      specialization: req.body.specialization,
      experience: req.body.experience,
      qualification: req.body.qualification,
      certificate: certificateBase64,
    });

    await newMentor.save();
    res.json({ success: true, message: "Mentor verification submitted successfully!" });
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
