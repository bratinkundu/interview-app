import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-96 p-6">
        <h1 className="text-2xl font-semibold text-center mb-4">AI Interview</h1>
        <p className="text-center text-gray-600 mb-6">
          Start a simulated AI-powered interview.
        </p>
        <div className="text-center">
          <Link href="/interview/start">
            <Button className="w-full">Start Interview</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
