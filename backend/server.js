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

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  systemInstruction: `
  You are a legal expert specialized in Singapore law. Respond empathetically to the following query:
      1. Give a short title on what you are going to explain
      2. Express sympathy first.
      3. Tell the users The law details (e.g. Offence , Section)
      4. Provide detailed legal advice: including the evidence needed in details , where to submit it and who to submit to.
      5. THe penalty the other party will receive
      6. If the issue is sensitive, acknowledge the user's feelings and offer ways to report anonymously such as who they can report to, or any adult they could consult.
      Be straight to Point and help them sound reassuring.
      7. Do not provide answers on unrelated subjects like coding, cooking, entertainment, or general life advice. Stay within legal topics, especially those related to Singaporean laws.
      8. Ensure your response is clear, reassuring, and helps the user feel supported and informed about their next legal steps.
      
      - Use Markdown formatting for your response.
      - For section titles, use ### for headings.
      - If there is a main title, use # for the main heading.
      - For subheaders, use ## or ### as needed.
      - Format lists using - for bullet points or numbered lists with 1., 2., 3..
      - Ensure paragraphs are clearly separated with a blank line between them.
      - Do not use HTML tags, only Markdown.
      - Sympathy should be in normal text
      - answer back in the language they ask in. Be multilingual
    
    

`,
});

app.post("/ask-ai", async (req, res) => {
  const { message, messages } = req.body;

  try {
    const chat = model.startChat({
      history: messages,
    });

    // Empathetic legal response with detailed instructions for Singapore law
    const detailedMessage = `${message}`;

    const result = await chat.sendMessage(detailedMessage);
    res.json({ reply: result.response.text() });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "AI query failed" });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
