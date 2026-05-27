import {
  MoreVertical,
  Edit,
  Copy,
  Trash2,
  Download,
  Eye,
  EyeOff,
} from "lucide-react";
import { useEffect } from "react";

interface Resume {
  id: string;
  title: string;
  template: string;
  updated_at: string;
  atsScore?: number;
  isPublic: boolean;
  downloads: number;
}

interface Props {
  resume: Resume;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
}

export default function ResumeCard({
  resume,
  onEdit,
  onDelete,
  onDuplicate,
}: Props) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getTemplateBadge = (template: string) => {
    const styles: Record<string, string> = {
      classic: "bg-blue-100 text-blue-700",
      modern: "bg-purple-100 text-purple-700",
      minimal: "bg-gray-100 text-gray-700",
    };
    return styles[template] || "bg-gray-100 text-gray-700";
  };

  return (
    <div className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-blue-300 transition">
      <div className="relative aspect-[3/4] bg-gray-50 flex items-center justify-center overflow-hidden">
        <div className="w-4/5 h-5/6 bg-white shadow-md p-3 transform group-hover:scale-105 transition">
          <div className="h-2 w-3/4 bg-gray-200 rounded mb-2" />
          <div className="h-1 w-full bg-gray-100 rounded mb-1" />
          <div className="h-1 w-5/6 bg-gray-100 rounded" />
          {resume.template === "modern" && (
            <div className="absolute left-0 top-0 bottom-0 w-1/4 bg-slate-800/10" />
          )}
        </div>

        {resume.atsScore !== undefined && (
          <div className="absolute top-3 right-3">
            <div
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                resume.atsScore >= 90
                  ? "bg-green-100 text-green-700"
                  : resume.atsScore >= 75
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-red-100 text-red-700"
              }`}
            >
              {resume.atsScore}% ATS
            </div>
          </div>
        )}

        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
          <button
            onClick={() => onEdit(resume.id)}
            className="p-2 bg-white rounded-full text-gray-700 hover:text-blue-600 hover:scale-110 transition"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            className="p-2 bg-white rounded-full text-gray-700 hover:text-green-600 hover:scale-110 transition"
            title="Download PDF"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDuplicate(resume.id)}
            className="p-2 bg-white rounded-full text-gray-700 hover:text-purple-600 hover:scale-110 transition"
            title="Duplicate"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3
            className="font-semibold text-gray-900 truncate flex-1"
            title={resume.title}
          >
            {resume.title}
          </h3>

          <div className="relative">
            <button
              title="drop-down menu"
              className="p-1 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-gray-600">
          {/* <span
            className={`px-2 py-0.5 rounded text-xs font-medium ${getTemplateBadge(resume.template)}`}
          >
            {resume?.template?.charAt(0).toUpperCase() +
              resume?.template?.slice(1)}
          </span> */}
          <span>•</span>
          <span>Updated {formatDate(resume.updated_at)}</span>
          {resume.downloads > 0 && (
            <>
              <span>•</span>
              <span>
                {resume.downloads} download{resume.downloads !== 1 ? "s" : ""}
              </span>
            </>
          )}
        </div>

        <div className="mt-3 flex items-center gap-2">
          <button
            className={`flex items-center gap-1 text-xs px-2 py-1 rounded transition ${
              resume.isPublic
                ? "bg-green-50 text-green-700 hover:bg-green-100"
                : "bg-gray-50 text-gray-600 hover:bg-gray-100"
            }`}
            title={
              resume.isPublic
                ? "Public: Anyone with link can view"
                : "Private: Only you can view"
            }
          >
            {resume.isPublic ? (
              <>
                <Eye className="w-3 h-3" />
                Public
              </>
            ) : (
              <>
                <EyeOff className="w-3 h-3" />
                Private
              </>
            )}
          </button>

          <button
            onClick={() => onDelete(resume.id)}
            className="ml-auto text-xs text-red-600 hover:text-red-700 hover:underline"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
