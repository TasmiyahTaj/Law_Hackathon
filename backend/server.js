require("dotenv").config(); // Load environment variables
const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());
const port = 8000;

// Initialize Google Generative AI with API key from .env
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

app.post("/ask-ai", async (req, res) => {
  const { message } = req.body;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Empathetic legal response with detailed instructions for Singapore law
    const detailedMessage = `
   You are a legal expert specialized in Singapore law. Respond empathetically to the following query:
      1. Express sympathy first.
      2. Provide detailed legal advice: including the types of evidence needed, where to submit it and who to submit to.
      3. If the issue is sensitive, acknowledge the user's feelings and offer ways to report anonymously such as who they can report to, or any adult they could consult.
Be straight to Point and help them sound reassuring
      for each sections use html <h3>section title</h3>

      
      Query: "${message}"
    `;

    const result = await model.generateContent(detailedMessage);

    res.json({ reply: result.response.text() });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "AI query failed" });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
