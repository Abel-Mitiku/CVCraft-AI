import { Star, Eye, Check, Crown } from "lucide-react";
import TemplateBadge from "./template-badge";
import { Template } from "../types/template";

interface Props {
  template: Template;
  onSelect: (id: string) => void;
  onPreview: (template: Template) => void;
  isSelected: boolean;
}

export default function TemplateCard({
  template,
  onSelect,
  onPreview,
  isSelected,
}: Props) {
  const formatDownloads = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "k";
    }
    return num.toString();
  };

  return (
    <div
      className={`group bg-white rounded-xl border-2 overflow-hidden transition-all ${
        isSelected
          ? "border-purple-600 shadow-lg shadow-purple-100"
          : "border-gray-200 hover:border-purple-300 hover:shadow-lg"
      }`}
    >
      <div className="relative aspect-[3/4] bg-gray-50 overflow-hidden">
        <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
          <div className="w-4/5 h-5/6 bg-white shadow-lg p-4 transform group-hover:scale-105 transition">
            <div
              className="h-3 w-3/4 rounded mb-2"
              style={{ backgroundColor: template.colors[0] }}
            />
            <div className="h-1 w-full bg-gray-100 rounded mb-1" />
            <div className="h-1 w-5/6 bg-gray-100 rounded mb-1" />
            <div className="h-1 w-2/3 bg-gray-100 rounded" />

            {template.category === "modern" && (
              <div
                className="absolute left-0 top-0 bottom-0 w-1/4"
                style={{ backgroundColor: template.colors[0] + "20" }}
              />
            )}
            {template.category === "creative" && (
              <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400" />
            )}
          </div>
        </div>

        {template.isPremium && (
          <div className="absolute top-3 left-3">
            <TemplateBadge type="premium" />
          </div>
        )}

        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-full shadow-sm">
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span className="text-xs font-medium text-gray-900">
              {template.rating}
            </span>
          </div>
        </div>

        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
          <button
            onClick={() => onPreview(template)}
            className="p-2 bg-white rounded-full text-gray-700 hover:text-purple-600 hover:scale-110 transition"
            title="Preview"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => onSelect(template.id)}
            className={`px-4 py-2 rounded-full font-medium text-sm transition ${
              isSelected
                ? "bg-purple-600 text-white"
                : "bg-white text-purple-600 hover:bg-purple-600 hover:text-white"
            }`}
          >
            {isSelected ? "✓ Selected" : "Use Template"}
          </button>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-1">{template.name}</h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {template.description}
        </p>

        <div className="flex flex-wrap gap-1 mb-3">
          {template.features.slice(0, 3).map((feature, i) => (
            <span
              key={i}
              className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded"
            >
              {feature}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span>{template.rating}</span>
          </div>
          <span>{formatDownloads(template.downloads)} downloads</span>
        </div>

        <div className="mt-3 flex items-center gap-1">
          <span className="text-xs text-gray-500 mr-1">Colors:</span>
          {template.colors.map((color, i) => (
            <div
              key={i}
              className="w-4 h-4 rounded-full border border-gray-200"
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
