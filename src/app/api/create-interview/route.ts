import { NextResponse } from "next/server";
import { Interview } from "../../../models/Interview";
import { Database } from "@/db/Database";
import { User } from "@/models/Users";
import { v4 as uuidv4 } from 'uuid';


export async function POST(req: Request) {
    try {
        const { email, aboutYou, role, difficulty } = await req.json();
        Database.getInstance().isInitialized ? console.log("Database is initialized") : await Database.getInstance().initialize();

        const userRepo = Database.getInstance().getRepository(User);
        const interviewRepo = Database.getInstance().getRepository(Interview);

        const user = await userRepo.findOne({ where: { email } });
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const interview = new Interview();
        interview.id = uuidv4();
        interview.role = role;
        interview.profile = aboutYou;
        interview.difficulty = difficulty;
        interview.userId = user.id;

        const savedInterview = await interviewRepo.save(interview);
        return NextResponse.json({ id: savedInterview.id }, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
    }
    
}
