import {
  Search,
  Grid3X3,
  List,
  Filter,
  Star,
  ArrowUpDown,
  X,
} from "lucide-react";

interface Props {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  sortBy: "popular" | "rating" | "newest";
  onSortChange: (sort: "popular" | "rating" | "newest") => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  showPremiumOnly: boolean;
  onPremiumToggle: (show: boolean) => void;
  totalResults: number;
}

export default function TemplateHeader({
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
  sortBy,
  onSortChange,
  selectedCategory,
  onCategoryChange,
  showPremiumOnly,
  onPremiumToggle,
  totalResults,
}: Props) {
  const categories = [
    { value: "all", label: "All" },
    { value: "classic", label: "Classic" },
    { value: "modern", label: "Modern" },
    { value: "minimal", label: "Minimal" },
    { value: "creative", label: "Creative" },
    { value: "professional", label: "Professional" },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent transition"
          />
          {searchQuery && (
            <button
              title="Search-query"
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <select
              title="catagory-filter"
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="appearance-none bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm focus:ring-2 focus:ring-purple-600 focus:border-transparent"
            >
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
            <Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          <button
            onClick={() => onPremiumToggle(!showPremiumOnly)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm border transition ${
              showPremiumOnly
                ? "bg-purple-50 border-purple-300 text-purple-700"
                : "bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100"
            }`}
          >
            <Star
              className={`w-4 h-4 ${showPremiumOnly ? "fill-purple-600" : ""}`}
            />
            Premium Only
          </button>

          <div className="relative">
            <select
              title="Sort"
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as any)}
              className="appearance-none bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm focus:ring-2 focus:ring-purple-600 focus:border-transparent"
            >
              <option value="popular">Most Popular</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">Newest</option>
            </select>
            <ArrowUpDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => onViewModeChange("grid")}
              className={`p-2 rounded-md transition ${
                viewMode === "grid"
                  ? "bg-white shadow-sm text-purple-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
              aria-label="Grid view"
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewModeChange("list")}
              className={`p-2 rounded-md transition ${
                viewMode === "list"
                  ? "bg-white shadow-sm text-purple-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
              aria-label="List view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-sm text-gray-600">
          Showing{" "}
          <span className="font-medium text-gray-900">{totalResults}</span>{" "}
          template{totalResults !== 1 ? "s" : ""}
        </p>
      </div>
    </div>
  );
}
