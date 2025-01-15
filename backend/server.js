require("dotenv").config(); // Load environment variables
const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());
const port = 8000;
const legalData = [
  {
    offense: "Causing Harassment, Alarm, or Distress",
    section: "Section 4 of the Protection from Harassment Act (POHA)",
    section_description:
      "Causing harassment, alarm, or distress through words or actions.",
    penalty: "Fine of up to $5,000 for a first-time offense.",
    evidence: [
      "Emails: Include sender's address, timestamps, and all content (even subject lines). Highlight any harassing language.",
      "Messages: Collect screenshots with dates, timestamps, and full conversations for context.",
      "Videos: Ensure the video clearly captures the incident and involved parties, showing the harassing act without edits or interruptions.",
    ],
    reportTo: ["Police", "School", "Workplace supervisor"],
    anonymousOptions: [
      "Report through school channels",
      "Confide in trusted adults",
    ],
    hotline: ["Samaritans of Singapore: 1800-221-4444"],
  },
  {
    offense: "Intentional Harassment",
    section: "Section 3 of the Protection from Harassment Act (POHA)",
    section_description:
      "Intentional harassment through actions or words to cause alarm or distress.",
    penalty: "Fine of up to $5,000, imprisonment for up to 6 months, or both.",
    evidence: [
      "Emails: Include detailed conversation history with timestamps, identifying all participants and their roles in the harassment.",
      "Text Messages: Capture full conversation threads with names and dates clearly visible. Use screenshots from both the victim and aggressor if possible.",
      "Recorded Calls: Audio should clearly capture both sides of the conversation, with dates and participants noted in a transcript.",
    ],
    reportTo: ["Police", "HR Department", "Legal counsel"],
    anonymousOptions: ["Anonymous work helplines"],
    hotline: ["Workplace Helpline: 1800-888-8888"],
  },
  {
    offense: "Racial or Religious Slurs",
    section: "Section 298 of the Penal Code",
    section_description:
      "Uttering words with intent to wound racial or religious feelings.",
    penalty: "Fine, imprisonment for up to 3 years, or both.",
    evidence: [
      "Messages: Preserve text, chats, or social media posts with derogatory comments. Ensure the timestamp, sender, and content are intact.",
      "Videos: Record or capture the incident showing the context and the use of racial or religious slurs.",
      "Witness Testimony: Gather detailed statements from those present, describing what was said and its impact.",
    ],
    reportTo: ["Police", "Racial equality bodies"],
    anonymousOptions: ["Report to religious or cultural organizations"],
    hotline: ["Samaritans of Singapore: 1800-221-4444"],
  },
  {
    offense: "Wrongful Confinement",
    section: "Section 340 of the Penal Code",
    section_description: "Restraining or confining a person unlawfully.",
    penalty: "Imprisonment for up to 3 years, fine, or both.",
    evidence: [
      "Videos: Capture clear footage of the confinement area, the victim being unable to leave, and the actions of the aggressor.",
      "Witness Testimony: Include written statements from individuals who witnessed the confinement and describe the situation.",
      "Security Footage: Provide unaltered recordings from cameras in the area where the confinement occurred.",
    ],
    reportTo: ["Police", "Legal counsel"],
    anonymousOptions: [
      "Report to school, workplace, or legal entities anonymously",
    ],
    hotline: ["Samaritans of Singapore: 1800-221-4444"],
  },
  {
    offense: "Using Force Without Consent",
    section: "Section 350 of the Penal Code",
    section_description:
      "Using physical force against someone without their consent, causing harm or fear.",
    penalty: "Fine of up to $1,500, imprisonment for up to 3 months, or both.",
    evidence: [
      "Medical Reports: Provide documentation of any injuries sustained as a result of the force used.",
      "Videos: Record the incident showing the victim being subjected to physical force, capturing the aggressor’s actions clearly.",
      "Witness Testimony: Collect detailed accounts from anyone who observed the use of force, including descriptions of the aggressor's behavior.",
    ],
    reportTo: ["Police", "School or Workplace administration"],
    anonymousOptions: ["Community legal hotlines"],
    hotline: ["Samaritans of Singapore: 1800-221-4444"],
  },
  {
    offense: "Voluntarily Causing Hurt",
    section: "Section 321 of the Penal Code",
    section_description: "Causing harm to a person through voluntary actions.",
    penalty: "Fine of up to $5,000, imprisonment for up to 3 years, or both.",
    evidence: [
      "Medical Reports: Detailed medical diagnosis of injuries, photographs, and treatment provided.",
      "Security Footage: Videos showing the aggressor committing the act of harm, with timestamps.",
      "Witness Statements: Collect accounts from bystanders describing the event, their observations, and interactions with both parties.",
    ],
    reportTo: ["Police", "Legal counsel"],
    anonymousOptions: ["Anonymous reporting channels in schools or workplaces"],
    hotline: ["Samaritans of Singapore: 1800-221-4444"],
  },
  {
    offense: "Grievous Hurt",
    section: "Section 323A of the Penal Code",
    section_description:
      "Intentionally causing serious injury or harm to a person.",
    penalty: "Fine of up to $10,000, imprisonment for up to 5 years, or both.",
    evidence: [
      "Medical Evidence: Hospital records showing the extent of injuries, prognosis, and required treatments.",
      "Eyewitness Reports: Gather detailed accounts of the incident from multiple perspectives, noting the severity of the injuries.",
      "Videos: Recordings showing the aggressor's intent and actions causing serious harm.",
    ],
    reportTo: ["Police", "Legal counsel"],
    anonymousOptions: ["Report to health authorities or support groups"],
    hotline: ["Samaritans of Singapore: 1800-221-4444"],
  },
  {
    offense: "Endangering Personal Safety Through Rash or Negligent Acts",
    section: "Section 336 of the Penal Code",
    section_description:
      "Causing harm or risking safety through rash or negligent behavior.",
    penalty:
      "For rash acts: Fine of up to $2,500, imprisonment for up to 6 months, or both. For negligent acts: Fine of up to $1,500, imprisonment for up to 3 months, or both.",
    evidence: [
      "Incident Reports: Detailed documentation of the actions taken that caused danger, including timelines and involved parties.",
      "Medical Reports: If injury occurred, medical documentation highlighting the link to the rash or negligent behavior.",
      "Videos: Clear footage showing the unsafe behavior and its consequences.",
    ],
    reportTo: ["Police", "Legal advisors"],
    anonymousOptions: ["Anonymous helplines for reporting safety concerns"],
    hotline: ["Samaritans of Singapore: 1800-221-4444"],
  },
  {
    offense: "Causing Hurt Through Rash or Negligent Acts",
    section: "Section 337 of the Penal Code",
    section_description:
      "Causing injury through reckless or negligent behavior.",
    penalty:
      "For rash acts: Fine of up to $5,000, imprisonment for up to 1 year, or both. For negligent acts: Fine of up to $2,500, imprisonment for up to 6 months, or both.",
    evidence: [
      "Medical Reports: Clear documentation of injuries caused by negligent acts.",
      "Witness Testimony: Statements from those present, noting the negligent behavior and its consequences.",
      "Videos: Recordings showing how the negligent actions led to the victim’s injury.",
    ],
    reportTo: ["Police", "Legal representatives"],
    anonymousOptions: ["Anonymous safety reporting lines"],
    hotline: ["Samaritans of Singapore: 1800-221-4444"],
  },
  {
    offense: "Grievous Hurt Through Rash or Negligent Acts",
    section: "Section 338 of the Penal Code",
    section_description:
      "Causing severe injury through rash or negligent actions.",
    penalty:
      "For rash acts: Fine of up to $10,000, imprisonment for up to 4 years, or both. For negligent acts: Fine of up to $5,000, imprisonment for up to 2 years, or both.",
    evidence: [
      "Medical Records: Comprehensive medical files detailing the serious nature of the injuries and long-term implications.",
      "Witness Testimony: Multiple accounts confirming the reckless or negligent behavior that caused harm.",
      "Security Footage: Unedited video showing the incident and resulting injury.",
    ],
    reportTo: ["Police", "Workplace health and safety bodies"],
    anonymousOptions: ["Anonymous safety and health reporting"],
    hotline: ["Samaritans of Singapore: 1800-221-4444"],
  },
];

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
           
      If the user's query mentions any of these offenses, respond according to the details in the legalData array. You must provide them with law regulations of Singapore:
    ${JSON.stringify(
      {
        legalData,
      },
      null,
      2
    )}
    Use this format state the Offense, Law Section and description ,the **Penalty**, the evidence making it very detailed on how and what to do , include who to report, anonymous options and hotline contacts
    

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
    if (error.status === 429) {
      // Rate limit exceeded
      res.status(429).json({
        error: "Too many requests. Please try again tomorrow.",
      });
    } else {
      // Generic error handling
      res.status(500).json({
        error: "AI query failed. Please try again later.",
      });
    }
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
