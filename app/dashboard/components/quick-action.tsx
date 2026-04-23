import Link from "next/link";
export default function QuickActions(user: any) {
  const actions = [
    {
      name: "Create from Scratch",
      description: "Start with a blank template",
      icon: "plus",
      href: "/dashboard/templates",
      color: "blue",
    },
    {
      name: "AI Resume Review",
      description: "Get instant feedback",
      icon: "sparkles",
      href: "/dashboard/ai-review",
      color: "amber",
      pro: user.plan === "pro" || user.plan === "business" ? "" : "pro",
    },
    {
      name: "ATS Checker",
      description: "Match against job description",
      icon: "check",
      href: "/dashboard/ats-checker",
      color: "green",
      pro: user.plan === "pro" ? "" : "pro",
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Quick Actions
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {actions.map((action) => (
          <Link
            key={action.name}
            href={action.href}
            className={`p-4 rounded-lg border-2 transition ${
              action.pro
                ? "border-dashed border-gray-300 hover:border-purple-400"
                : `border-${action.color}-200 hover:border-${action.color}-400`
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-10 h-10 rounded-lg bg-${action.color}-100 flex items-center justify-center`}
              >
                <span className="text-lg">
                  {action.icon === "plus" && "➕"}
                  {action.icon === "upload" && "📤"}
                  {action.icon === "sparkles" && "✨"}
                  {action.icon === "check" && "✅"}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-900">{action.name}</p>
                <p className="text-sm text-gray-600">{action.description}</p>
              </div>
            </div>
            {action.pro === "" && (
              <span className="inline-block mt-2 text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                Pro Feature
              </span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
