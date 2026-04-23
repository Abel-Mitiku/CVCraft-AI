import { Crown, Sparkles, Star, Check } from "lucide-react";

interface Props {
  type: "premium" | "new" | "popular" | "ats";
}

export default function TemplateBadge({ type }: Props) {
  const styles = {
    premium: "bg-gradient-to-r from-purple-600 to-blue-600 text-white",
    new: "bg-green-500 text-white",
    popular: "bg-orange-500 text-white",
    ats: "bg-blue-500 text-white",
  };

  const icons = {
    premium: <Crown className="w-3 h-3" />,
    new: <Sparkles className="w-3 h-3" />,
    popular: <Star className="w-3 h-3" />,
    ats: <Check className="w-3 h-3" />,
  };

  const labels = {
    premium: "Premium",
    new: "New",
    popular: "Popular",
    ats: "ATS Optimized",
  };

  return (
    <div
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${styles[type]}`}
    >
      {icons[type]}
      {labels[type]}
    </div>
  );
}
