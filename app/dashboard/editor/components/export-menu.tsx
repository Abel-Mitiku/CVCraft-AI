import { Download, Share2, FileText, Printer } from "lucide-react";

interface Props {
  onExportPDF: () => void;
  className?: string;
}

export default function ExportMenu({ onExportPDF, className = "" }: Props) {
  return (
    <div className={`fixed bottom-6 left-6 right-6 lg:hidden ${className}`}>
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
        <p className="text-sm font-medium text-gray-900 mb-3">Export Options</p>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onExportPDF}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
          >
            <Download className="w-4 h-4" />
            PDF
          </button>

          <button className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition">
            <Share2 className="w-4 h-4" />
            Share
          </button>

          <button className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition">
            <FileText className="w-4 h-4" />
            .txt
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
        </div>
      </div>
    </div>
  );
}
