import OpenAI from "openai";
import { Database } from "@/db/Database";
import { Interview } from "@/models/Interview";
import { NextApiRequest, NextApiResponse } from "next";

const openai = new OpenAI({ apiKey: process.env.AI_KEY });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") return res.status(405).end();

    const { interviewId, previousAnswer } = await req.body;
    await Database.getInstance().initialize();
    const interviewRepo = Database.getInstance().getRepository(Interview);
    const interview = await interviewRepo.findOne({ where: { id: interviewId } });

    if(!interview) {
        return res.status(404).json({ error: "Interview not found" });
    }

    let prompt = `You are an AI interviewer conducting a ${interview.difficulty}-level interview for a ${interview.role} role. 
                  The candidate has a background in ${interview.candidate}.
                  Your goal is to ask **one relevant question** at a time based on the candidate's response.`;

    if (previousAnswer) {
      prompt += ` The candidate just answered: "${previousAnswer}". 
                  Now, ask a logical **next question** that follows up on their answer or if you ask other question based on the candidate background and role.`;
    } else {
      prompt += ` Start with the **first question** for the interview.`;
    }

    const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
    });

    return res.status(200).json({ question: completion.choices[0].message.content });
}
