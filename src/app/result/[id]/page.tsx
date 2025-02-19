"use client";
import { use, useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";

type Feedback = {
  strengths?: string[];
  areasForImprovement?: string[];
  finalAssessment?: {
    result: string;
    justification: string;
  };
};

export default function Results({ params }: { params: Promise<{ id: string }> }) {
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason") || "No reason provided";
  const { id } = use(params);

  useEffect(() => {
    async function fetchFeedback() {
      const res = await fetch("/api/get-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interviewId: id, reason }),
      });

      const data = await res.json();
      setFeedback(data.feedbackResponse);
    }

    fetchFeedback();
  }, [id]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-6">
      <Card className="w-full max-w-2xl p-6">
        <h2 className="text-2xl font-semibold mb-4">Interview Feedback</h2>

        {feedback ? (
          <>
            <h3 className="text-lg font-semibold mt-4">Strengths</h3>
            <ul className="list-disc list-inside text-gray-700">
              {feedback.strengths?.map((strength, index) => (
                <li key={index}>{strength}</li>
              ))}
            </ul>

            <h3 className="text-lg font-semibold mt-4">Areas for Improvement</h3>
            <ul className="list-disc list-inside text-gray-700">
              {feedback.areasForImprovement?.map((area, index) => (
                <li key={index}>{area}</li>
              ))}
            </ul>

            <h3 className="text-lg font-semibold mt-4">Final Assessment</h3>
            <p>
              <strong>Result:</strong> {feedback.finalAssessment?.result}
            </p>
            <p className="text-gray-700">{feedback.finalAssessment?.justification}</p>
          </>
        ) : (
          <p className="text-gray-500">Loading feedback...</p>
        )}

        <Button className="mt-6 w-full" onClick={() => window.location.href = "/dashboard"}>
          Go to Dashboard
        </Button>
      </Card>
    </div>
  );
}
