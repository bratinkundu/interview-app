"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function NewInterview() {
  const { data: session } = useSession();
  const router = useRouter();
  const [form, setForm] = useState({ aboutYou: "", role: "", difficulty: "Easy" });

  const handleSubmit = async () => {
    const res = await fetch("/api/create-interview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: session?.user?.email, ...form }),
    });
    const data = await res.json();
    router.push(`/interview/${data.id}`);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">New Interview</h1>
      <Input placeholder="About You" onChange={(e) => setForm({ ...form, aboutYou: e.target.value })} />
      <Input placeholder="Role" onChange={(e) => setForm({ ...form, role: e.target.value })} />
      <select onChange={(e) => setForm({ ...form, difficulty: e.target.value })}>
        <option>Easy</option>
        <option>Medium</option>
        <option>Hard</option>
      </select>
      <Button onClick={handleSubmit}>Start Now</Button>
    </div>
  );
}
