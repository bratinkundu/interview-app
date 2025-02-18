import { Card } from "@/components/ui/card";
import LoginButton from "@/components/ui/LoginButton";

export default function Home() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-96 p-6">
        <h1 className="text-2xl font-semibold text-center mb-4">AI Interview</h1>
        <LoginButton />
      </Card>
    </div>
  );
}
