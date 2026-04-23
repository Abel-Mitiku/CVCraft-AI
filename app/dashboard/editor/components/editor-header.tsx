import { Download, Eye, EyeOff, Undo, Redo } from "lucide-react";

interface Props {
  resumeTitle: string;
  isSaving: boolean;
  lastSaved: Date | null;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onExportPDF: () => void;
  onTogglePreview: () => void;
  showPreview: boolean;
  isExporting?: boolean;
}

export default function EditorHeader({
  resumeTitle,
  isSaving,
  lastSaved,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onExportPDF,
  onTogglePreview,
  showPreview,
  isExporting = false,
}: Props) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="font-semibold text-gray-900 truncate max-w-xs">
            {resumeTitle || "Untitled Resume"}
          </h1>

          <div className="flex items-center gap-2 text-sm text-gray-500">
            {isSaving ? (
              <>
                <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : lastSaved ? (
              <span>Saved at {formatTime(lastSaved)}</span>
            ) : (
              <span>Not saved</span>
            )}
          </div>
        </div>

        <div className="hidden md:flex items-center gap-1">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
            title="Undo"
          >
            <Undo className="w-4 h-4" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
            title="Redo"
          >
            <Redo className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onTogglePreview}
            className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
            title={showPreview ? "Hide preview" : "Show preview"}
          >
            {showPreview ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>

          <button
            onClick={onExportPDF}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition shadow-sm disabled:opacity-70 disabled:cursor-not-allowed disabled:pointer-events-none"
          >
            {isExporting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span className="hidden sm:inline">Exporting...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export PDF</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
