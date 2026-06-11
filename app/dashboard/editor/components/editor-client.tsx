"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Save, Download, Eye, Sparkles, Undo, Redo } from "lucide-react";
import { pdf } from "@react-pdf/renderer";
import { ResumePDF } from "./resume-pdf";

import EditorHeader from "./editor-header";
import EditorSidebar from "./editor-sidebar";
import PersonalInfoForm from "./personal-info";
import SummaryForm from "./summary-form";
import ResumePreview from "./resume-preview";
import AutosaveIndicator from "./auto-save";
import ExportMenu from "./export-menu";
import AIImprovementModal from "./AI-improvement-model";
import { supabase } from "@/app/lib/supabaseClient";
import { CheckSession } from "@/app/components/check-session";
import ExperienceForm from "./experience-form";
import EducationForm from "./education-form";
import SkillsForm from "./skills-form";

interface ResumeData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    portfolio: string;
  };
  summary: string;
  experience: Array<{
    id: string;
    role: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string;
    achievements: string[];
  }>;
  education: Array<{
    id: string;
    degree: string;
    school: string;
    location: string;
    startDate: string;
    endDate: string;
    gpa: string;
    honors: string[];
    current: boolean;
    description: string;
  }>;
  skills: {
    technical: string[];
    soft: string[];
    languages: string[];
  };
  certifications: Array<{
    id: string;
    name: string;
    issuer: string;
    date: string;
    credentialId: string;
  }>;
}

const INITIAL_RESUME_DATA: ResumeData = {
  personalInfo: {
    fullName: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    portfolio: "",
  },
  summary: "",
  experience: [],
  education: [],
  skills: {
    technical: [],
    soft: [],
    languages: [],
  },
  certifications: [],
};

export default function EditorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [resumeData, setResumeData] = useState<ResumeData>(INITIAL_RESUME_DATA);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [activeSection, setActiveSection] = useState<string>("personal");
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [session, setSession] = useState<any>(null);
  const [resumeId, setResumeId] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(true);
  const [history, setHistory] = useState<ResumeData[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [category, setCategory] = useState("classic");

  const [showAIModal, setShowAIModal] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [currentAIField, setCurrentAIField] = useState<string>("");
  const [currentAIValue, setCurrentAIValue] = useState<string>("");
  const [currentAIIndex, setCurrentAIIndex] = useState<number | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const saveTimeoutRef = useRef<NodeJS.Timeout>(null);

  useEffect(() => {
    const id = searchParams.get("template");
    console.log("selected template", id);
    setTemplateId(id);
  }, []);

  useEffect(() => {
    const resumeIdParam = searchParams.get("resume");
    console.log("resume id", resumeIdParam);

    if (resumeIdParam) {
      setResumeId(resumeIdParam);
    }

    const fetchResumeData = async () => {
      if (!resumeIdParam) return;
      const res = await fetch("/api/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeId: resumeIdParam }),
      });
      if (!res.ok) console.log("API call failed on resume");
      const data = await res.json();
      console.log("resume request", data.data?.content);
      if (!data.success) {
        console.log(data.error);
        return;
      }
      try {
        const content = JSON.parse(data.data.content);
        setResumeData(content);
      } catch (e) {
        console.error("Failed to parse resume content", e);
      }
    };
    fetchResumeData();
  }, [searchParams]);

  useEffect(() => {
    let isMounted = true;

    const initializeEditor = async () => {
      try {
        const isLoggedIn = await CheckSession();
        if (!isLoggedIn && isMounted) {
          router.push("/login");
          return;
        }

        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session && isMounted) {
          router.push("/login");
          return;
        }
        if (session && isMounted) {
          setSession(session);
        }

        const templateIdParam = searchParams.get("template");
        console.log("TemplateId", templateIdParam);
        if (templateIdParam && isMounted) {
          setTemplateId(templateIdParam);
        }
      } catch (error) {
        console.error("Editor init error:", error);
      }
    };

    initializeEditor();

    return () => {
      isMounted = false;
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [router, searchParams]);

  const saveResume = useCallback(
    async (data: ResumeData) => {
      if (!session?.user?.id) return;

      setIsSaving(true);

      try {
        const resumePayload: Record<string, any> = {
          user_id: session.user.id,
          content: JSON.stringify(data),
          title: data.personalInfo.fullName?.trim()
            ? `${data.personalInfo.fullName}'s Resume`
            : "Untitled Resume",
          updated_at: new Date().toISOString(),
          template_id: templateId,
        };

        let result;

        if (resumeId && resumeId.trim()) {
          result = await supabase
            .from("resumes")
            .update(resumePayload)
            .eq("id", resumeId)
            .eq("user_id", session.user.id);
        } else {
          result = await supabase
            .from("resumes")
            .insert([resumePayload])
            .select()
            .single();

          if (result.data?.id) {
            const newId = result.data.id;
            setResumeId(newId);

            const url = new URL(window.location.href);
            url.searchParams.set("resume", newId);
            window.history.replaceState(null, "", url.toString());
          }
        }

        if (result.error) throw result.error;

        setLastSaved(new Date());
        addToHistory(data);
      } catch (error: any) {
        console.error("Save failed:", error.message);
      } finally {
        setIsSaving(false);
      }
    },
    [session, resumeId, templateId],
  );

  const triggerAutosave = useCallback(
    (data: ResumeData) => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(() => {
        saveResume(data);
      }, 2000);
    },
    [saveResume],
  );

  const updateResumeData = useCallback(
    (updates: Partial<ResumeData>) => {
      setResumeData((prev) => {
        const newData = { ...prev, ...updates };
        triggerAutosave(newData);
        return newData;
      });
    },
    [triggerAutosave],
  );

  const addToHistory = useCallback(
    (data: ResumeData) => {
      setHistory((prev) => {
        const newHistory = prev.slice(0, historyIndex + 1);
        newHistory.push(JSON.parse(JSON.stringify(data)));
        if (newHistory.length > 20) newHistory.shift();
        return newHistory;
      });
      setHistoryIndex((prev) => Math.min(prev + 1, 19));
    },
    [historyIndex],
  );

  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setResumeData(JSON.parse(JSON.stringify(history[newIndex])));
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setResumeData(JSON.parse(JSON.stringify(history[newIndex])));
    }
  };

  const handleAIImprovement = async (
    field: string,
    currentValue: string,
    context?: any,
  ): Promise<string[]> => {
    try {
      const res = await fetch("/api/ai/improve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          field,
          currentValue,
          context: {
            resumeData,
            jobDescription: context?.jobDescription,
          },
        }),
      });

      const data = await res.json();
      console.log("📡 Backend response:", data);

      if (data.success) {
        const examples = data.suggestions.map((s: any) => s.example);
        console.log("📡 Mapped suggestions:", examples);
        return examples;
      }
      throw new Error(data.error);
    } catch (error) {
      console.error("AI improvement failed:", error);
      throw error;
    }
  };

  const openAIModal = async (
    field: string,
    currentValue: string,
    context?: any,
    index?: number,
  ) => {
    console.log("🎯 openAIModal called:", { field, currentValue });
    setAiLoading(true);
    setCurrentAIField(field);
    setCurrentAIValue(currentValue);
    setCurrentAIIndex(index ?? null);

    try {
      const suggestions = await handleAIImprovement(
        field,
        currentValue,
        context,
      );
      console.log("🎯 Suggestions received:", suggestions);
      setAiSuggestions(suggestions);
      setShowAIModal(true);
    } catch (err) {
      console.error("Failed to get AI suggestions:", err);
      alert("Failed to generate suggestions. Please try again.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleApplySuggestion = (suggestion: string) => {
    if (currentAIField === "summary") {
      updateResumeData({ summary: suggestion });
    } else if (
      currentAIField.startsWith("experience.description") &&
      currentAIIndex !== null
    ) {
      updateResumeData({
        experience: resumeData.experience.map((item, i) =>
          i === currentAIIndex ? { ...item, description: suggestion } : item,
        ),
      });
    } else if (
      currentAIField.startsWith("experience.achievement") &&
      currentAIIndex !== null
    ) {
      updateResumeData({
        experience: resumeData.experience.map((item, i) =>
          i === currentAIIndex
            ? {
                ...item,
                achievements: [...(item.achievements || []), suggestion],
              }
            : item,
        ),
      });
    } else if (
      currentAIField.startsWith("education.description") &&
      currentAIIndex !== null
    ) {
      updateResumeData({
        education: resumeData.education.map((item, i) =>
          i === currentAIIndex ? { ...item, description: suggestion } : item,
        ),
      });
    } else if (
      currentAIField.startsWith("education.honors") &&
      currentAIIndex !== null
    ) {
      updateResumeData({
        education: resumeData.education.map((item, i) =>
          i === currentAIIndex
            ? { ...item, honors: [...(item.honors || []), suggestion] }
            : item,
        ),
      });
    } else if (currentAIField.startsWith("skills.")) {
      const newSkills = suggestion
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      updateResumeData({
        skills: {
          ...resumeData.skills,
          technical: [...(resumeData.skills.technical || []), ...newSkills],
        },
      });
    }
    setShowAIModal(false);
  };

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const res = await fetch(`/api/template?templateId=${templateId}`, {
          method: "GET",
        });
        const result = await res.json();
        console.log("📦 API Response:", {
          success: result.success,
          category: result.data?.category,
        });

        if (result.success && result.data?.category) {
          setCategory(result.data.category);
        }
      } catch (error) {
        console.error("❌ Fetch error:", error);
      }
    };

    if (templateId) {
      fetchTemplate();
    }
  }, [templateId]);

  const handleExportPDF = async () => {
    if (isExporting) return;
    setIsExporting(true);

    try {
      const fullName = resumeData.personalInfo?.fullName?.trim() || "resume";
      const safeName = fullName
        .replace(/[^a-z0-9]+/gi, "-")
        .replace(/^-+|-+$/g, "")
        .toLowerCase();

      const blob = await pdf(
        <ResumePDF data={resumeData} templateId={category || "classic"} />,
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${safeName}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("PDF export failed:", error);
      alert("Failed to export PDF. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <EditorHeader
        resumeTitle={resumeData.personalInfo.fullName + "'s Resume"}
        isSaving={isSaving}
        lastSaved={lastSaved}
        onUndo={undo}
        onRedo={redo}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        onExportPDF={handleExportPDF}
        onTogglePreview={() => setShowPreview(!showPreview)}
        showPreview={showPreview}
        isExporting={isExporting}
      />

      <div className="flex flex-1 overflow-hidden">
        <div
          className={`flex-1 overflow-y-auto transition-all ${showPreview ? "lg:w-1/2" : "w-full"}`}
        >
          <div className="max-w-3xl mx-auto p-6 space-y-8">
            <EditorSidebar
              activeSection={activeSection}
              onSectionChange={setActiveSection}
              completionStatus={{
                personal: !!resumeData.personalInfo.fullName,
                summary: resumeData.summary.length > 50,
                experience: resumeData.experience.length > 0,
                education: resumeData.education.length > 0,
                skills: resumeData.skills.technical.length > 0,
              }}
            />

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              {activeSection === "personal" && (
                <PersonalInfoForm
                  data={resumeData.personalInfo}
                  onChange={(updates) =>
                    updateResumeData({
                      personalInfo: { ...resumeData.personalInfo, ...updates },
                    })
                  }
                />
              )}

              {activeSection === "summary" && (
                <SummaryForm
                  value={resumeData.summary}
                  onChange={(value) => updateResumeData({ summary: value })}
                  onAIImprove={(context) =>
                    openAIModal("summary", resumeData.summary, context)
                  }
                  isLoading={aiLoading}
                />
              )}

              {activeSection === "experience" && (
                <ExperienceForm
                  items={resumeData.experience}
                  onChange={(items) => updateResumeData({ experience: items })}
                  onAIImprove={(text, context) =>
                    openAIModal(
                      `experience.${context.field}`,
                      text,
                      {},
                      resumeData.experience.findIndex(
                        (e) => e.id === context.entry.id,
                      ),
                    )
                  }
                  isLoading={aiLoading}
                />
              )}

              {activeSection === "education" && (
                <EducationForm
                  items={resumeData.education}
                  onChange={(items) => updateResumeData({ education: items })}
                  onAIImprove={(text, context) =>
                    openAIModal(
                      `education.${context.field}`,
                      text,
                      {},
                      resumeData.education.findIndex(
                        (e) => e.id === context.entry.id,
                      ),
                    )
                  }
                  aiLoading={aiLoading}
                />
              )}

              {activeSection === "skills" && (
                <SkillsForm
                  skills={resumeData.skills}
                  onChange={(skills) => updateResumeData({ skills })}
                  onAIImprove={(category, currentSkills) =>
                    openAIModal(`skills.${category}`, "", { currentSkills })
                  }
                  isLoading={aiLoading}
                />
              )}
            </div>
          </div>
        </div>

        {showPreview && (
          <div className="hidden lg:block lg:w-1/2 border-l border-gray-200 bg-gray-100 overflow-y-auto">
            <div className="sticky top-0 p-6">
              <ResumePreview
                data={resumeData}
                templateId={templateId!}
                onTemplateChange={setSelectedTemplate}
              />
            </div>
          </div>
        )}
      </div>

      {!showPreview && (
        <button
          title="show-preview"
          onClick={() => setShowPreview(true)}
          className="lg:hidden fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition z-50"
        >
          <Eye className="w-6 h-6" />
        </button>
      )}

      <AutosaveIndicator isSaving={isSaving} lastSaved={lastSaved} />

      <ExportMenu onExportPDF={handleExportPDF} className="lg:hidden" />

      {showAIModal && (
        <AIImprovementModal
          suggestions={aiSuggestions}
          currentValue={currentAIValue}
          fieldLabel={`Your current ${currentAIField.replace(".", " ")}`}
          onSelect={handleApplySuggestion}
          onClose={() => setShowAIModal(false)}
          isLoading={aiLoading}
        />
      )}
    </div>
  );
}
