import { X, Download, Check, Star, Crown } from "lucide-react";
import TemplateBadge from "./template-badge";

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  isPremium: boolean;
  rating: number;
  downloads: number;
  thumbnail: string;
  colors: string[];
  features: string[];
}

interface Props {
  template: Template;
  onClose: () => void;
  onSelect: (id: string) => void;
  isSelected: boolean;
}

export default function TemplatePreview({
  template,
  onClose,
  onSelect,
  isSelected,
}: Props) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
          <button
            title="Close"
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 bg-white/95 backdrop-blur-sm text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition shadow-sm"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="bg-gray-100 p-8 flex items-center justify-center">
              <div className="w-full max-w-md bg-white shadow-2xl aspect-[3/4] p-8">
                <div
                  className="h-6 w-3/4 rounded mb-4"
                  style={{ backgroundColor: template.colors[0] }}
                />
                <div className="space-y-2">
                  <div className="h-2 w-full bg-gray-100 rounded" />
                  <div className="h-2 w-5/6 bg-gray-100 rounded" />
                  <div className="h-2 w-4/6 bg-gray-100 rounded" />
                  <div className="h-2 w-full bg-gray-100 rounded" />
                  <div className="h-2 w-3/4 bg-gray-100 rounded" />
                </div>

                {template.category === "modern" && (
                  <div
                    className="absolute left-0 top-0 bottom-0 w-1/4"
                    style={{ backgroundColor: template.colors[0] + "20" }}
                  />
                )}
              </div>
            </div>

            <div className="p-8">
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {template.name}
                  </h2>
                  {template.isPremium && <TemplateBadge type="premium" />}
                </div>
                <p className="text-gray-600">{template.description}</p>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-bold text-gray-900">
                      {template.rating}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">Rating</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="font-bold text-gray-900 mb-1">
                    {template.downloads >= 1000
                      ? (template.downloads / 1000).toFixed(1) + "k"
                      : template.downloads}
                  </p>
                  <p className="text-xs text-gray-600">Downloads</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="font-bold text-gray-900 mb-1 capitalize">
                    {template.category}
                  </p>
                  <p className="text-xs text-gray-600">Category</p>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Features</h3>
                <div className="space-y-2">
                  {template.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">
                  Color Scheme
                </h3>
                <div className="flex gap-2">
                  {template.colors.map((color, i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-lg border border-gray-200 shadow-sm"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => onSelect(template.id)}
                  className={`w-full py-3 rounded-lg font-medium transition ${
                    isSelected
                      ? "bg-green-600 text-white"
                      : "bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700"
                  }`}
                >
                  {isSelected ? "✓ Template Selected" : "Use This Template"}
                </button>

                {template.isPremium && (
                  <p className="text-xs text-center text-gray-600">
                    Requires Pro plan •{" "}
                    <a
                      href="/dashboard/billing"
                      className="text-purple-600 hover:underline"
                    >
                      Upgrade now
                    </a>
                  </p>
                )}

                <button className="w-full py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition">
                  Download Preview
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
