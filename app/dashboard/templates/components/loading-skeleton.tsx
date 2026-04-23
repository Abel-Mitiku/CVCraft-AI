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
              <div className="w-32 h-10 bg-gray-200 rounded-lg" />
              <div className="w-20 h-10 bg-gray-200 rounded-lg" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 animate-pulse">
          <div className="h-6 w-48 bg-white/20 rounded mb-2" />
          <div className="h-4 w-96 bg-white/20 rounded" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse"
            >
              <div className="aspect-[3/4] bg-gray-200" />
              <div className="p-4 space-y-3">
                <div className="h-5 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="flex gap-1">
                  <div className="h-5 bg-gray-200 rounded w-16" />
                  <div className="h-5 bg-gray-200 rounded w-16" />
                  <div className="h-5 bg-gray-200 rounded w-16" />
                </div>
                <div className="flex justify-between">
                  <div className="h-4 bg-gray-200 rounded w-12" />
                  <div className="h-4 bg-gray-200 rounded w-16" />
                </div>
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
            <div className="w-32 h-10 bg-gray-200 rounded-lg" />
            <div className="w-20 h-10 bg-gray-200 rounded-lg" />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse"
          >
            <div className="flex flex-col md:flex-row">
              <div className="md:w-48 h-48 md:h-auto bg-gray-200" />
              <div className="flex-1 p-6 space-y-4">
                <div className="h-6 bg-gray-200 rounded w-1/2" />
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="flex gap-2">
                  <div className="h-6 bg-gray-200 rounded w-20" />
                  <div className="h-6 bg-gray-200 rounded w-20" />
                  <div className="h-6 bg-gray-200 rounded w-20" />
                </div>
                <div className="flex gap-4">
                  <div className="h-4 bg-gray-200 rounded w-16" />
                  <div className="h-4 bg-gray-200 rounded w-24" />
                  <div className="h-4 bg-gray-200 rounded w-20" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
