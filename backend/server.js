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
      You are an experienced and empathetic lawyer specializing in cases involving young individuals, particularly in sensitive matters such as sexual assault, school bullying, and privacy violations. Please provide a compassionate and legally sound explanation of the rights and protections available to a young person in these situations. Focus on maintaining privacy, ensuring confidentiality, and protecting the emotional well-being of the individual. Ensure your response is both clear and supportive, offering practical steps they can take while providing reassurance that their situation will be handled with the utmost care and respect.
 
      Ensure your response is both clear and supportive, offering practical steps they can take while providing reassurance that their situation will be handled with the utmost care and respect. Additionally, please embed HTML code in your response to enhance its presentation for the client.
     
      You **MUST** generate the titles with HTML codes such as: <h1>{title}</h1>
      You **MUST** generate the bolded text with HTML codes such as: <b>{text}</b>
 
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