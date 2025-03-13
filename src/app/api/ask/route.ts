import { GoogleGenerativeAI } from "@google/generative-ai";
import { Database } from "@/db/Database";
import { Interview } from "@/models/Interview";
import { NextResponse } from "next/server";
import { BASE_PROMPT, FOLLOW_UP_PROMPT, GENERAL_QUESTION_PROMPT } from "@/helpers/prompts";

// const openai = new OpenAI({ apiKey: process.env.AI_KEY });
const genAI = new GoogleGenerativeAI(process.env.AI_KEY!);

export async function POST(req: Request) {
    const { interviewId, previousAnswer, previousQuestion, concludeSoon } = await req.json();
    Database.getInstance().isInitialized ? console.log("Database is initialized") : await Database.getInstance().initialize();
    const interviewRepo = Database.getInstance().getRepository(Interview);
    const interview = await interviewRepo.findOne({ where: { id: interviewId } });

    if(!interview) {
        return NextResponse.json({ error: "Interview not found" }, { status: 404 });
    }

    let prompt = BASE_PROMPT(interview);

    if (previousAnswer) {
      prompt += FOLLOW_UP_PROMPT(previousQuestion, previousAnswer);
    } 
    else {
      prompt += GENERAL_QUESTION_PROMPT();
    }

    if (concludeSoon) {
      prompt += ` The interview is nearing its end, so ask a question that allows the candidate to summarize their skills, experiences, or final thoughts. Limit follow-ups and avoid introducing new complex topics.`;
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = result.response;
    const question = response.text();

    return NextResponse.json({ question }, { status: 200 });
}
