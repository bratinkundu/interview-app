"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const { data: session } = useSession();
  const router = useRouter();
  interface Interview {
    id: string;
    role: string;
    difficulty: string;
  }

  const [interviews, setInterviews] = useState<Interview[]>([]);

  useEffect(() => {
    if (session && session.user) {
        const email = session.user.email ? session.user.email : '';
        fetch(`/api/get-interviews?email=${email}`)
            .then((res) => res.json())
            .then(setInterviews);
    }
  }, [session]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Welcome, {session?.user?.name}</h1>
      <Button onClick={() => router.push("/interview/new")}>Start New Interview</Button>
      <ul className="mt-4">
        {interviews.map((int) => (
          <li key={int.id} className="p-2 border rounded mt-2">{int.role} - {int.difficulty}</li>
        ))}
      </ul>
    </div>
  );
}
