"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardTitle,
  CardHeader,
} from "@/components/ui/card";
import { FileText, Sparkles, Download, Shield } from "lucide-react";

const features = [
  {
    icon: (
      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
        <Sparkles className="h-6 w-6 text-blue-600" />
      </div>
    ),
    title: "AI-Powered Writing",
    description: "Generate professional resume content with AI assistance",
  },
  {
    icon: (
      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
        <FileText className="h-6 w-6 text-purple-600" />
      </div>
    ),
    title: "Multiple Templates",
    description: "Choose from ATS-friendly resume templates",
  },
  {
    icon: (
      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
        <Download className="h-6 w-6 text-green-600" />
      </div>
    ),
    title: "Instant Download",
    description: "Export your resume as PDF or Word document",
  },
  {
    icon: (
      <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
        <Shield className="h-6 w-6 text-orange-600" />
      </div>
    ),
    title: "Privacy First",
    description: "Your data is encrypted and never shared",
  },
];

export function FeatureSection() {
  return (
    <section className="py-12 px-4 md:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-8">
          Why Choose CvCraf-ai?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
