import { Database } from "@/db/Database";
import { Interview } from "@/models/Interview";
import { User } from "@/models/Users";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const url = new URL(req.url);
    const email = url.searchParams.get("email");    
    if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    Database.getInstance().isInitialized ? console.log("Database is initialized") : await Database.getInstance().initialize();
    const interviewRepo = Database.getInstance().getRepository(Interview);
    const userRepo = Database.getInstance().getRepository(User);
    
    const user = await userRepo.findOne({ where: { email: email } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    const interviews = await interviewRepo.find({ where: { userId: user.id } });

    return NextResponse.json(interviews);
}