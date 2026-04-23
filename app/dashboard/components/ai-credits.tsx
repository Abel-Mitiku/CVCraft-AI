import Link from "next/link";
export default function AICreditsWidget({ user, credits }: any) {
  const isPro = user.plan === "pro";
  const percentage = isPro
    ? 100
    : Math.min((credits.used / credits.limit) * 100, 100);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">AI Credits</h2>
        {isPro ? (
          <span className="text-sm bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
            ✨ Unlimited
          </span>
        ) : (
          <span className="text-sm text-gray-600">
            {credits.limit - credits.used} left
          </span>
        )}
      </div>

      <div className="relative">
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              percentage > 80
                ? "bg-red-500"
                : percentage > 50
                  ? "bg-yellow-500"
                  : "bg-green-500"
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        {!isPro && (
          <p className="text-xs text-gray-500 mt-2">
            Resets on {credits.resetDate}
          </p>
        )}
      </div>

      <div className="mt-4 space-y-2">
        <p className="text-xs text-gray-600">
          <span className="font-medium">1 credit =</span> 1 AI improvement
          suggestion
        </p>
        <p className="text-xs text-gray-600">
          <span className="font-medium">5 credits =</span> 1 full ATS analysis
        </p>
      </div>

      {!isPro && credits.used >= credits.limit * 0.8 && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-900 font-medium mb-1">
            Running low on credits?
          </p>
          <Link
            href="/dashboard/billing"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Upgrade to Pro for unlimited AI →
          </Link>
        </div>
      )}
    </div>
  );
}
