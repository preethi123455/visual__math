require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const faceapi = require('face-api.js');
const canvas = require('canvas');
const path = require('path');
const cartRoutes = require('./routes/cartRoutes');

const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

const app = express();

// 🔹 Body parser
app.use(express.json({ limit: '10mb' }));

// 🔹 CORS - allow local and deployed frontend
const allowedOrigins = [
  'http://localhost:3000',
  'https://educonnect-platform-frontend.onrender.com',
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // Allow Postman / server requests
      if (allowedOrigins.indexOf(origin) === -1) {
        return callback(new Error('❌ CORS policy blocked this origin'), false);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

// 🔹 MongoDB connection (Atlas or fallback to localhost)
const MONGO_URI =
  process.env.MONGO_URI ||
  'mongodb+srv://preethi:Preethi1234@cluster0.umdwxhv.mongodb.net/faceAuthDB';

mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('✅ MongoDB Connected'))
  .catch((error) => console.error('❌ MongoDB Connection Error:', error));

// 🔹 User schema (Face Authentication)
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true },
  email: { type: String, required: true, unique: true },
  faceDescriptors: { type: [[Number]], required: true },
});

const User = mongoose.model('User', userSchema);

// 🔹 Load Face Recognition Models
async function loadModels() {
  try {
    const modelsPath = path.join(__dirname, 'models'); // Ensure 'models' folder exists
    await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelsPath);
    await faceapi.nets.faceRecognitionNet.loadFromDisk(modelsPath);
    await faceapi.nets.faceLandmark68Net.loadFromDisk(modelsPath);
    console.log('✅ Face API models loaded');
  } catch (err) {
    console.error('❌ Error loading FaceAPI models:', err.message);
  }
}
loadModels();

// 🔹 Get Face Descriptor from Base64 Image
async function getFaceDescriptor(imageBase64) {
  try {
    const img = await canvas.loadImage(imageBase64);
    const detection = await faceapi
      .detectSingleFace(img)
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection) throw new Error('❌ No face detected');

    return Array.from(detection.descriptor);
  } catch (error) {
    console.error('❌ Face Detection Error:', error.message);
    throw new Error('Face detection failed. Try again.');
  }
}

// 🔹 Signup Route
app.post('/signup', async (req, res) => {
  try {
    const { name, age, email, image } = req.body;

    if (!name || !age || !email || !image) {
      return res.status(400).json({ message: '❌ All fields are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: '❌ User already exists' });
    }

    const faceDescriptor = await getFaceDescriptor(image);

    const newUser = new User({
      name,
      age,
      email,
      faceDescriptors: [faceDescriptor],
    });

    await newUser.save();
    res.status(201).json({ message: '✅ Signup successful' });
  } catch (error) {
    console.error('❌ Signup Error:', error.message);
    res.status(500).json({ message: '❌ Signup failed. Try again.' });
  }
});

// 🔹 Login Route
app.post('/login', async (req, res) => {
  try {
    const { email, image } = req.body;

    if (!email || !image) {
      return res.status(400).json({ message: '❌ Email and image are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: '❌ User not found' });
    }

    const loginFaceDescriptor = await getFaceDescriptor(image);

    const labeledDescriptors = new faceapi.LabeledFaceDescriptors(
      user.email,
      user.faceDescriptors.map((desc) => new Float32Array(desc))
    );

    const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.4);
    const bestMatch = faceMatcher.findBestMatch(new Float32Array(loginFaceDescriptor));

    console.log('🔍 Best Match:', bestMatch.toString());

    if (bestMatch.label === user.email) {
      res.status(200).json({ success: true, message: '✅ Login successful' });
    } else {
      res.status(400).json({ success: false, message: '❌ Face does not match' });
    }
  } catch (error) {
    console.error('❌ Login Error:', error.message);
    res.status(500).json({ message: '❌ Login failed. Try again.' });
  }
});

// 🔹 Cart Routes
app.use('/api/cart', cartRoutes);

// 🔹 Start Server
const PORT = process.env.PORT || 5002;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
