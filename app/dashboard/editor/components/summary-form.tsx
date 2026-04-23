"use client";

import { Sparkles, Loader2 } from "lucide-react";

interface Props {
  value: string;
  onChange: (value: string) => void;
  onAIImprove?: (context?: any) => void;
  isLoading?: boolean;
}

export default function SummaryForm({
  value,
  onChange,
  onAIImprove,
  isLoading = false,
}: Props) {
  const handleAIImprove = () => {
    if (!onAIImprove || isLoading) return;
    onAIImprove({
      currentSummary: value,
      field: "professional_summary",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Professional Summary
          </h2>
          <p className="text-sm text-gray-600">
            A brief overview of your experience and career goals
          </p>
        </div>
        <button
          onClick={handleAIImprove}
          disabled={isLoading}
          className="flex items-center gap-2 px-3 py-1.5 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition disabled:opacity-50"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          {isLoading ? "Generating..." : "AI Improve"}
        </button>
      </div>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Experienced software engineer with 5+ years building scalable web applications..."
        rows={6}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition resize-none"
      />

      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>{value.length} characters</span>
        <span
          className={value.length < 100 ? "text-orange-500" : "text-green-500"}
        >
          {value.length < 100 ? "Add more detail" : "Good length"}
        </span>
      </div>
    </div>
  );
}
