import { Database } from "@/db/Database";
import { Interview } from "@/models/Interview";
import { NextApiRequest, NextApiResponse } from "next";
import { Answer } from "@/models/Answers";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") return res.status(405).end();

    const { interviewId, question, answer } = await req.body;
    await Database.getInstance().initialize();
    const interviewRepo = Database.getInstance().getRepository(Interview);
    const answerRepo = Database.getInstance().getRepository(Answer);

    const interview = await interviewRepo.findOne({ where: { id: interviewId } });

    if(!interview) {
        return res.status(404).json({ error: "Interview not found" });
    }

    const newAnswer = new Answer();
    newAnswer.interviewId = interviewId;
    newAnswer.question = question;
    newAnswer.answer = answer;

    const savedAnswer = await answerRepo.save(newAnswer);

    return res.status(200).json(savedAnswer);
}