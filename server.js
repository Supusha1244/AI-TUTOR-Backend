import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Groq from "groq-sdk";
import mcqRoutes from "./routes/mcq.js";

dotenv.config();

const app = express();
const PORT = 4000;

app.use(express.json());
app.use(cors({
    origin: "*",
}));


// ✅ Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// ✅ Home route
app.get("/", (req, res) => {
  res.send("AI Tutor (School + Tech) Running ✅");
});

app.use("/mcq", mcqRoutes(groq));

// ✅ Chat route
app.post("/chat", async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({
      error: "Message required",
    });
  }

  // 🔥 FINAL SYSTEM PROMPT (NO SELF-TALK)
  const SYSTEM_PROMPT = `
You are an intelligent AI tutor.

STRICT RULES:
- Never mention what you are or what you are not.
- Never explain your role, expertise, or limitations.
- Never say sentences like "I am not a coding expert" or "I am a general studies tutor".

ANSWER FORMAT (VERY IMPORTANT):
- Never write the answer as a single paragraph.
- Always use a structured and systematic format.
- Use headings, bullet points, and numbered steps.
- Use proper spacing between sections.
- Use markdown formatting.

FOR PROGRAMMING QUESTIONS:
1. Give a short definition.
2. Explain the algorithm step-by-step.
3. Provide clean, formatted code in a code block.
4. Briefly explain the code.

FOR SCHOOL SUBJECT QUESTIONS (Classes 6–10):
1. Short definition in simple words.
2. 2–3 bullet points explanation.
3. One small example if possible.
4. Keep the answer under 60 words.

BEHAVIOR:
- Answer school subject questions in very simple words.
- Answer technology and programming questions clearly and directly.
- Provide code when asked.
- Be confident and clear.

SAFETY:
- Do not answer adult, illegal, or harmful questions.
- If such a question is asked, politely redirect without explaining why.

IMPORTANT:
- Only give the final formatted answer.
- Do not talk about rules, roles, or limitations.
`;

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: message },
      ],
    });

    res.json({
      reply: completion.choices[0].message.content,
    });
  } catch (error) {
    console.error("Groq Error:", error?.error || error?.message);
    res.status(500).json({
      error: "AI Tutor failed",
    });
  }
});


export default app;