"use client";
import { useState } from "react";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function Interview({ params }: { params: { id: string } }) {
  const [question, setQuestion] = useState("Loading first question...");
  const { transcript, resetTranscript, listening } = useSpeechRecognition();

  async function fetchNextQuestion(previousAnswer?: string) {
    const res = await fetch("/api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        interviewId: params.id,
        previousAnswer,
      }),
    });

    const data = await res.json();
    setQuestion(data.question);
  }

  async function submitAnswer() {
    await fetch("/api/submit-answer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        interviewId: params.id,
        question,
        answer: transcript,
      }),
    });

    resetTranscript();
    fetchNextQuestion(transcript);
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-96 p-6">
        <h2 className="text-xl font-semibold">{question}</h2>
        <p className="mt-4">{transcript || "Click Start Speaking..."}</p>
        <Button onClick={() => SpeechRecognition.startListening()} disabled={listening} className="mt-4">
          {listening ? "Listening..." : "Start Speaking"}
        </Button>
        <Button onClick={submitAnswer} className="mt-4 w-full">Submit Answer</Button>
      </Card>
    </div>
  );
}
