import { Save, Check, Loader2 } from "lucide-react";

interface Props {
  isSaving: boolean;
  lastSaved: Date | null;
}

export default function AutosaveIndicator({ isSaving, lastSaved }: Props) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="fixed bottom-4 left-4 flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg shadow-sm text-sm">
      {isSaving ? (
        <>
          <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
          <span className="text-gray-700">Saving...</span>
        </>
      ) : lastSaved ? (
        <>
          <Check className="w-4 h-4 text-green-600" />
          <span className="text-gray-600">
            Saved at {formatTime(lastSaved)}
          </span>
        </>
      ) : (
        <>
          <Save className="w-4 h-4 text-gray-400" />
          <span className="text-gray-500">Not saved</span>
        </>
      )}
    </div>
  );
}
