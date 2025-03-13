"use client";
import { use, useEffect, useRef, useState } from "react";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";

export default function Interview({ params }: { params: Promise<{ id: string }> }) {
  const [question, setQuestion] = useState("Loading first question...");
  const { transcript, resetTranscript, listening } = useSpeechRecognition();
  const [isListening, setIsListening] = useState(false);
  const [interviewStartTime, setInterviewStartTime] = useState<number | null>(null);
  const [conclusionTriggered, setConclusionTriggered] = useState(false);
  const [remainingQuestions, setRemainingQuestions] = useState(2);
  const [editableTranscript, setEditableTranscript] = useState("");

  const router = useRouter();

  const { id } = use(params);

  const transcriptRef = useRef<HTMLTextAreaElement>(null);

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


  useEffect(() => {
    setEditableTranscript(transcript);
  }, [transcript]);

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
        previousQuestion: question,
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

  function toggleListening() {
    if (listening) {
      SpeechRecognition.stopListening();
      setIsListening(false);
    } else {
      setIsListening(true);
      SpeechRecognition.startListening({ continuous: true, language: "en-US" });
    }
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
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <Card className="w-full max-w-xl p-6 shadow-lg">
        <h2 className="text-xl font-semibold mb-4">{question}</h2>
        {/* <p className="mt-4">{transcript || "Click Start Speaking..."}</p> */}
        <Textarea 
          ref={transcriptRef}
          value={editableTranscript} 
          onChange={(e) => setEditableTranscript(e.target.value)} 
          className="w-full p-3 border rounded-md h-40 resize-none overflow-auto"
        />
        <Button onClick={toggleListening} className="mt-4 w-full">
          {isListening ? "Stop Listening" : "Start Speaking"}
        </Button>
        <Button onClick={submitAnswer} disabled={isListening} className="mt-4 w-full">Submit Answer</Button>
        <Button onClick={exitInterview} className="mt-4 w-full bg-red-500 hover:bg-red-600">Exit Interview</Button>
      </Card>
    </div>
  );
}
