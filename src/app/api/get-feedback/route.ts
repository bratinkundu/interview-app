import OpenAI from "openai";
import { Database } from "@/db/Database";
import { Interview } from "@/models/Interview";
import { Answer } from "@/models/Answers";
import { NextResponse } from "next/server";

const openai = new OpenAI({ apiKey: process.env.AI_KEY });

export async function POST(req: Request) {

    const { interviewId } = await req.json();
    Database.getInstance().isInitialized ? console.log("Database is initialized") : await Database.getInstance().initialize();
    const interviewRepo = Database.getInstance().getRepository(Interview);
    const answerRepo = Database.getInstance().getRepository(Answer);

    const interview = await interviewRepo.findOne({ where: { id: interviewId } });

    if(!interview) {
        return NextResponse.json({ error: "Interview not found" }, { status: 404 });
    }

    const answers = await answerRepo.find({ where: { interviewId } });

    const prompt = `Evaluate the following interview answers and provide feedback:
                    ${answers.map(r => `Q: ${r.question} A: ${r.answer}`).join("\n")}`;

    const feedbackResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "system", content: prompt }],
      temperature: 0.5,
    });

    return NextResponse.json({feedbackResponse}, { status: 200 });
}