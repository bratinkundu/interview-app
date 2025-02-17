import OpenAI from "openai";
import { Database } from "@/db/Database";
import { Interview } from "@/models/Interview";
import { NextApiRequest, NextApiResponse } from "next";
import { Answer } from "@/models/Answers";

const openai = new OpenAI({ apiKey: process.env.AI_KEY });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") return res.status(405).end();

    const { interviewId } = await req.body;
    await Database.getInstance().initialize();
    const interviewRepo = Database.getInstance().getRepository(Interview);
    const answerRepo = Database.getInstance().getRepository(Answer);

    const interview = await interviewRepo.findOne({ where: { id: interviewId } });

    if(!interview) {
        return res.status(404).json({ error: "Interview not found" });
    }

    const answers = await answerRepo.find({ where: { interviewId } });

    const prompt = `Evaluate the following interview answers and provide feedback:
                    ${answers.map(r => `Q: ${r.question} A: ${r.answer}`).join("\n")}`;

    const feedbackResponse = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "system", content: prompt }],
      temperature: 0.5,
    });

    return res.status(200).json(feedbackResponse);
}