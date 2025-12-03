require("dotenv").config(); // Load environment variables

const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");

const app = express();
app.use(express.json());
app.use(cors());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Read API key from .env
});

app.post("/generate-quiz", async (req, res) => {
  try {
    const { content } = req.body;
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an AI that generates quizzes from course material. Provide 3 MCQs with 4 options each.",
        },
        { role: "user", content: `Generate a quiz from this material: ${content}` },
      ],
      max_tokens: 300,
    });

    res.json({ quiz: response.choices[0].message.content });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to generate quiz" });
  }
});

const PORT = 12000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
