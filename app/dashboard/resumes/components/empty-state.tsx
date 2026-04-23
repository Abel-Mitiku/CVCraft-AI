import { FileText, Plus } from "lucide-react";

interface Props {
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
  illustration?: "resume" | "search";
}

export default function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  illustration = "resume",
}: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
        {illustration === "resume" ? (
          <FileText className="w-10 h-10 text-gray-400" />
        ) : (
          <svg
            className="w-10 h-10 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        )}
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6 max-w-sm mx-auto">{description}</p>

      <button
        onClick={onAction}
        className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-5 py-2.5 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition shadow-sm"
      >
        <Plus className="w-4 h-4" />
        {actionLabel}
      </button>
    </div>
  );
}
