import TemplateCard from "./template-card";

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
  templates: Template[];
  onSelect: (id: string) => void;
  onPreview: (template: Template) => void;
  selectedTemplate: string | null;
}

export default function TemplateGrid({
  templates,
  onSelect,
  onPreview,
  selectedTemplate,
}: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {templates.map((template) => (
        <TemplateCard
          key={template.id}
          template={template}
          onSelect={onSelect}
          onPreview={onPreview}
          isSelected={selectedTemplate === template.id}
        />
      ))}
    </div>
  );
}
