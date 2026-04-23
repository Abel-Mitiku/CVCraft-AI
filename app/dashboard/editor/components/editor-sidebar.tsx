import {
  User,
  FileText,
  Briefcase,
  GraduationCap,
  Sparkles,
  CheckCircle,
} from "lucide-react";

interface Props {
  activeSection: string;
  onSectionChange: (section: string) => void;
  completionStatus: Record<string, boolean>;
}

const sections = [
  { id: "personal", label: "Personal Info", icon: User },
  { id: "summary", label: "Professional Summary", icon: FileText },
  { id: "experience", label: "Work Experience", icon: Briefcase },
  { id: "education", label: "Education", icon: GraduationCap },
  { id: "skills", label: "Skills", icon: Sparkles },
];

export default function EditorSidebar({
  activeSection,
  onSectionChange,
  completionStatus,
}: Props) {
  return (
    <nav className="flex gap-2 overflow-x-auto pb-2 lg:pb-0 lg:overflow-visible">
      {sections.map((section) => {
        const Icon = section.icon;
        const isActive = activeSection === section.id;
        const isComplete = completionStatus[section.id];

        return (
          <button
            key={section.id}
            onClick={() => onSectionChange(section.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm whitespace-nowrap transition ${
              isActive
                ? "bg-blue-100 text-blue-700"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{section.label}</span>
            {isComplete && (
              <CheckCircle className="w-4 h-4 text-green-500 ml-1" />
            )}
          </button>
        );
      })}
    </nav>
  );
}
