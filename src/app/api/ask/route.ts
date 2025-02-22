import { GoogleGenerativeAI } from "@google/generative-ai";
import { Database } from "@/db/Database";
import { Interview } from "@/models/Interview";
import { NextResponse } from "next/server";

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

    let prompt = `You are an interviewer conducting a comprehensive interview for the ${interview.role} role. 
                  The candidate's background is: ${interview.profile}. 
                  The difficulty level of this interview is ${interview.difficulty}. 

                  **YOUR GOAL**
                  - Ask only one question at a time.  
                  - Do not introduce the next question until the candidate has answered the previous one.  
                  - Keep the response concise (just one interview question).  
                  - **Gradually increase** the complexity based on the role and difficulty level.  
    `;

    if (previousAnswer) {
      prompt += `
                ### **Handling Follow-Up Questions**  
                The last question asked was:  **"${previousQuestion}"**  
                The candidate's last answer was: "${previousAnswer}".
                - **Do not repeat the previous questions**; instead, ask a logical next question.  
                - Ensure the interview remains balanced, covering all the aspects for the ${interview.role} role.  
                `;
    } 
    else {
      prompt += ` Start the interview with a general question about the candidate’s background or motivations for applying to this role.`;
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
