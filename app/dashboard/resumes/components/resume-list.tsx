import {
  Edit,
  Copy,
  Trash2,
  Download,
  Eye,
  EyeOff,
  MoreVertical,
} from "lucide-react";

interface Resume {
  id: string;
  title: string;
  template: string;
  updated_at: string;
  atsScore?: number | null;
  isPublic: boolean;
  downloads: number;
}

interface Props {
  resumes: Resume[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
}

export default function ResumeList({
  resumes,
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

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Resume
            </th>
            <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell">
              Template
            </th>
            <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider hidden lg:table-cell">
              ATS Score
            </th>
            <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Updated
            </th>
            <th className="text-right px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {resumes.map((resume) => (
            <tr key={resume.id} className="hover:bg-gray-50 transition">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-16 bg-gray-100 rounded border border-gray-200 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">{resume.title}</p>
                    <p className="text-sm text-gray-600 md:hidden">
                      {resume?.template?.charAt(0).toUpperCase() +
                        resume.template?.slice(1)}
                    </p>
                  </div>
                </div>
              </td>

              <td className="px-6 py-4 hidden md:table-cell">
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    resume.template === "classic"
                      ? "bg-blue-100 text-blue-700"
                      : resume.template === "modern"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {resume.template?.charAt(0).toUpperCase() +
                    resume.template?.slice(1)}
                </span>
              </td>

              <td className="px-6 py-4 hidden lg:table-cell">
                {resume.atsScore !== null && resume.atsScore !== undefined ? (
                  <span
                    className={`text-sm font-medium ${
                      resume.atsScore >= 90
                        ? "text-green-600"
                        : resume.atsScore >= 75
                          ? "text-yellow-600"
                          : "text-red-600"
                    }`}
                  >
                    {resume.atsScore}%
                  </span>
                ) : (
                  <span className="text-sm text-gray-400">—</span>
                )}
              </td>

              <td className="px-6 py-4 text-sm text-gray-600">
                {formatDate(resume.updated_at)}
              </td>

              <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-1">
                  <button
                    onClick={() => onEdit(resume.id)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDuplicate(resume.id)}
                    className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded transition"
                    title="Duplicate"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(resume.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button
        onClick={() => onEdit("new")}
        className="w-full px-6 py-4 text-left text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 border-t border-gray-100 transition flex items-center gap-2"
      >
        <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-lg">
          +
        </span>
        Create New Resume
      </button>
    </div>
  );
}
