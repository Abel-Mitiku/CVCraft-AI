"use client";

import { useState, useRef, useEffect } from "react";
import { supabase } from "@/app/lib/supabaseClient";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";
import {
  Upload,
  FileText,
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
  TrendingUp,
  Key,
  Target,
  ChevronDown,
  Crown,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface ResumeOption {
  id: string;
  title: string;
  createdAt: string;
  template?: string;
}

interface ATSResult {
  score: number;
  keywordMatchPercentage: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  strengths: string[];
  improvements: string[];
  atsWarnings: string[];
  feedback: string;
}

export default function ATSChecker({ userId }: { userId: string }) {
  const [jobDescription, setJobDescription] = useState("");
  const [jobPdfFile, setJobPdfFile] = useState<File | null>(null);
  const [jobPdfPreview, setJobPdfPreview] = useState<string | null>(null);
  const [jobInputMode, setJobInputMode] = useState<"text" | "pdf">("text");

  const [resumeOptions, setResumeOptions] = useState<ResumeOption[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string>("");
  const [resumePdfFile, setResumePdfFile] = useState<File | null>(null);
  const [resumePdfPreview, setResumePdfPreview] = useState<string | null>(null);
  const [resumeInputMode, setResumeInputMode] = useState<"library" | "upload">(
    "library",
  );
  const [loadingResumes, setLoadingResumes] = useState(true);

  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<ATSResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [isPro, setIsPro] = useState<boolean | null>(null);

  const jobFileInputRef = useRef<HTMLInputElement>(null);
  const resumeFileInputRef = useRef<HTMLInputElement>(null);
  const resumeSelectRef = useRef<HTMLSelectElement>(null);
  const router = useRouter();

  useEffect(() => {
    const checkPlan = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session?.user.id) {
          setError("Please login first");
          setIsPro(false);
          return;
        }

        const res = await fetch("/api/checkPlan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: session.user.id }),
        });

        const data = await res.json();

        if (!data.success) {
          setError("Something went wrong. Please try again later.");
          setIsPro(false);
          return;
        }

        setIsPro(!!data.plan);
      } catch (err) {
        console.error("Plan check error:", err);
        setError("Failed to verify subscription status.");
        setIsPro(false);
      }
    };

    checkPlan();
  }, []);

  useEffect(() => {
    const fetchResumes = async () => {
      try {
        setLoadingResumes(true);
        const {
          data: { session },
        } = await supabase.auth.getSession();

        const currentUserId = session?.user?.id || userId;
        if (!currentUserId) {
          setError("Please log in to view your resumes");
          return;
        }

        const res = await fetch("/api/fetchInfo", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({ userId: currentUserId }),
        });

        const data = await res.json();

        if (data.success && Array.isArray(data.resumes)) {
          const options = data.resumes.map((r: any) => ({
            id: r.id,
            title:
              r.title ||
              `Resume ${new Date(r.created_at).toLocaleDateString()}`,
            createdAt: r.created_at,
            template: r.template_id,
          }));

          setResumeOptions(options);
          if (options.length > 0) {
            setSelectedResumeId(options[0].id);
          }
        } else {
          setResumeOptions([]);
        }
      } catch (err) {
        console.error("Failed to fetch resumes:", err);
        setError("Could not load your resumes");
        setResumeOptions([]);
      } finally {
        setLoadingResumes(false);
      }
    };

    fetchResumes();
  }, []);

  const handleFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<File | null>>,
    previewSetter: React.Dispatch<React.SetStateAction<string | null>>,
    type: "job" | "resume",
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setError(`Please upload a PDF file for ${type}`);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError(
        `${type === "job" ? "Job description" : "Resume"} must be under 5MB`,
      );
      return;
    }

    setter(file);
    previewSetter(URL.createObjectURL(file));
    setError(null);

    if (type === "job") setJobDescription("");
  };

  const uploadFile = async (file: File, folder: string): Promise<string> => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const currentUserId = session?.user?.id;

    if (!currentUserId) {
      throw new Error("User not authenticated. Please log in.");
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("userId", currentUserId);
    formData.append("folder", folder);

    const uploadRes = await fetch("/api/ai/ats/upload", {
      method: "POST",
      body: formData,
    });

    const uploadData = await uploadRes.json();
    if (!uploadRes.ok) throw new Error(uploadData.error || "Upload failed");

    return uploadData.fileKey;
  };

  const handleAnalyze = async () => {
    if (resumeInputMode === "library" && !selectedResumeId) {
      setError("Please select a resume from your library or upload one");
      return;
    }
    if (resumeInputMode === "upload" && !resumePdfFile) {
      setError("Please upload your resume PDF");
      return;
    }

    if (jobInputMode === "text" && !jobDescription.trim()) {
      setError("Please paste a job description or upload a PDF");
      return;
    }
    if (jobInputMode === "pdf" && !jobPdfFile) {
      setError("Please upload the job description PDF");
      return;
    }

    setAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const currentUserId = session?.user?.id;

      if (!currentUserId) {
        throw new Error("Please log in to analyze resumes");
      }

      let jobDescText = jobDescription;
      let resumeFileKey: string | null = null;
      let jobFileKey: string | null = null;

      if (resumeInputMode === "upload" && resumePdfFile) {
        resumeFileKey = await uploadFile(resumePdfFile, "ats-resumes");
      }

      if (jobInputMode === "pdf" && jobPdfFile) {
        jobFileKey = await uploadFile(jobPdfFile, "ats-jobs");
      }

      const analyzeRes = await fetch("/api/ai/ats/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUserId,
          resumeId:
            resumeInputMode === "library" ? selectedResumeId : undefined,
          resumeFileKey:
            resumeInputMode === "upload" ? resumeFileKey : undefined,
          jobDescription: jobInputMode === "text" ? jobDescText : undefined,
          jobFileKey: jobInputMode === "pdf" ? jobFileKey : undefined,
        }),
      });

      const analyzeData = await analyzeRes.json();
      console.log(analyzeData);
      if (!analyzeRes.ok)
        throw new Error(analyzeData.error || "Analysis failed");

      setResult(analyzeData.result);
    } catch (err: any) {
      console.error("ATS analysis error:", err);
      setError(err.message || "Failed to analyze ATS compatibility");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleReset = () => {
    setJobDescription("");
    setJobPdfFile(null);
    setJobPdfPreview(null);
    setResumePdfFile(null);
    setResumePdfPreview(null);
    setResult(null);
    setError(null);
    if (jobFileInputRef.current) jobFileInputRef.current.value = "";
    if (resumeFileInputRef.current) resumeFileInputRef.current.value = "";
  };

  const getGradeColor = (score: number) => {
    if (score >= 90) return "text-green-600 bg-green-50 border-green-200";
    if (score >= 75) return "text-blue-600 bg-blue-50 border-blue-200";
    if (score >= 60) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  const getGradeLetter = (score: number) => {
    if (score >= 90) return "A+";
    if (score >= 85) return "A";
    if (score >= 80) return "A-";
    if (score >= 75) return "B+";
    if (score >= 70) return "B";
    if (score >= 65) return "B-";
    if (score >= 60) return "C+";
    if (score >= 50) return "C";
    return "Needs Work";
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Target className="w-5 h-5 text-purple-600" />
        <h2 className="text-lg font-semibold text-gray-900">
          ATS Compatibility Checker
        </h2>
      </div>

      <p className="text-sm text-gray-600 mb-6">
        Upload or select your resume and job description to check ATS
        compatibility using AI.
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
            The ATS Compatibility Checker is an advanced feature available
            exclusively to Pro users. Upgrade your plan to unlock AI-powered
            resume analysis and more!
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
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              Your Resume
            </h3>

            <div className="flex gap-2 mb-4">
              <button
                onClick={() => {
                  setResumeInputMode("library");
                  setResumePdfFile(null);
                }}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  resumeInputMode === "library"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                From Library
              </button>
              <button
                onClick={() => {
                  setResumeInputMode("upload");
                  setSelectedResumeId("");
                }}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  resumeInputMode === "upload"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Upload PDF
              </button>
            </div>

            {resumeInputMode === "library" && (
              <div>
                {loadingResumes ? (
                  <div className="flex items-center gap-2 text-gray-500">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading your resumes...
                  </div>
                ) : resumeOptions.length === 0 ? (
                  <div className="text-sm text-gray-500 bg-white p-3 rounded-lg border">
                    No resumes found.{" "}
                    <a
                      href="/dashboard/resumes"
                      className="text-blue-600 hover:underline"
                    >
                      Create one first
                    </a>
                    .
                  </div>
                ) : (
                  <div className="relative">
                    <select
                      title="recent resume"
                      ref={resumeSelectRef}
                      value={selectedResumeId}
                      onChange={(e) => setSelectedResumeId(e.target.value)}
                      className="w-full appearance-none px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    >
                      {resumeOptions.map((resume) => (
                        <option key={resume.id} value={resume.id}>
                          {resume.title} •{" "}
                          {new Date(resume.createdAt).toLocaleDateString()}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                )}
              </div>
            )}

            {resumeInputMode === "upload" && (
              <div>
                {!resumePdfFile ? (
                  <div
                    onClick={() => resumeFileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50/50 transition group"
                  >
                    <input
                      title="resume pdf"
                      ref={resumeFileInputRef}
                      type="file"
                      accept=".pdf"
                      onChange={(e) =>
                        handleFileSelect(
                          e,
                          setResumePdfFile,
                          setResumePdfPreview,
                          "resume",
                        )
                      }
                      className="hidden"
                    />
                    <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3 group-hover:text-blue-500 transition" />
                    <p className="text-sm font-medium text-gray-700">
                      Click to upload resume PDF
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Max 5MB • PDF only
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {resumePdfFile.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(resumePdfFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      title="close"
                      onClick={() => {
                        setResumePdfFile(null);
                        setResumePdfPreview(null);
                        if (resumeFileInputRef.current)
                          resumeFileInputRef.current.value = "";
                      }}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Target className="w-4 h-4 text-purple-600" />
              Job Description
            </h3>

            <div className="flex gap-2 mb-4">
              <button
                onClick={() => {
                  setJobInputMode("text");
                  setJobPdfFile(null);
                }}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  jobInputMode === "text"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Paste Text
              </button>
              <button
                onClick={() => {
                  setJobInputMode("pdf");
                  setJobDescription("");
                }}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  jobInputMode === "pdf"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Upload PDF
              </button>
            </div>

            {jobInputMode === "text" && (
              <div>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the full job description here..."
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {jobDescription.length} characters
                </p>
              </div>
            )}

            {jobInputMode === "pdf" && (
              <div>
                {!jobPdfFile ? (
                  <div
                    onClick={() => jobFileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50/50 transition group"
                  >
                    <input
                      title="job description"
                      ref={jobFileInputRef}
                      type="file"
                      accept=".pdf"
                      onChange={(e) =>
                        handleFileSelect(
                          e,
                          setJobPdfFile,
                          setJobPdfPreview,
                          "job",
                        )
                      }
                      className="hidden"
                    />
                    <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3 group-hover:text-blue-500 transition" />
                    <p className="text-sm font-medium text-gray-700">
                      Click to upload job description PDF
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Max 5MB • PDF only
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {jobPdfFile.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(jobPdfFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      title="close file"
                      onClick={() => {
                        setJobPdfFile(null);
                        setJobPdfPreview(null);
                        if (jobFileInputRef.current)
                          jobFileInputRef.current.value = "";
                      }}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            onClick={handleAnalyze}
            disabled={
              analyzing ||
              (resumeInputMode === "library" && !selectedResumeId) ||
              (resumeInputMode === "upload" && !resumePdfFile) ||
              (jobInputMode === "text" && !jobDescription.trim()) ||
              (jobInputMode === "pdf" && !jobPdfFile)
            }
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-blue-700 transition disabled:opacity-50"
          >
            {analyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing with Groq AI...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Check ATS Compatibility
              </>
            )}
          </button>

          {result && (
            <div className="mt-6 space-y-6">
              <div
                className={`p-6 rounded-xl border-2 ${getGradeColor(result.score)}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium opacity-80">
                      ATS Compatibility Score
                    </p>
                    <p className="text-4xl font-bold mt-1">
                      {result.score}/100
                    </p>
                    <p className="text-lg font-semibold mt-1">
                      Grade: {getGradeLetter(result.score)}
                    </p>
                  </div>
                  <div className="w-20 h-20 rounded-full border-4 border-current flex items-center justify-center">
                    <TrendingUp className="w-10 h-10" />
                  </div>
                </div>
              </div>

              {result.feedback && (
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <p className="text-sm text-purple-900">{result.feedback}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Keyword Match</p>
                  <p className="text-2xl font-bold text-blue-700">
                    {result.keywordMatchPercentage}%
                  </p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Matched Terms</p>
                  <p className="text-2xl font-bold text-green-700">
                    {result.matchedKeywords.length}
                  </p>
                </div>
              </div>

              {result.matchedKeywords.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Matched Keywords ({result.matchedKeywords.length})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {result.matchedKeywords.map((keyword, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {result.missingKeywords.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-red-600" />
                    Missing Keywords ({result.missingKeywords.length})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {result.missingKeywords.map((keyword, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded-full"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {result.strengths.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    What's Working Well
                  </h3>
                  <ul className="space-y-2">
                    {result.strengths.map((strength, i) => (
                      <li
                        key={i}
                        className="text-sm text-gray-700 flex items-start gap-2"
                      >
                        <span className="text-green-600 mt-1">✓</span>
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {result.improvements.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <Key className="w-4 h-4 text-purple-600" />
                    Quick Improvements
                  </h3>
                  <ul className="space-y-2">
                    {result.improvements.map((suggestion, i) => (
                      <li
                        key={i}
                        className="text-sm text-gray-700 flex items-start gap-2"
                      >
                        <span className="text-purple-600 mt-1">→</span>
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {result.atsWarnings.length > 0 && (
                <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <h4 className="font-medium text-amber-900 mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    ATS Warnings
                  </h4>
                  <ul className="space-y-1">
                    {result.atsWarnings.map((warning, i) => (
                      <li key={i} className="text-sm text-amber-800">
                        • {warning}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                onClick={handleReset}
                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Check Another Job Description
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
