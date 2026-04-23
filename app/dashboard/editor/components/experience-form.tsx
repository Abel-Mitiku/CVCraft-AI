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

interface Experience {
  id: string;
  role: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
  achievements: string[];
}

interface Props {
  items: Experience[];
  onChange: (items: Experience[]) => void;
  onAIImprove?: (
    text: string,
    context: { field: string; entry: Experience },
  ) => void;
  isLoading?: boolean;
}

export default function ExperienceForm({
  items,
  onChange,
  onAIImprove,
  isLoading = false,
}: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const addExperience = () => {
    const newEntry: Experience = {
      id: crypto.randomUUID(),
      role: "",
      company: "",
      location: "",
      startDate: "",
      endDate: "",
      current: false,
      description: "",
      achievements: [],
    };
    onChange([...items, newEntry]);
    setExpandedId(newEntry.id);
  };

  const updateExperience = (id: string, updates: Partial<Experience>) => {
    onChange(
      items.map((item) => (item.id === id ? { ...item, ...updates } : item)),
    );
  };

  const deleteExperience = (id: string) => {
    if (confirm("Delete this experience entry?")) {
      onChange(items.filter((item) => item.id !== id));
      if (expandedId === id) setExpandedId(null);
    }
  };

  const moveExperience = (index: number, direction: "up" | "down") => {
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
    field: "description" | "achievement",
    currentValue: string,
  ) => {
    if (!onAIImprove || isLoading) return;

    const entry = items.find((e) => e.id === id);
    if (!entry) return;

    onAIImprove(currentValue, { field, entry });
  };

  const addAchievement = (experienceId: string, achievement: string) => {
    const entry = items.find((e) => e.id === experienceId);
    if (!entry || !achievement.trim()) return;

    updateExperience(experienceId, {
      achievements: [...entry.achievements, achievement.trim()],
    });
  };

  const removeAchievement = (
    experienceId: string,
    achievementToRemove: string,
  ) => {
    const entry = items.find((e) => e.id === experienceId);
    if (!entry) return;

    updateExperience(experienceId, {
      achievements: entry.achievements.filter((a) => a !== achievementToRemove),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Work Experience
          </h2>
          <p className="text-sm text-gray-600">
            Add your professional roles, responsibilities, and achievements
          </p>
        </div>
        <button
          onClick={addExperience}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
        >
          <Plus className="w-4 h-4" />
          Add Experience
        </button>
      </div>

      {items.length === 0 && (
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
          <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 mb-4">No work experience entries yet</p>
          <button
            onClick={addExperience}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            + Add your first role
          </button>
        </div>
      )}

      <div className="space-y-4">
        {items.map((experience, index) => (
          <ExperienceEntry
            key={experience.id}
            experience={experience}
            index={index}
            isExpanded={expandedId === experience.id}
            isLast={index === items.length - 1}
            isFirst={index === 0}
            aiLoading={isLoading}
            onToggleExpand={() =>
              setExpandedId(expandedId === experience.id ? null : experience.id)
            }
            onUpdate={(updates) => updateExperience(experience.id, updates)}
            onDelete={() => deleteExperience(experience.id)}
            onMoveUp={() => moveExperience(index, "up")}
            onMoveDown={() => moveExperience(index, "down")}
            onAIImprove={(field, value) =>
              handleAIImprove(experience.id, field, value)
            }
            onAddAchievement={(achievement) =>
              addAchievement(experience.id, achievement)
            }
            onRemoveAchievement={(achievement) =>
              removeAchievement(experience.id, achievement)
            }
          />
        ))}
      </div>
    </div>
  );
}

function ExperienceEntry({
  experience,
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
  onAddAchievement,
  onRemoveAchievement,
}: {
  experience: Experience;
  index: number;
  isExpanded: boolean;
  isLast: boolean;
  isFirst: boolean;
  aiLoading: boolean;
  onToggleExpand: () => void;
  onUpdate: (updates: Partial<Experience>) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onAIImprove: (field: "description" | "achievement", value: string) => void;
  onAddAchievement: (achievement: string) => void;
  onRemoveAchievement: (achievement: string) => void;
}) {
  const [newAchievement, setNewAchievement] = useState("");
  const [showAchievementInput, setShowAchievementInput] = useState(false);

  const formatDisplayDate = (start: string, end: string, current: boolean) => {
    if (!start) return "";
    const startDate = new Date(start).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
    const endDate = current
      ? "Present"
      : end
        ? new Date(end).toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
          })
        : "";
    return `${startDate} – ${endDate}`;
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
              {experience.role && (
                <h3 className="font-medium text-gray-900 truncate">
                  {experience.role}
                </h3>
              )}
            </div>
            <p className="text-sm text-gray-600">
              {experience.company || "Company name"}
              {experience.location && ` • ${experience.location}`}
            </p>
            {experience.startDate && (
              <p className="text-xs text-gray-500 mt-1">
                {formatDisplayDate(
                  experience.startDate,
                  experience.endDate,
                  experience.current,
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
          {experience.role && (
            <span className="text-xs text-green-600">✓ Role</span>
          )}
          {experience.company && (
            <span className="text-xs text-green-600">✓ Company</span>
          )}
          {experience.startDate && (
            <span className="text-xs text-green-600">✓ Dates</span>
          )}
          {experience.achievements.length > 0 && (
            <span className="text-xs text-green-600">
              ✓ {experience.achievements.length} achievement
              {experience.achievements.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 pt-0 border-t border-gray-100 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={experience.role}
                onChange={(e) => onUpdate({ role: e.target.value })}
                placeholder="e.g., Senior Software Engineer"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={experience.company}
                onChange={(e) => onUpdate({ company: e.target.value })}
                placeholder="e.g., Google, Inc."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              value={experience.location}
              onChange={(e) => onUpdate({ location: e.target.value })}
              placeholder="e.g., San Francisco, CA (or Remote)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                title="start-date"
                type="month"
                value={experience.startDate}
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
                value={experience.endDate}
                onChange={(e) => onUpdate({ endDate: e.target.value })}
                disabled={experience.current}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent disabled:bg-gray-50"
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={experience.current}
                  onChange={(e) => {
                    onUpdate({
                      current: e.target.checked,
                      endDate: e.target.checked ? "" : experience.endDate,
                    });
                  }}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-600"
                />
                <span className="text-sm text-gray-700">Current role</span>
              </label>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">
                Role Overview
              </label>
              {onAIImprove && (
                <button
                  onClick={() =>
                    onAIImprove("description", experience.description)
                  }
                  disabled={aiLoading || !experience.description}
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
              value={experience.description}
              onChange={(e) => onUpdate({ description: e.target.value })}
              placeholder="Briefly describe your role, team, and key responsibilities..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              {experience.description.length} characters • Tip: Start with
              action verbs
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Key Achievements
              </label>
              <button
                onClick={() => setShowAchievementInput(!showAchievementInput)}
                className="text-xs text-blue-600 hover:text-blue-700"
              >
                {showAchievementInput ? "Cancel" : "+ Add"}
              </button>
            </div>

            {experience.achievements.length > 0 && (
              <div className="space-y-2 mb-3">
                {experience.achievements.map((achievement, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg group"
                  >
                    <span className="text-blue-600 mt-1">•</span>
                    <p className="text-sm text-gray-800 flex-1">
                      {achievement}
                    </p>
                    <button
                      onClick={() => onRemoveAchievement(achievement)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-600 transition"
                      title="Remove"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {showAchievementInput && (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <textarea
                    value={newAchievement}
                    onChange={(e) => setNewAchievement(e.target.value)}
                    placeholder="e.g., Increased user engagement by 40% through A/B testing..."
                    rows={2}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm resize-none"
                  />
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => {
                        if (newAchievement.trim()) {
                          onAddAchievement(newAchievement);
                          setNewAchievement("");
                          setShowAchievementInput(false);
                        }
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 whitespace-nowrap"
                    >
                      Add
                    </button>
                    {onAIImprove && (
                      <button
                        onClick={() =>
                          onAIImprove("achievement", newAchievement)
                        }
                        disabled={aiLoading || !newAchievement}
                        className="flex items-center gap-1 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg text-sm hover:bg-purple-200 transition disabled:opacity-50 whitespace-nowrap"
                      >
                        {aiLoading ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Sparkles className="w-3 h-3" />
                        )}
                        AI
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  Tip: Use the STAR method (Situation, Task, Action, Result) and
                  include metrics
                </p>
              </div>
            )}

            {experience.achievements.length === 0 && !showAchievementInput && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs text-blue-800">
                  <strong>Pro tip:</strong> Add 3-5 quantifiable achievements.
                  Example: "Reduced page load time by 60% by implementing code
                  splitting"
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Briefcase(props: React.SVGProps<SVGSVGElement>) {
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
        d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    </svg>
  );
}
