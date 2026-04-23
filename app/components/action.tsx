import {
  Card,
  CardHeader,
  CardFooter,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Sparkles, Scan } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { link } from "fs";

const features = [
  {
    icon: (
      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
        <FileText className="h-6 w-6 text-blue-600" />
      </div>
    ),
    title: "Build Resume",
    description: "Create or edit your resume",
    buttonText: "Create resume",
    link: "/dashboard",
  },
  {
    icon: (
      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
        <Sparkles className="h-6 w-6 text-purple-600" />
      </div>
    ),
    title: "Choose template",
    description: "Select from professional designs",
    buttonText: "Browse templates",
    link: "/dashboard/templates",
  },
  {
    icon: (
      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
        <Scan className="h-6 w-6 text-green-600" />
      </div>
    ),
    title: "Job analyzer",
    description: "Match resume to job description",
    buttonText: "Analyze job",
    link: "/dashboard/ats-checker",
  },
];

export function ActionButtons() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleClick = async (link: string) => {
    setLoading(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
      } else {
        router.push(link);
      }
    } catch (err: any) {
      throw new Error(err.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <section className=" px-4 md:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mb-2">{feature.icon}</div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={() => handleClick(feature.link)}
                  disabled={loading}
                  className="w-full"
                >
                  {feature.buttonText}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
