"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

interface TemplateData {
  id: string;
  name: string;
  category: "classic" | "modern" | "minimal" | "professional";
  colors?: string[];
  fonts?: {
    heading?: string;
    body?: string;
  };
  layout?: {
    sidebar?: boolean;
    twoColumn?: boolean;
  };
  [key: string]: any;
}
interface CertificationItem {
  id: string;
  name: string;
  issuer: string;
  date: string;
  credentialId: string;
}

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
  certifications: CertificationItem[];
}

interface ResumePreviewProps {
  data: ResumeData;
  templateId: string;
  onTemplateChange: (template: string) => void;
}

interface Props {
  data: ResumeData;
  templateId: string;
  onTemplateChange: (id: string) => void;
}

const formatDate = (date: string) => {
  if (!date) return "";
  const [year, month] = date.split("-");
  return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString(
    "en-US",
    {
      month: "short",
      year: "numeric",
    },
  );
};

function renderSkillsSection(
  skills: any,
  primaryColor: string,
  variant: "classic" | "modern" | "minimal" | "professional" = "classic",
) {
  if (!skills) return null;

  const hasSkills = () => {
    if (Array.isArray(skills) && skills.length > 0) return true;
    if (typeof skills === "object" && skills !== null) {
      return Object.values(skills).some(
        (val) => Array.isArray(val) && (val as string[]).length > 0,
      );
    }
    return false;
  };

  if (!hasSkills()) return null;

  const sectionClass =
    variant === "modern" ? "mb-6" : variant === "minimal" ? "mb-8" : "mb-6";

  const titleClass =
    variant === "modern"
      ? "font-bold text-sm uppercase tracking-wider mb-3 opacity-90"
      : variant === "minimal"
        ? "text-sm font-bold uppercase tracking-wider mb-3"
        : "font-bold uppercase text-sm tracking-wider border-b border-gray-300 pb-1 mb-3";

  return (
    <section className={sectionClass}>
      <h2
        className={titleClass}
        style={
          variant !== "classic" && variant !== "minimal"
            ? { color: primaryColor }
            : {}
        }
      >
        Skills
      </h2>

      {Array.isArray(skills) && skills.length > 0 && (
        <p className="text-sm text-gray-700">{skills.join(" • ")}</p>
      )}

      {!Array.isArray(skills) && typeof skills === "object" && (
        <div className="text-sm text-gray-700 space-y-1">
          {Object.entries(skills).map(([category, items]) => {
            if (!Array.isArray(items) || items.length === 0) return null;
            return (
              <p key={category}>
                <span className="font-medium capitalize">{category}:</span>{" "}
                {(items as string[]).join(", ")}
              </p>
            );
          })}
        </div>
      )}
    </section>
  );
}

function renderEducationSection(
  education: any[],
  variant: "classic" | "modern" | "minimal" | "professional" = "classic",
  primaryColor?: string,
) {
  if (!education?.length) return null;

  const sectionClass = variant === "minimal" ? "mb-8" : "mb-6";
  const titleClass =
    variant === "modern"
      ? "font-bold text-lg mb-3"
      : variant === "minimal"
        ? "text-sm font-bold uppercase tracking-wider mb-4"
        : "font-bold uppercase text-sm tracking-wider border-b border-gray-300 pb-1 mb-3";

  return (
    <section className={sectionClass}>
      <h2
        className={titleClass}
        style={
          variant !== "classic" && variant !== "minimal"
            ? { color: primaryColor }
            : {}
        }
      >
        Education
      </h2>
      <div className={variant === "professional" ? "space-y-4" : ""}>
        {education.map((edu: any, i: number) => (
          <div key={i} className={variant === "professional" ? "" : "mb-4"}>
            <div
              className={
                variant === "professional"
                  ? "flex flex-col sm:flex-row sm:justify-between"
                  : "flex justify-between items-baseline"
              }
            >
              <h3
                className={
                  variant === "professional"
                    ? "font-bold text-gray-900"
                    : "font-bold"
                }
              >
                {edu.degree}
              </h3>
              <span
                className={`text-sm ${variant === "professional" ? "font-medium" : "text-gray-600"}`}
                style={
                  variant !== "classic" && variant !== "minimal"
                    ? { color: primaryColor }
                    : {}
                }
              >
                {formatDate(edu.startDate)} –{" "}
                {edu.current ? "Present" : formatDate(edu.endDate)}
              </span>
            </div>
            <p className="text-sm text-gray-700">
              {edu.school}
              {edu.location && `, ${edu.location}`}
              {edu.gpa && ` • GPA: ${edu.gpa}`}
            </p>
            {edu.description && (
              <p className="text-sm mt-2 text-gray-600 whitespace-pre-wrap">
                {edu.description}
              </p>
            )}
            {edu.honors?.length > 0 && (
              <p className="text-sm mt-1 text-gray-600 italic">
                {edu.honors.join(" • ")}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

export default function ResumePreview({
  data,
  templateId,
  onTemplateChange,
}: Props) {
  const [previewScale, setPreviewScale] = useState(1);
  const [templateInfo, setTemplateInfo] = useState<TemplateData | null>(null);
  const [loading, setLoading] = useState(true);

  const [category, setCategory] = useState<string>("classic");

  useEffect(() => {
    console.log("🔄 ResumePreview render:", {
      templateId,
      category,
      hasTemplateInfo: !!templateInfo,
      hasData: !!data,
    });
  }, [templateId, category, templateInfo, data]);

  useEffect(() => {
    const fetchTemplate = async () => {
      setLoading(true);
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
          setTemplateInfo(result.data);
          setCategory(result.data.category);
        } else {
          if (
            ["classic", "modern", "minimal", "professional"].includes(
              templateId,
            )
          ) {
            setCategory(templateId);
          }
        }
      } catch (error) {
        console.error("❌ Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    if (templateId) {
      fetchTemplate();
    }
  }, [templateId]);

  const TemplateComponent = (() => {
    console.log("🎯 Selecting component for category:", category);
    switch (category) {
      case "modern":
        return ModernTemplate;
      case "minimal":
        return MinimalTemplate;
      case "professional":
        return ProfessionalTemplate;
      case "classic":
      default:
        return ClassicTemplate;
    }
  })();

  if (loading && category === "classic" && !templateInfo) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-gray-900">Preview</h3>
        </div>
        <div className="bg-gray-100 h-[500px] rounded-lg flex items-center justify-center">
          <div className="text-gray-500">Loading template...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-gray-900">
          Preview {templateInfo && `- ${templateInfo.name}`}
        </h3>
        <select
          title="template-type"
          value={templateId}
          onChange={(e) => onTemplateChange(e.target.value)}
          className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-600"
        >
          <option value="classic">Classic</option>
          <option value="modern">Modern</option>
          <option value="minimal">Minimal</option>
          <option value="professional">Professional</option>
        </select>
      </div>

      <div
        id="resume-preview"
        className="bg-white shadow-lg mx-auto overflow-hidden"
        style={{
          width: "210mm",
          minHeight: "297mm",
          transform: `scale(${previewScale})`,
          transformOrigin: "top center",
        }}
      >
        <TemplateComponent data={data} templateInfo={templateInfo} />
      </div>

      <div className="flex items-center justify-center gap-2">
        <button
          onClick={() => setPreviewScale((s) => Math.max(0.5, s - 0.1))}
          className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
        >
          −
        </button>
        <span className="text-sm text-gray-600">
          {Math.round(previewScale * 100)}%
        </span>
        <button
          onClick={() => setPreviewScale((s) => Math.min(1.5, s + 0.1))}
          className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
        >
          +
        </button>
      </div>
    </div>
  );
}

function ClassicTemplate({ data, templateInfo }: any) {
  const primaryColor = templateInfo?.colors?.[0] || "#111827";

  return (
    <div className="p-12 font-serif text-gray-900 leading-relaxed">
      <header className="mb-8">
        <h1 className="text-4xl font-bold tracking-wide">
          {data.personalInfo?.fullName}
        </h1>
        <div className="mt-2 text-sm text-gray-600">
          {[
            data.personalInfo?.email,
            data.personalInfo?.phone,
            data.personalInfo?.location,
          ]
            .filter(Boolean)
            .join(" • ")}
        </div>
      </header>

      <div className="space-y-6">
        {data.summary && (
          <section>
            <h2
              className="text-sm font-bold uppercase tracking-widest mb-2"
              style={{ color: primaryColor }}
            >
              Summary
            </h2>
            <p className="text-sm">{data.summary}</p>
          </section>
        )}

        {renderSkillsSection(data.skills, primaryColor, "classic")}

        {data.experience?.length > 0 && (
          <section>
            <h2
              className="text-sm font-bold uppercase tracking-widest mb-3"
              style={{ color: primaryColor }}
            >
              Experience
            </h2>
            {data.experience.map((job: any, i: number) => (
              <div key={i} className="mb-4">
                <div className="flex justify-between">
                  <h3 className="font-semibold">{job.role}</h3>
                  <span className="text-xs text-gray-500">
                    {formatDate(job.startDate)} –{" "}
                    {job.current ? "Present" : formatDate(job.endDate)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 italic">{job.company}</p>
                <p className="text-sm mt-1 whitespace-pre-wrap">
                  {job.description}
                </p>
              </div>
            ))}
          </section>
        )}

        {renderEducationSection(data.education, "classic")}

        {data.certifications?.length > 0 && (
          <section>
            <h2 className="text-sm font-bold uppercase tracking-widest mb-2">
              Certifications
            </h2>
            <ul className="text-sm list-disc list-inside">
              {data.certifications.map((c: string, i: number) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}

function ModernTemplate({ data, templateInfo }: any) {
  const primaryColor = templateInfo?.colors?.[0] || "#2563eb";

  return (
    <div className="p-6 bg-gray-100 font-sans">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div
          className="p-6 text-white"
          style={{ backgroundColor: primaryColor }}
        >
          <h1 className="text-3xl font-bold">{data.personalInfo?.fullName}</h1>
          <p className="text-sm opacity-90 mt-1">
            {[data.personalInfo?.email, data.personalInfo?.phone]
              .filter(Boolean)
              .join(" • ")}
          </p>
        </div>

        <div className="p-6 space-y-6">
          {data.summary && (
            <section>
              <h2 className="font-semibold mb-2">Profile</h2>
              <p className="text-sm text-gray-600">{data.summary}</p>
            </section>
          )}

          {renderSkillsSection(data.skills, primaryColor, "modern")}

          {data.experience?.length > 0 && (
            <section>
              <h2 className="font-semibold mb-3">Experience</h2>
              {data.experience.map((job: any, i: number) => (
                <div key={i} className="mb-4">
                  <h3 className="font-medium">{job.role}</h3>
                  <p className="text-xs text-gray-500">
                    {job.company} • {formatDate(job.startDate)} –{" "}
                    {job.current ? "Present" : formatDate(job.endDate)}
                  </p>
                  <p className="text-sm mt-1 text-gray-600 whitespace-pre-wrap">
                    {job.description}
                  </p>
                </div>
              ))}
            </section>
          )}

          {renderEducationSection(data.education, "modern", primaryColor)}
        </div>
      </div>
    </div>
  );
}

function MinimalTemplate({ data, templateInfo }: any) {
  const primaryColor = templateInfo?.colors?.[0] || "#111827";

  return (
    <div className="p-16 font-sans text-gray-900 max-w-3xl mx-auto">
      <header className="mb-10">
        <h1 className="text-5xl font-light">{data.personalInfo?.fullName}</h1>
        <p className="text-gray-500 mt-2 text-sm">
          {[data.personalInfo?.email, data.personalInfo?.phone]
            .filter(Boolean)
            .join(" · ")}
        </p>
      </header>

      <div className="space-y-10">
        {data.summary && (
          <p className="text-base text-gray-700 leading-relaxed">
            {data.summary}
          </p>
        )}

        {renderSkillsSection(data.skills, primaryColor, "minimal")}

        {data.experience?.length > 0 && (
          <section>
            {data.experience.map((job: any, i: number) => (
              <div key={i} className="mb-6">
                <h3 className="font-medium">{job.role}</h3>
                <p className="text-xs text-gray-500 mb-1">
                  {job.company} · {formatDate(job.startDate)} –{" "}
                  {job.current ? "Present" : formatDate(job.endDate)}
                </p>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">
                  {job.description}
                </p>
              </div>
            ))}
          </section>
        )}

        {renderEducationSection(data.education, "minimal", primaryColor)}
      </div>
    </div>
  );
}

function ProfessionalTemplate({ data, templateInfo }: any) {
  const primaryColor = templateInfo?.colors?.[0] || "#1e3a8a";

  return (
    <div className="p-10 font-sans text-gray-900">
      <header className="mb-8">
        <h1 className="text-4xl font-bold" style={{ color: primaryColor }}>
          {data.personalInfo?.fullName}
        </h1>
        <p className="text-sm text-gray-600 mt-2">
          {[data.personalInfo?.email, data.personalInfo?.phone]
            .filter(Boolean)
            .join(" • ")}
        </p>
      </header>

      <div className="grid grid-cols-3 gap-8">
        <aside className="col-span-1">
          {renderSkillsSection(data.skills, primaryColor, "professional")}
        </aside>

        <main className="col-span-2 space-y-6">
          {data.summary && (
            <section>
              <h2
                className="font-semibold mb-2"
                style={{ color: primaryColor }}
              >
                Summary
              </h2>
              <p className="text-sm text-gray-700">{data.summary}</p>
            </section>
          )}

          {data.experience?.length > 0 && (
            <section>
              <h2
                className="font-semibold mb-3"
                style={{ color: primaryColor }}
              >
                Experience
              </h2>
              {data.experience.map((job: any, i: number) => (
                <div key={i} className="mb-5 border-l-2 pl-4">
                  <h3 className="font-semibold">{job.role}</h3>
                  <p className="text-xs text-gray-500">
                    {job.company} • {formatDate(job.startDate)} –{" "}
                    {job.current ? "Present" : formatDate(job.endDate)}
                  </p>
                  <p className="text-sm mt-1 text-gray-700 whitespace-pre-wrap">
                    {job.description}
                  </p>
                </div>
              ))}
            </section>
          )}

          {renderEducationSection(data.education, "professional", primaryColor)}
        </main>
      </div>
    </div>
  );
}
