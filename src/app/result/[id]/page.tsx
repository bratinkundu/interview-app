"use client";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Results({ params }: { params: { id: string } }) {
  const [feedback, setFeedback] = useState("Loading feedback...");

  useEffect(() => {
    async function fetchFeedback() {
      const res = await fetch("/api/get-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interviewId: params.id }),
      });

      const data = await res.json();
      setFeedback(data.feedback);
    }

    fetchFeedback();
  }, [params.id]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-96 p-6">
        <h2 className="text-xl font-semibold">Interview Feedback</h2>
        <p className="mt-4 text-gray-600">{feedback}</p>
        <Button className="mt-4 w-full" onClick={() => window.location.href = "/"}>
          Start New Interview
        </Button>
      </Card>
    </div>
  );
}
