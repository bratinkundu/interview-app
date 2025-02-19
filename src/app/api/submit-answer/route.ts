import { Database } from "@/db/Database";
import { Interview } from "@/models/Interview";
import { Answer } from "@/models/Answers";
import { v4 as uuidv4 } from 'uuid';
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.AI_KEY!);

export async function POST(req: Request) {

    const { interviewId, question, answer } = await req.json();
    Database.getInstance().isInitialized ? console.log("Database is initialized") : await Database.getInstance().initialize();
    const interviewRepo = Database.getInstance().getRepository(Interview);
    const answerRepo = Database.getInstance().getRepository(Answer);

    const interview = await interviewRepo.findOne({ where: { id: interviewId } });

    if(!interview) {
        return NextResponse.json({ error: "Interview not found" }, { status: 404 });
    }

    const aiPrompt = `Analyze the answer for clarity, completeness, and confidence.

                    Question: ${question}
                    Answer: ${answer}

                    Give a confidence score (0-100) and feedback.
                    `;
    
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(aiPrompt);
    const feedback = result.response.text();
    const confidenceScore = extractConfidenceScore(feedback); // Extract numerical value
                    

    const newAnswer = new Answer();
    newAnswer.id = uuidv4();
    newAnswer.interviewId = interviewId;
    newAnswer.question = question;
    newAnswer.answer = answer;
    newAnswer.confidenceScore = confidenceScore;

    const savedAnswer = await answerRepo.save(newAnswer);

    return NextResponse.json(savedAnswer);
}

function extractConfidenceScore(responseText: string): number {
    const match = responseText.match(/Confidence Score:\s*(\d+)/);
    return match ? parseInt(match[1], 10) : 0; // Default to 0 if not found
}