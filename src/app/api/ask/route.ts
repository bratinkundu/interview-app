import { GoogleGenerativeAI } from "@google/generative-ai";
import { Database } from "@/db/Database";
import { Interview } from "@/models/Interview";
import { NextResponse } from "next/server";

// const openai = new OpenAI({ apiKey: process.env.AI_KEY });
const genAI = new GoogleGenerativeAI(process.env.AI_KEY!);

export async function POST(req: Request) {
    const { interviewId, previousAnswer } = await req.json();
    Database.getInstance().isInitialized ? console.log("Database is initialized") : await Database.getInstance().initialize();
    const interviewRepo = Database.getInstance().getRepository(Interview);
    const interview = await interviewRepo.findOne({ where: { id: interviewId } });

    if(!interview) {
        return NextResponse.json({ error: "Interview not found" }, { status: 404 });
    }

    let prompt = `You are an AI interviewer conducting a ${interview.difficulty}-level interview for a ${interview.role} role. 
                  The candidate has the below profile - ${interview.profile}.
                  Your goal is to ask **one relevant question** at a time based on the candidate's response.`;

    if (previousAnswer) {
      prompt += ` The candidate just answered: "${previousAnswer}". 
                  Now, ask a logical **next question** that follows up on their answer or if you ask other question based on the candidate background and role.`;
    } else {
      prompt += ` Start with the **first question** for the interview.`;
    }

    // const completion = await openai.chat.completions.create({
    //     model: "gpt-4o",
    //     messages: [{ role: "user", content: prompt }],
    // });

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(prompt);
        const response = result.response;
        const question = response.text();

    return NextResponse.json({ question }, { status: 200 });
}
