import { GoogleGenerativeAI } from "@google/generative-ai";
import { Database } from "@/db/Database";
import { Interview } from "@/models/Interview";
import { Answer } from "@/models/Answers";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.AI_KEY!);

export async function POST(req: Request) {
  try {
    const { interviewId, reason } = await req.json();
    Database.getInstance().isInitialized ? console.log("Database is initialized") : await Database.getInstance().initialize();
    
    const interviewRepo = Database.getInstance().getRepository(Interview);
    const answerRepo = Database.getInstance().getRepository(Answer);

    const interview = await interviewRepo.findOne({ where: { id: interviewId } });

    if(!interview) {
        return NextResponse.json({ error: "Interview not found" }, { status: 404 });
    }

    const answers = await answerRepo.find({ where: { interviewId } });

    const prompt = `
            You are an experienced hiring manager evaluating an interview for a ${interview.role} position. 
            Provide structured feedback on the candidate's answers based on clarity, depth, correctness, and improvement areas. 
            Also, give an overall assessment of their performance.

            Interview Answers:
            ${answers.map((r, i) => `Q${i + 1}: ${r.question}\nA: ${r.answer}\n`).join("\n")}

            Return the response in the following JSON format & return only the JSON object. I will put the response in JSON.parse() directly:
            {
              "strengths": ["List key strengths"],
              "areasForImprovement": ["List key areas for improvement"],
              "finalAssessment": {
                "result": "Pass/Needs Improvement/Fail",
                "justification": "Brief explanation"
              }
            }
        `;
    
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash", 
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 500,
      }
    });
    const result = await model.generateContent(prompt);
    const feedbackString = result?.response?.text() || "{}";
    const match = feedbackString.match(/\{[\s\S]*\}/);

    console.log(match ? match[0] : "No match found");
    const feedbackResponse = match ? JSON.parse(match[0]) : {};

    interview.completed = true;
    interview.feedback = feedbackString;
    interview.reason = reason;

    interviewRepo.save(interview);

    return NextResponse.json({feedbackResponse}, { status: 200 });
  }
  catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}