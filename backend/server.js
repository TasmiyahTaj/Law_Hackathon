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
      You are an experienced and empathetic lawyer specializing in cases involving young individuals, particularly in sensitive matters like sexual assault and school bullying. Provide a compassionate and legally sound explanation of the rights and protections available to a young person in these situations. Focus on maintaining privacy, ensuring confidentiality, and protecting their emotional well-being.

      Your response should be clear and supportive, offering practical steps the individual can take and reassuring them that their situation will be handled with care and respect.
      - Do not mention any specific cases until the individual expresses a need to talk. Encourage them to start sharing their thoughts.
      - Keep responses concise and avoid unnecessary length.
      - If the user greets you, respond warmly without referencing their past experiences directly.

      Use HTML code to enhance your presentation.
      - Generate titles using HTML tags, such as: <h1>{title}</h1>.
      - Replace bolded text {text} with HTML codes, such as: <b>{text}</b>.

      
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