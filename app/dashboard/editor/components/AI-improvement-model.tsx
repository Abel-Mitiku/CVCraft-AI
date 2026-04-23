import { X, Check, Copy } from "lucide-react";

interface Props {
  suggestions: string[];
  currentValue: string;
  onSelect: (suggestion: string) => void;
  onClose: () => void;
  fieldLabel?: string;
  isLoading?: boolean;
}

export default function AIImprovementModal({
  suggestions,
  currentValue,
  onSelect,
  onClose,
  fieldLabel = "Current value",
}: Props) {
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                ✨ AI Suggestions
              </h3>
              <p className="text-sm text-gray-600">
                Pick a suggestion or keep your version
              </p>
            </div>
            <button
              title="Close"
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
              {fieldLabel}
            </p>
            <p className="text-sm text-gray-700 bg-white p-3 rounded-lg border border-gray-200 leading-relaxed">
              {currentValue || "No content yet"}
            </p>
          </div>

          <div className="p-6 space-y-4">
            {suggestions && suggestions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No suggestions generated. Try adding more context.</p>
              </div>
            ) : (
              suggestions?.map((suggestion, index) => (
                <div
                  key={index}
                  className="group border border-gray-200 rounded-xl p-4 hover:border-purple-300 hover:shadow-sm transition bg-white"
                >
                  <p className="text-sm text-gray-800 mb-4 leading-relaxed">
                    {suggestion}
                  </p>

                  <div className="flex gap-2">
                    <button
                      onClick={() => onSelect(suggestion)}
                      className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-purple-600 text-white rounded-lg hover:bg-purple-700 active:scale-95 transition"
                    >
                      <Check className="w-4 h-4" />
                      Use This
                    </button>
                    <button
                      onClick={() => copyToClipboard(suggestion)}
                      className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition"
                    >
                      <Copy className="w-4 h-4" />
                      Copy
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              Keep My Version
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
