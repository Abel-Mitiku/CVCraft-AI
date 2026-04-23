interface Props {
  viewMode: "grid" | "list";
}

export default function LoadingSkeleton({ viewMode }: Props) {
  if (viewMode === "grid") {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 h-10 bg-gray-200 rounded-lg max-w-md" />
            <div className="flex gap-3">
              <div className="w-32 h-10 bg-gray-200 rounded-lg" />
              <div className="w-32 h-10 bg-gray-200 rounded-lg" />
              <div className="w-20 h-10 bg-gray-200 rounded-lg" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse"
            >
              <div className="aspect-[3/4] bg-gray-200" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="flex gap-2">
                  <div className="h-5 bg-gray-200 rounded w-16" />
                  <div className="h-5 bg-gray-200 rounded w-20" />
                </div>
                <div className="h-3 bg-gray-200 rounded w-24" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 h-10 bg-gray-200 rounded-lg max-w-md" />
          <div className="flex gap-3">
            <div className="w-32 h-10 bg-gray-200 rounded-lg" />
            <div className="w-32 h-10 bg-gray-200 rounded-lg" />
            <div className="w-20 h-10 bg-gray-200 rounded-lg" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
        <div className="p-4 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-12 h-16 bg-gray-200 rounded" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
              <div className="h-4 bg-gray-200 rounded w-16 hidden md:block" />
              <div className="h-4 bg-gray-200 rounded w-20 hidden lg:block" />
              <div className="h-4 bg-gray-200 rounded w-24" />
              <div className="flex gap-1">
                <div className="w-8 h-8 bg-gray-200 rounded" />
                <div className="w-8 h-8 bg-gray-200 rounded" />
                <div className="w-8 h-8 bg-gray-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
