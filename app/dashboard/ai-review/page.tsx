"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  FileText,
  Sparkles,
  Loader2,
  AlertCircle,
  Check,
  X,
  Crown,
} from "lucide-react";
import { supabase } from "@/app/lib/supabaseClient";

interface AIReview {
  score: number;
  strengths: string[];
  improvements: string[];
  suggestions: string[];
  rawFeedback: string;
}

export default function AIReviewSection() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [review, setReview] = useState<AIReview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [userId, setUserId] = useState<string | null>(null);
  const [isPro, setIsPro] = useState<boolean | null>(null);

  useEffect(() => {
    const fetchUserId = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const id = session?.user.id;
      if (id) {
        setUserId(id);
      } else {
        setIsPro(false);
      }
    };
    fetchUserId();
  }, []);

  useEffect(() => {
    const checkPlan = async () => {
      if (!userId) return;
      try {
        const res = await fetch("/api/checkPlan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: userId }),
        });
        const data = await res.json();

        if (data.success) {
          setIsPro(data.plan === "pro");
        } else {
          setIsPro(false);
        }
      } catch (err) {
        console.error("Plan check error:", err);
        setIsPro(false);
      }
    };

    checkPlan();
  }, [userId]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (selected.type !== "application/pdf") {
      setError("Please upload a PDF file");
      return;
    }

    if (selected.size > 10 * 1024 * 1024) {
      setError("File size must be under 10MB");
      return;
    }

    setFile(selected);
    setError(null);

    setPreviewUrl(URL.createObjectURL(selected));
  };

  const handleAnalyze = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);
    setReview(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("userId", userId!);

      const uploadRes = await fetch("/api/ai/review/upload", {
        method: "POST",
        body: formData,
      });

      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.error || "Upload failed");

      setUploading(false);
      setAnalyzing(true);

      const analyzeRes = await fetch("/api/ai/review/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userId,
          fileKey: uploadData.fileKey,
        }),
      });

      const analyzeData = await analyzeRes.json();
      if (!analyzeRes.ok)
        throw new Error(analyzeData.error || "Analysis failed");

      setReview(analyzeData.review);
    } catch (err: any) {
      console.error("AI Review error:", err);
      setError(err.message || "Failed to analyze resume");
    } finally {
      setUploading(false);
      setAnalyzing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreviewUrl(null);
    setReview(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-purple-600" />
        <h2 className="text-lg font-semibold text-gray-900">
          AI Resume Review
        </h2>
      </div>

      <p className="text-sm text-gray-600 mb-6">
        Upload your resume PDF to get instant, AI-powered feedback on
        formatting, keywords, and impact.
      </p>

      {error && (
        <div className="mb-4 flex items-center gap-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {}
      {isPro === null ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
          <span className="ml-2 text-gray-600">Checking subscription...</span>
        </div>
      ) : !isPro ? (
        <div className="text-center py-12 px-6 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border border-purple-200">
          <Crown className="w-12 h-12 text-purple-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Pro Feature</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            The AI Resume Review is an advanced feature available exclusively to
            Pro users. Upgrade your plan to unlock AI-powered resume analysis
            and more!
          </p>
          <button
            onClick={() => router.push("/dashboard/billing")}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-blue-700 transition shadow-md"
          >
            <Crown className="w-4 h-4" />
            Upgrade to Pro
          </button>
        </div>
      ) : (
        <>
          {!file && !review && (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50/50 transition group"
            >
              <input
                title="file input"
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3 group-hover:text-blue-500 transition" />
              <p className="text-sm font-medium text-gray-700">
                Click to upload PDF
              </p>
              <p className="text-xs text-gray-500 mt-1">Max 10MB • PDF only</p>
            </div>
          )}

          {file && !review && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleReset}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                  title="Remove file"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={handleAnalyze}
                disabled={uploading || analyzing}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-blue-700 transition disabled:opacity-50"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Uploading...
                  </>
                ) : analyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing with AI...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Get AI Feedback
                  </>
                )}
              </button>
            </div>
          )}

          {review && (
            <div className="space-y-6">
              {}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Resume Score
                  </p>
                  <p className="text-3xl font-bold text-green-700">
                    {review.score}/100
                  </p>
                </div>
                <div className="w-16 h-16 rounded-full border-4 border-green-500 flex items-center justify-center">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
              </div>

              {review.strengths.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    Strengths
                  </h3>
                  <ul className="space-y-2">
                    {review.strengths.map((item, i) => (
                      <li
                        key={i}
                        className="text-sm text-gray-700 flex items-start gap-2"
                      >
                        <span className="text-green-600 mt-1">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {review.improvements.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    Areas to Improve
                  </h3>
                  <ul className="space-y-2">
                    {review.improvements.map((item, i) => (
                      <li
                        key={i}
                        className="text-sm text-gray-700 flex items-start gap-2"
                      >
                        <span className="text-amber-600 mt-1">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {review.suggestions.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    Quick Wins
                  </h3>
                  <ul className="space-y-2">
                    {review.suggestions.map((item, i) => (
                      <li
                        key={i}
                        className="text-sm text-gray-700 flex items-start gap-2"
                      >
                        <span className="text-purple-600 mt-1">→</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {review.rawFeedback && (
                <details className="group">
                  <summary className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer list-none">
                    <span className="group-open:rotate-90 transition">▶</span>
                    View Full AI Feedback
                  </summary>
                  <p className="mt-3 text-sm text-gray-600 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg">
                    {review.rawFeedback}
                  </p>
                </details>
              )}

              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={handleReset}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Analyze Another Resume
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(review.rawFeedback || "");
                    alert("Feedback copied to clipboard!");
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Copy Feedback
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
