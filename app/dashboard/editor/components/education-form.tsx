"use client";

import { useState } from "react";
import {
  Plus,
  Trash2,
  Sparkles,
  Loader2,
  ChevronUp,
  ChevronDown,
  X,
} from "lucide-react";

interface Education {
  id: string;
  degree: string;
  school: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  gpa: string;
  honors: string[];
  description: string;
}

interface Props {
  items: Education[];
  onChange: (items: Education[]) => void;
  onAIImprove?: (
    text: string,
    context: { field: string; entry: Education },
  ) => void;
  aiLoading?: boolean;
}

export default function EducationForm({
  items,
  onChange,
  onAIImprove,
  aiLoading = false,
}: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const addEducation = () => {
    const newEntry: Education = {
      id: crypto.randomUUID(),
      degree: "",
      school: "",
      location: "",
      startDate: "",
      endDate: "",
      current: false,
      gpa: "",
      honors: [],
      description: "",
    };
    onChange([...items, newEntry]);
    setExpandedId(newEntry.id);
  };

  const updateEducation = (id: string, updates: Partial<Education>) => {
    onChange(
      items.map((item) => (item.id === id ? { ...item, ...updates } : item)),
    );
  };

  const deleteEducation = (id: string) => {
    if (confirm("Delete this education entry?")) {
      onChange(items.filter((item) => item.id !== id));
      if (expandedId === id) setExpandedId(null);
    }
  };

  const moveEducation = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= items.length) return;

    const newItems = [...items];
    [newItems[index], newItems[newIndex]] = [
      newItems[newIndex],
      newItems[index],
    ];
    onChange(newItems);
  };

  const handleAIImprove = (
    id: string,
    field: "description" | "honors",
    currentValue: string,
  ) => {
    if (!onAIImprove || aiLoading) return;

    const entry = items.find((e) => e.id === id);
    if (!entry) return;

    onAIImprove(currentValue, { field, entry });
  };

  const addHonor = (educationId: string, honor: string) => {
    const entry = items.find((e) => e.id === educationId);
    if (!entry || !honor.trim()) return;

    updateEducation(educationId, {
      honors: [...entry.honors, honor.trim()],
    });
  };

  const removeHonor = (educationId: string, honorToRemove: string) => {
    const entry = items.find((e) => e.id === educationId);
    if (!entry) return;

    updateEducation(educationId, {
      honors: entry.honors.filter((h) => h !== honorToRemove),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Education</h2>
          <p className="text-sm text-gray-600">
            Add your degrees, certifications, and academic achievements
          </p>
        </div>
        <button
          onClick={addEducation}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
        >
          <Plus className="w-4 h-4" />
          Add Education
        </button>
      </div>

      {items.length === 0 && (
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
          <GraduationCap className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 mb-4">No education entries yet</p>
          <button
            onClick={addEducation}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            + Add your first education
          </button>
        </div>
      )}

      <div className="space-y-4">
        {items.map((education, index) => (
          <EducationEntry
            key={education.id}
            education={education}
            index={index}
            isExpanded={expandedId === education.id}
            isLast={index === items.length - 1}
            isFirst={index === 0}
            aiLoading={aiLoading}
            onToggleExpand={() =>
              setExpandedId(expandedId === education.id ? null : education.id)
            }
            onUpdate={(updates) => updateEducation(education.id, updates)}
            onDelete={() => deleteEducation(education.id)}
            onMoveUp={() => moveEducation(index, "up")}
            onMoveDown={() => moveEducation(index, "down")}
            onAIImprove={(field, value) =>
              handleAIImprove(education.id, field, value)
            }
            onAddHonor={(honor) => addHonor(education.id, honor)}
            onRemoveHonor={(honor) => removeHonor(education.id, honor)}
          />
        ))}
      </div>
    </div>
  );
}

function EducationEntry({
  education,
  index,
  isExpanded,
  isLast,
  isFirst,
  aiLoading,
  onToggleExpand,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  onAIImprove,
  onAddHonor,
  onRemoveHonor,
}: {
  education: Education;
  index: number;
  isExpanded: boolean;
  isLast: boolean;
  isFirst: boolean;
  aiLoading: boolean;
  onToggleExpand: () => void;
  onUpdate: (updates: Partial<Education>) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onAIImprove: (field: "description" | "honors", value: string) => void;
  onAddHonor: (honor: string) => void;
  onRemoveHonor: (honor: string) => void;
}) {
  const [newHonor, setNewHonor] = useState("");
  const [showHonorInput, setShowHonorInput] = useState(false);

  const formatDisplayDate = (start: string, end: string, current: boolean) => {
    if (!start) return "";

    const startDate = new Date(`${start}-01`).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });

    if (current) {
      return `${startDate} – Present`;
    }

    if (end) {
      const endDate = new Date(`${end}-01`).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });
      return `${startDate} – ${endDate}`;
    }

    return startDate;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div
        className="p-4 cursor-pointer hover:bg-gray-50 transition"
        onClick={onToggleExpand}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                #{index + 1}
              </span>
              {education.degree && (
                <h3 className="font-medium text-gray-900 truncate">
                  {education.degree}
                </h3>
              )}
            </div>
            <p className="text-sm text-gray-600">
              {education.school || "Company name"}
              {education.location && ` • ${education.location}`}
            </p>
            {education.startDate && (
              <p className="text-xs text-gray-500 mt-1">
                {formatDisplayDate(
                  education.startDate,
                  education.endDate,
                  education.current,
                )}
              </p>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMoveUp();
              }}
              disabled={isFirst}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              title="Move up"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMoveDown();
              }}
              disabled={isLast}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              title="Move down"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onToggleExpand}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
              title={isExpanded ? "Collapse" : "Expand"}
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        <div className="mt-2 flex items-center gap-2">
          {education.degree && (
            <span className="text-xs text-green-600">✓ Degree</span>
          )}
          {education.school && (
            <span className="text-xs text-green-600">✓ School</span>
          )}
          {education.startDate && (
            <span className="text-xs text-green-600">✓ Dates</span>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 pt-0 border-t border-gray-100 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Degree <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={education.degree}
                onChange={(e) => onUpdate({ degree: e.target.value })}
                placeholder="e.g., Bachelor of Science in Computer Science"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                School <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={education.school}
                onChange={(e) => onUpdate({ school: e.target.value })}
                placeholder="e.g., Stanford University"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                value={education.location}
                onChange={(e) => onUpdate({ location: e.target.value })}
                placeholder="e.g., Stanford, CA"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                GPA (Optional)
              </label>
              <input
                type="text"
                value={education.gpa}
                onChange={(e) => onUpdate({ gpa: e.target.value })}
                placeholder="e.g., 3.8/4.0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                title="start-date"
                type="month"
                value={education.startDate}
                onChange={(e) => onUpdate({ startDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                title="end-date"
                type="month"
                value={education.endDate}
                onChange={(e) => onUpdate({ endDate: e.target.value })}
                disabled={education.current}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent disabled:bg-gray-50"
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={education.current}
                  onChange={(e) => {
                    onUpdate({
                      current: e.target.checked,
                      endDate: e.target.checked ? "" : education.endDate,
                    });
                  }}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-600"
                />
                <span className="text-sm text-gray-700">
                  Currently studying
                </span>
              </label>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">
                Description / Achievements
              </label>
              {onAIImprove && (
                <button
                  onClick={() =>
                    onAIImprove("description", education.description)
                  }
                  disabled={aiLoading || !education.description}
                  className="flex items-center gap-1 px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition disabled:opacity-50"
                >
                  {aiLoading ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Sparkles className="w-3 h-3" />
                  )}
                  {aiLoading ? "Improving..." : "AI Improve"}
                </button>
              )}
            </div>
            <textarea
              value={education.description}
              onChange={(e) => onUpdate({ description: e.target.value })}
              placeholder="Describe your academic achievements, relevant coursework, or projects..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              {education.description.length} characters • Tip: Focus on
              quantifiable achievements
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Honors & Awards
              </label>
              <button
                onClick={() => setShowHonorInput(!showHonorInput)}
                className="text-xs text-blue-600 hover:text-blue-700"
              >
                {showHonorInput ? "Cancel" : "+ Add"}
              </button>
            </div>

            {education.honors.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {education.honors.map((honor, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
                  >
                    {honor}
                    <button
                      title="remove-honor"
                      onClick={() => onRemoveHonor(honor)}
                      className="hover:text-blue-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {showHonorInput && (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newHonor}
                  onChange={(e) => setNewHonor(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newHonor.trim()) {
                      onAddHonor(newHonor);
                      setNewHonor("");
                      setShowHonorInput(false);
                    }
                  }}
                  placeholder="e.g., Dean's List, Magna Cum Laude"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm"
                />
                <button
                  onClick={() => {
                    if (newHonor.trim()) {
                      onAddHonor(newHonor);
                      setNewHonor("");
                      setShowHonorInput(false);
                    }
                  }}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function GraduationCap(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 14l9-5-9-5-9 5 9 5z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"
      />
    </svg>
  );
}
