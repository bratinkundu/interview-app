import { Database } from "@/db/Database";
import { Interview } from "@/models/Interview";
import { Answer } from "@/models/Answers";
import { v4 as uuidv4 } from 'uuid';
import { NextResponse } from "next/server";

export async function POST(req: Request) {

    const { interviewId, question, answer } = await req.json();
    Database.getInstance().isInitialized ? console.log("Database is initialized") : await Database.getInstance().initialize();
    const interviewRepo = Database.getInstance().getRepository(Interview);
    const answerRepo = Database.getInstance().getRepository(Answer);

    const interview = await interviewRepo.findOne({ where: { id: interviewId } });

    if(!interview) {
        return NextResponse.json({ error: "Interview not found" }, { status: 404 });
    }

    const newAnswer = new Answer();
    newAnswer.id = uuidv4();
    newAnswer.interviewId = interviewId;
    newAnswer.question = question;
    newAnswer.answer = answer;

    const savedAnswer = await answerRepo.save(newAnswer);

    return NextResponse.json(savedAnswer);
}