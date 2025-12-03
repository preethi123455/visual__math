const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const pdfParse = require('pdf-parse');
const { Groq } = require('groq-sdk');

const app = express();
const PORT = 11000;

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/fileuploads', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => console.log('✅ Connected to MongoDB'));

// Define File schema
const fileSchema = new mongoose.Schema({
  filename: String,
  originalName: String,
  uploadDate: { type: Date, default: Date.now },
});
const File = mongoose.model('File', fileSchema);

// Middlewares
app.use(cors());
app.use(express.json());

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Set up Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  },
});
const upload = multer({ storage: storage });

// GROQ Setup (API key hardcoded)
const groq = new Groq({
  apiKey: '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',
});

// Routes
app.get('/', (req, res) => {
  res.send('Server is alive!');
});

// Upload Route
app.post('/api/upload', upload.single('pdf'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  try {
    const newFile = new File({
      filename: req.file.filename,
      originalName: req.file.originalname,
    });
    await newFile.save();

    console.log('Uploaded file:', req.file);
    res.status(200).json({ message: 'File uploaded and saved to DB', file: req.file.filename });
  } catch (err) {
    console.error('MongoDB save error:', err);
    res.status(500).json({ error: 'Database save failed' });
  }
});

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// RAG Ask Endpoint
app.post('/api/ask', async (req, res) => {
  const { question, filename } = req.body;
  if (!question || !filename) return res.status(400).json({ error: 'Missing question or filename' });

  const filePath = path.join(__dirname, 'uploads', filename);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File not found' });

  try {
    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(dataBuffer);
    const text = pdfData.text;

    // Chunking the PDF text (simple split by ~200 words)
    const chunks = text.match(/(?:[^\s]+\s+){1,200}/g) || [];

    // Pick top 3 most relevant chunks (naive approach using string.includes)
    const relevantChunks = chunks.filter(chunk =>
      chunk.toLowerCase().includes(question.toLowerCase())
    ).slice(0, 3);

    const context = relevantChunks.join('\n---\n');

    const messages = [
      {
        role: 'system',
        content: 'You are a helpful assistant that answers questions based on provided context.',
      },
      {
        role: 'user',
        content: `Context:\n${context}\n\nQuestion: ${question}`,
      },
    ];

    const response = await groq.chat.completions.create({
      model: 'llama3-8b-8192',
      messages,
      temperature: 0.2,
      max_tokens: 500,
    });

    res.json({ answer: response.choices[0].message.content });

  } catch (err) {
    console.error('Error in /ask:', err);
    res.status(500).json({ error: 'Something went wrong during PDF processing or API call' });
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Something went wrong' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
