"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MultiSelect } from "@/components/ui/MultiSelect";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { categories } from "@/helpers/categories"

interface Category {
  mainCategory: string;
  subCategories: string[];
  skills: string[];
}

interface Interview {
  id: string;
  role: string;
  difficulty: string;
}

export default function Dashboard() {
  const { data: session } = useSession();
  const router = useRouter();

  // Form state
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [role, setRole] = useState("");
  const [experience, setExperience] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [open, setOpen] = useState(false);

  const [interviews, setInterviews] = useState<Interview[]>([]);

  useEffect(() => {
    if (session && session.user) {
        const email = session.user.email ? session.user.email : '';
        fetch(`/api/get-interviews?email=${email}`)
            .then((res) => res.json())
            .then(setInterviews);
    }
  }, [session]);
  // Form validation
  const isFormValid = category && subCategory && skills.length > 0 && role && experience && difficulty;

  const handleStartInterview = async () => {
    const form = {
      category,
      subCategory,
      skills,
      role,
      experience,
      difficulty,
      additionalInfo,
    };
    const res = await fetch("/api/create-interview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: session?.user?.email, ...form }),
    });
    const data = await res.json();
    router.push(`/interview/new/${data.id}`);
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      {/* User Welcome Section */}
      <div className="flex items-center gap-4">
        <Avatar>
          <AvatarImage src={session?.user?.image || ""} alt="User" />
          <AvatarFallback>{session?.user?.name?.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold">Welcome, {session?.user?.name}</h1>
          <p className="text-sm text-muted-foreground">Ready to ace your next interview?</p>
        </div>
      </div>

      {/* Start Interview Button with Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="w-full">Start New Interview</Button>
        </DialogTrigger>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>New Interview</DialogTitle>
          </DialogHeader>

          {/* Category Dropdown */}
          <div>
            <label className="text-sm font-semibold">Category</label>
            <Select onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat : Category) => (
                  <SelectItem key={cat.mainCategory} value={cat.mainCategory}>{cat.mainCategory}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sub-Category Dropdown */}
          {category && (
            <div>
              <label className="text-sm font-semibold">Sub-Category</label>
              <Select onValueChange={setSubCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Sub-Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.filter(f=> f.mainCategory == category)[0].subCategories.map((sub) => (
                    <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Multi-Select for Skills */}
          <div>
            <label className="text-sm font-semibold">Select Skills</label>
            <MultiSelect
              values={categories.filter(f=> f.mainCategory == category).length > 0 ? categories.filter(f=> f.mainCategory == category)[0].skills.map((skill) => ({ key: skill, value: skill })) : []}
              onChange={setSkills}
              placeholder="Select Skills"
            />
          </div>

          {/* Role & Experience */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-sm font-semibold">Current Role</label>
              <Input placeholder="Enter your role" value={role} onChange={(e) => setRole(e.target.value)} />
            </div>
            <div className="flex-1">
              <label className="text-sm font-semibold">Experience (years)</label>
              <Input type="number" placeholder="Years" value={experience} onChange={(e) => setExperience(e.target.value)} />
            </div>
          </div>

          {/* Difficulty Dropdown */}
          <div>
            <label className="text-sm font-semibold">Difficulty Level</label>
            <Select onValueChange={setDifficulty}>
              <SelectTrigger>
                <SelectValue placeholder="Select Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Easy">Easy</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Additional Info */}
          <div>
            <label className="text-sm font-semibold">Additional Information (Optional)</label>
            <Textarea placeholder="Add any extra details..." value={additionalInfo} onChange={(e) => setAdditionalInfo(e.target.value)} />
          </div>

          {/* Start Button */}
          <Button disabled={!isFormValid} onClick={handleStartInterview} className="w-full">
            Start Interview
          </Button>
        </DialogContent>
      </Dialog>

      {/* Previous Interviews Section */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Previous Interviews</h2>
        {interviews.length > 0 ? (
          interviews.map((interview : Interview) => (
            <Card key={interview.id} className="shadow-sm border">
              <CardHeader>
                <CardTitle>{interview.role}</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-between text-sm text-muted-foreground">
                <span>Difficulty: {interview.difficulty}</span>
                <Button size="sm" variant="outline" onClick={() => router.push(`/interview/${interview.id}`)}>
                  View
                </Button>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-muted-foreground text-sm">No previous interviews found.</p>
        )}
      </div>
    </div>
  );
}
