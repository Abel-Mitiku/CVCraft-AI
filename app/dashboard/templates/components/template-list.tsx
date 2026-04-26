import { Star, Eye, Check, Crown } from "lucide-react";
import TemplateBadge from "./template-badge";
import { Template } from "../types/template";

interface Props {
  templates: Template[];
  onSelect: (id: string) => void;
  onPreview: (template: Template) => void;
  selectedTemplate: string | null;
}

export default function TemplateList({
  templates,
  onSelect,
  onPreview,
  selectedTemplate,
}: Props) {
  const formatDownloads = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "k";
    }
    return num.toString();
  };

  return (
    <div className="space-y-4">
      {templates.map((template) => (
        <div
          key={template.id}
          className={`bg-white rounded-xl border-2 overflow-hidden transition-all ${
            selectedTemplate === template.id
              ? "border-purple-600 shadow-lg shadow-purple-100"
              : "border-gray-200 hover:border-purple-300"
          }`}
        >
          <div className="flex flex-col md:flex-row">
            <div className="md:w-48 h-48 md:h-auto bg-gray-50 flex items-center justify-center flex-shrink-0">
              <div className="w-32 h-40 bg-white shadow-md p-3">
                <div
                  className="h-2 w-3/4 rounded mb-1"
                  style={{ backgroundColor: template.colors[0] }}
                />
                <div className="h-1 w-full bg-gray-100 rounded mb-0.5" />
                <div className="h-1 w-5/6 bg-gray-100 rounded" />
              </div>
            </div>

            <div className="flex-1 p-4 md:p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-lg text-gray-900">
                      {template.name}
                    </h3>
                    {template.isPremium && <TemplateBadge type="premium" />}
                  </div>
                  <p className="text-gray-600 mb-3">{template.description}</p>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {template.features.map((feature, i) => (
                      <span
                        key={i}
                        className="text-sm bg-gray-100 text-gray-700 px-2 py-1 rounded"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium text-gray-900">
                        {template.rating}
                      </span>
                    </div>
                    <span>{formatDownloads(template.downloads)} downloads</span>
                    <span className="capitalize">{template.category}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => onPreview(template)}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                  >
                    <Eye className="w-4 h-4" />
                    Preview
                  </button>
                  <button
                    onClick={() => onSelect(template.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
                      selectedTemplate === template.id
                        ? "bg-purple-600 text-white"
                        : "bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700"
                    }`}
                  >
                    {selectedTemplate === template.id ? (
                      <>
                        <Check className="w-4 h-4" />
                        Selected
                      </>
                    ) : (
                      "Use Template"
                    )}
                  </button>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <span className="text-sm text-gray-500">Colors:</span>
                {template.colors.map((color, i) => (
                  <div
                    key={i}
                    className="w-6 h-6 rounded-full border border-gray-200"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
