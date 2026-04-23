import Link from "next/link";
export default function StatsCard({ user, stats }: any) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user.user_metadata.name || "Friend"} 👋
          </h1>
          <p className="text-gray-600 mt-1">
            Ready to create your next great resume?
          </p>
        </div>
        <Link
          href="/dashboard/templates"
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition"
        >
          + New Resume
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
        <StatItem
          label="Resumes Created"
          value={stats.totalResumes}
          icon="document"
          trend={stats.weeklyGrowth > 0 ? `+${stats.weeklyGrowth}%` : null}
        />
        <StatItem
          label="Avg. ATS Score"
          value={`${stats.avgAtsScore}%`}
          icon="chart"
          trend={stats.atsImprovement ? `+${stats.atsImprovement}%` : null}
        />
        <StatItem
          label="Downloads"
          value={stats.totalDownloads}
          icon="download"
        />
      </div>
    </div>
  );
}

function StatItem({ label, value, icon, trend, highlight }: any) {
  return (
    <div
      className={`p-4 rounded-lg border ${highlight ? "border-yellow-300 bg-yellow-50" : "border-gray-200"}`}
    >
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
          <span className="text-sm">📊</span>
        </div>
        <span className="text-sm text-gray-600">{label}</span>
      </div>
      <p
        className={`text-2xl font-bold mt-2 ${highlight ? "text-yellow-700" : "text-gray-900"}`}
      >
        {value}
      </p>
      {trend && (
        <p className="text-xs text-green-600 mt-1">{trend} this week</p>
      )}
    </div>
  );
}
