"use client";

import { useState, useCallback } from "react";
import {
  Plus,
  Trash2,
  Sparkles,
  Loader2,
  X,
  GripVertical,
  CheckCircle,
} from "lucide-react";

interface Skills {
  technical: string[];
  soft: string[];
  languages: string[];
  certifications?: string[];
  tools?: string[];
}

interface Props {
  skills: Skills;
  onChange: (skills: Skills) => void;
  onAIImprove?: (category: keyof Skills, currentSkills: string[]) => void;
  isLoading?: boolean;
}

const SKILL_SUGGESTIONS: Record<string, string[]> = {
  technical: [
    "JavaScript",
    "TypeScript",
    "Python",
    "Java",
    "C++",
    "React",
    "Vue",
    "Angular",
    "Node.js",
    "Express",
    "Django",
    "Flask",
    "PostgreSQL",
    "MongoDB",
    "Redis",
    "Docker",
    "Kubernetes",
    "AWS",
    "Azure",
    "GCP",
    "Git",
    "CI/CD",
    "REST API",
    "GraphQL",
    "HTML5",
    "CSS3",
    "Tailwind CSS",
    "SASS",
    "Webpack",
    "Vite",
    "Next.js",
    "Nuxt.js",
    "React Native",
    "Flutter",
    "Swift",
    "Kotlin",
    "Machine Learning",
    "TensorFlow",
    "PyTorch",
    "Data Analysis",
    "SQL",
  ],
  soft: [
    "Communication",
    "Leadership",
    "Teamwork",
    "Problem Solving",
    "Critical Thinking",
    "Time Management",
    "Adaptability",
    "Creativity",
    "Emotional Intelligence",
    "Conflict Resolution",
    "Negotiation",
    "Public Speaking",
    "Mentoring",
    "Project Management",
    "Agile",
    "Scrum",
    "Decision Making",
    "Attention to Detail",
  ],
  languages: [
    "English",
    "Spanish",
    "French",
    "German",
    "Mandarin",
    "Japanese",
    "Korean",
    "Portuguese",
    "Italian",
    "Russian",
    "Arabic",
    "Hindi",
    "Dutch",
    "Swedish",
  ],
  tools: [
    "VS Code",
    "IntelliJ",
    "Figma",
    "Sketch",
    "Adobe Photoshop",
    "Jira",
    "Confluence",
    "Slack",
    "Notion",
    "Trello",
    "Asana",
    "GitHub",
    "GitLab",
    "Bitbucket",
  ],
};

export default function SkillsForm({
  skills,
  onChange,
  onAIImprove,
  isLoading,
}: Props) {
  const [activeCategory, setActiveCategory] =
    useState<keyof Skills>("technical");
  const [aiLoadingCategory, setAiLoadingCategory] = useState<
    keyof Skills | null
  >(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const addSkill = useCallback(
    (category: keyof Skills, skill: string) => {
      const trimmedSkill = skill.trim();
      if (!trimmedSkill) return;

      const exists = skills[category]?.some(
        (s) => s.toLowerCase() === trimmedSkill.toLowerCase(),
      );

      if (exists) return;

      onChange({
        ...skills,
        [category]: [...(skills[category] || []), trimmedSkill],
      });
    },
    [skills, onChange],
  );

  const removeSkill = useCallback(
    (category: keyof Skills, skillToRemove: string) => {
      onChange({
        ...skills,
        [category]: skills[category]?.filter((s) => s !== skillToRemove) || [],
      });
    },
    [skills, onChange],
  );

  const moveSkill = useCallback(
    (category: keyof Skills, index: number, direction: "up" | "down") => {
      const skillList = skills[category] || [];
      const newIndex = direction === "up" ? index - 1 : index + 1;

      if (newIndex < 0 || newIndex >= skillList.length) return;

      const newSkills = [...skillList];
      [newSkills[index], newSkills[newIndex]] = [
        newSkills[newIndex],
        newSkills[index],
      ];

      onChange({
        ...skills,
        [category]: newSkills,
      });
    },
    [skills, onChange],
  );

  const handleAIImprove = async (category: keyof Skills) => {
    if (!onAIImprove || isLoading) return;
    if (aiLoadingCategory) return;

    setAiLoadingCategory(category);
    try {
      onAIImprove(category, skills[category] || []);
    } catch (error) {
      console.error("AI improve failed:", error);
      alert("Failed to generate suggestions. Please try again.");
    } finally {
      setAiLoadingCategory(null);
    }
  };

  const filteredSuggestions =
    SKILL_SUGGESTIONS[activeCategory]?.filter(
      (skill) =>
        skill.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !skills[activeCategory]?.some(
          (s) => s.toLowerCase() === skill.toLowerCase(),
        ),
    ) || [];

  const categories: Array<{
    key: keyof Skills;
    label: string;
    icon: string;
    color: string;
    description: string;
  }> = [
    {
      key: "technical",
      label: "Technical Skills",
      icon: "💻",
      color: "blue",
      description: "Programming languages, frameworks, and technologies",
    },
    {
      key: "soft",
      label: "Soft Skills",
      icon: "🤝",
      color: "green",
      description: "Interpersonal and communication abilities",
    },
    {
      key: "languages",
      label: "Languages",
      icon: "🌍",
      color: "purple",
      description: "Spoken and written languages",
    },
    {
      key: "tools",
      label: "Tools & Software",
      icon: "🛠️",
      color: "orange",
      description: "Development tools and applications",
    },
  ];

  const totalSkills = Object.values(skills).reduce(
    (acc, arr) => acc + (arr?.length || 0),
    0,
  );
  const completionPercentage = Math.min((totalSkills / 15) * 100, 100);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Skills</h2>
          <p className="text-sm text-gray-600">
            Showcase your technical expertise and soft skills
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-gray-900">
            {totalSkills} skills
          </p>
          <p className="text-xs text-gray-500">
            {completionPercentage >= 100
              ? "✓ Complete"
              : `${Math.round(completionPercentage)}% complete`}
          </p>
        </div>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all ${
            completionPercentage >= 100
              ? "bg-green-500"
              : completionPercentage >= 60
                ? "bg-blue-500"
                : "bg-orange-500"
          }`}
          style={{ width: `${completionPercentage}%` }}
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((category) => {
          const isActive = activeCategory === category.key;
          const count = skills[category.key]?.length || 0;

          return (
            <button
              key={category.key}
              onClick={() => {
                setActiveCategory(category.key);
                setSearchQuery("");
                setShowSuggestions(false);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm whitespace-nowrap transition ${
                isActive
                  ? `bg-${category.color}-100 text-${category.color}-700 border-2 border-${category.color}-300`
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 border-2 border-transparent"
              }`}
            >
              <span>{category.icon}</span>
              <span>{category.label}</span>
              {count > 0 && (
                <span
                  className={`px-2 py-0.5 rounded-full text-xs ${
                    isActive
                      ? `bg-${category.color}-200 text-${category.color}-800`
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-900">
              {categories.find((c) => c.key === activeCategory)?.label}
            </h3>
            <p className="text-sm text-gray-600">
              {categories.find((c) => c.key === activeCategory)?.description}
            </p>
          </div>
          {onAIImprove && (
            <button
              onClick={() => handleAIImprove(activeCategory)}
              disabled={isLoading}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              {isLoading ? "Generating..." : "AI Suggest"}
            </button>
          )}
        </div>

        <div className="relative">
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && searchQuery.trim()) {
                  addSkill(activeCategory, searchQuery);
                  setSearchQuery("");
                  setShowSuggestions(false);
                }
              }}
              placeholder={`Add a ${activeCategory === "technical" ? "technical" : activeCategory} skill...`}
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
            <button
              title="search-button"
              onClick={() => {
                if (searchQuery.trim()) {
                  addSkill(activeCategory, searchQuery);
                  setSearchQuery("");
                }
              }}
              disabled={!searchQuery.trim()}
              className="px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {showSuggestions && filteredSuggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              <div className="p-2">
                <p className="text-xs text-gray-500 px-2 py-1">
                  Suggested skills:
                </p>
                {filteredSuggestions.slice(0, 10).map((skill) => (
                  <button
                    key={skill}
                    onClick={() => {
                      addSkill(activeCategory, skill);
                      setSearchQuery("");
                      setShowSuggestions(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-md transition flex items-center justify-between"
                  >
                    <span>{skill}</span>
                    <Plus className="w-3 h-3 text-gray-400" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {(skills[activeCategory]?.length ?? 0) > 0 ? (
          <div className="flex flex-wrap gap-2">
            {skills[activeCategory]?.map((skill, index) => (
              <SkillTag
                key={skill}
                skill={skill}
                index={index}
                total={skills[activeCategory]?.length || 0}
                color={
                  categories.find((c) => c.key === activeCategory)?.color ||
                  "blue"
                }
                onRemove={() => removeSkill(activeCategory, skill)}
                onMoveUp={() => moveSkill(activeCategory, index, "up")}
                onMoveDown={() => moveSkill(activeCategory, index, "down")}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">
                {categories.find((c) => c.key === activeCategory)?.icon}
              </span>
            </div>
            <p className="text-gray-600 mb-2">
              No {activeCategory} skills added yet
            </p>
            <p className="text-sm text-gray-500">
              Start typing above or use AI suggestions to get started
            </p>
          </div>
        )}

        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>Pro tip:</strong> For{" "}
            {activeCategory === "technical"
              ? "technical skills"
              : activeCategory === "soft"
                ? "soft skills"
                : "this category"}
            ,
            {activeCategory === "technical"
              ? " list specific technologies you've used professionally. Avoid rating systems (e.g., '90% JavaScript')."
              : activeCategory === "soft"
                ? " focus on skills demonstrated through real work experiences."
                : " include proficiency level if relevant (e.g., 'Spanish (Fluent)')."}
          </p>
        </div>
      </div>

      {totalSkills > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="font-medium text-gray-900 mb-4">
            All Skills Overview
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map((category) => {
              const categorySkills = skills[category.key] || [];
              if (categorySkills.length === 0) return null;

              return (
                <div key={category.key} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span>{category.icon}</span>
                    <h4 className="text-sm font-medium text-gray-700">
                      {category.label}
                    </h4>
                    <span className="text-xs text-gray-500">
                      ({categorySkills.length})
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {categorySkills.slice(0, 8).map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                      >
                        {skill}
                      </span>
                    ))}
                    {categorySkills.length > 8 && (
                      <span className="px-2 py-1 text-xs text-gray-500">
                        +{categorySkills.length - 8} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function SkillTag({
  skill,
  index,
  total,
  color,
  onRemove,
  onMoveUp,
  onMoveDown,
}: {
  skill: string;
  index: number;
  total: number;
  color: string;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  return (
    <div className="group inline-flex items-center gap-1 pl-3 pr-1 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full transition border border-gray-200">
      <span className="text-sm text-gray-800">{skill}</span>

      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition">
        <button
          onClick={onMoveUp}
          disabled={index === 0}
          className="p-0.5 text-gray-400 hover:text-gray-600 hover:bg-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          title="Move up"
        >
          <GripVertical className="w-3 h-3 rotate-90" />
        </button>
        <button
          onClick={onMoveDown}
          disabled={index === total - 1}
          className="p-0.5 text-gray-400 hover:text-gray-600 hover:bg-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          title="Move down"
        >
          <GripVertical className="w-3 h-3 -rotate-90" />
        </button>
        <button
          onClick={onRemove}
          className="p-0.5 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded"
          title="Remove"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
