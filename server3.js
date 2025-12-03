const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path");

const app = express();
app.use(express.json());
app.use(cors({ origin: "*" }));

const MONGO_URI = "mongodb://localhost:27017/yourDatabaseName";

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// Define Doctor Schema
const doctorSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  licenseNumber: { type: String, required: true },
  experience: { type: Number, required: true },
  specialization: { type: String, required: true },
  document: { type: String, required: true },
});

// Define Appointment Schema (Now Includes userEmail)
const appointmentSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  selectedDoctor: { type: String, required: true },
  appointmentDate: { type: String, required: true },
  appointmentTime: { type: String, required: true },
  meetLink: { type: String, required: true },
});

// Define Schema for Removed Appointments
const removedAppointmentSchema = new mongoose.Schema({
  userEmail: String,
  selectedDoctor: String,
  appointmentDate: String,
  appointmentTime: String,
  deletedAt: { type: Date, default: Date.now }
});

// Create Models
const Doctor = mongoose.model("Doctor", doctorSchema);
const Appointment = mongoose.model("Appointment", appointmentSchema);
const RemovedAppointment = mongoose.model("RemovedAppointment", removedAppointmentSchema);

// Storage Configuration for Multer (For Document Uploads)
const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// API: Get List of Doctors
app.get("/doctors", async (req, res) => {
  try {
    const doctors = await Doctor.find();
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch doctors" });
  }
});

// API: Add a Doctor (With Document Upload)
app.post("/doctors", upload.single("document"), async (req, res) => {
  try {
    const newDoctor = new Doctor({
      fullName: req.body.fullName,
      licenseNumber: req.body.licenseNumber,
      experience: req.body.experience,
      specialization: req.body.specialization,
      document: req.file.path,
    });
    await newDoctor.save();
    res.status(201).json(newDoctor);
  } catch (error) {
    res.status(500).json({ error: "Failed to add doctor" });
  }
});

// API: Book an Appointment (Includes userEmail)
app.post("/appointments", async (req, res) => {
  try {
    const { userEmail, selectedDoctor, appointmentDate, appointmentTime, meetLink } = req.body;

    // Check if doctor is already booked
    const existingAppointment = await Appointment.findOne({ selectedDoctor });
    if (existingAppointment) {
      return res.status(400).json({ error: "This doctor is already booked for an appointment." });
    }

    // If doctor is available, book the appointment
    const newAppointment = new Appointment({ userEmail, selectedDoctor, appointmentDate, appointmentTime, meetLink });
    await newAppointment.save();
    res.status(201).json(newAppointment);
  } catch (error) {
    res.status(500).json({ error: "Failed to book appointment" });
  }
});

// API: Get Appointments (Filter by userEmail)
app.get("/appointments", async (req, res) => {
  try {
    const { userEmail } = req.query;
    const query = userEmail ? { userEmail } : {}; // Fetch appointments for a specific user if email is provided
    const appointments = await Appointment.find(query);
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch appointments" });
  }
});

// API: Delete an Appointment (Move to Removed Appointments Collection)
app.delete("/appointments/:id", async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (appointment) {
      await new RemovedAppointment(appointment.toObject()).save();
      await Appointment.findByIdAndDelete(req.params.id);
      res.json({ message: "Appointment removed and stored for verification." });
    } else {
      res.status(404).json({ error: "Appointment not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to delete appointment" });
  }
});

// Serve Uploaded Files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const PORT = 8000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
