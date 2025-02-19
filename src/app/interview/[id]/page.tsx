"use client";
import { use, useEffect, useState } from "react";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";

export default function Interview({ params }: { params: Promise<{ id: string }> }) {
  const [question, setQuestion] = useState("Loading first question...");
  const { transcript, resetTranscript, listening } = useSpeechRecognition();
  const [isListening, setIsListening] = useState(false);
  const [interviewStartTime, setInterviewStartTime] = useState<number | null>(null);
  const [conclusionTriggered, setConclusionTriggered] = useState(false);
  const [remainingQuestions, setRemainingQuestions] = useState(2);
  const router = useRouter();

  const { id } = use(params);

  useEffect(() => {
    if (id) {
      fetchNextQuestion();
      setInterviewStartTime(Date.now());
    }
  }, [id]);

  useEffect(() => {
    const checkTime = setInterval(() => {
      if (interviewStartTime) {
        const elapsedMinutes = (Date.now() - interviewStartTime) / 60000;
        if (elapsedMinutes >= 30 && !conclusionTriggered) {
          setConclusionTriggered(true);
        }
      }
    }, 10000);

    return () => clearInterval(checkTime);
  }, [interviewStartTime, conclusionTriggered]);


  async function fetchNextQuestion(previousAnswer?: string) {

    if (conclusionTriggered && remainingQuestions === 0) {
      endInterview("Time limit reached.");
      return;
    }

    const res = await fetch("/api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        interviewId: id,
        previousAnswer,
        concludeSoon: conclusionTriggered,
      }),
    });

    const data = await res.json();
    setQuestion(data.question);

    if (conclusionTriggered) {
      setRemainingQuestions((prev) => prev - 1);
    }
  }

  async function submitAnswer() {
    await fetch("/api/submit-answer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        interviewId: id,
        question,
        answer: transcript,
      }),
    });

    resetTranscript();
    fetchNextQuestion(transcript);
  }

  function startListening() {
    if (!listening) {
      setIsListening(true);
      SpeechRecognition.startListening({ continuous: true, language: "en-US" });
      setTimeout(() => {
        stopListening();
      }, 10000);
    }
  }

  function stopListening() {
    SpeechRecognition.stopListening();
    setIsListening(false);
  }
  
  function endInterview(reason: string) {
    router.push(`/result/${id}?reason=${encodeURIComponent(reason)}`);
  }

  function exitInterview() {
    if (confirm("Are you sure you want to exit the interview? Your answers will be saved.")) {
      endInterview("Candidate exited manually.");
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-96 p-6">
        <h2 className="text-xl font-semibold">{question}</h2>
        <p className="mt-4">{transcript || "Click Start Speaking..."}</p>
        <Button onClick={() => startListening()} disabled={listening} className="mt-4">
          {listening ? "Listening..." : "Start Speaking"}
        </Button>
        <Button onClick={submitAnswer} className="mt-4 w-full">Submit Answer</Button>
        <Button onClick={exitInterview} className="mt-4 w-full bg-red-500 hover:bg-red-600">Exit Interview</Button>
      </Card>
    </div>
  );
}
