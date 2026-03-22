import express from "express";

const router = express.Router();

export default function mcqRoutes(groq) {
  

   router.post("/generate", async (req, res) => {
  const { content } = req.body;

  const prompt = `
Generate 5 MCQs in STRICT JSON format ONLY.

Format:
[
  {
    "question": "string",
    "options": ["A", "B", "C", "D"],
    "correctAnswer": 0
  }
]

Rules:
- No explanation
- No markdown
- No extra text

Content:
${content}
`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [{ role: "user", content: prompt }],
  });

  let mcqs;

  try {
    mcqs = JSON.parse(completion.choices[0].message.content);
  } catch (err) {
    return res.status(500).json({
      error: "Failed to parse MCQs",
    });
  }

  res.json({ mcqs });
});


  return router;
}
