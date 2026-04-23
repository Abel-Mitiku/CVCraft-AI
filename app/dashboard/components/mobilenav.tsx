import Link from "next/link";
export default function MobileNav({ currentPath }: any) {
  const items = [
    { name: "Home", href: "/dashboard", icon: "home" },
    { name: "Resumes", href: "/dashboard/resumes", icon: "document" },
    { name: "Create", href: "/editor", icon: "plus", highlight: true },
    { name: "Credits", href: "/dashboard/credits", icon: "sparkles" },
    { name: "Profile", href: "/dashboard/settings", icon: "user" },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50">
      <div className="flex items-center justify-around">
        {items.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg ${
              item.highlight
                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white -mt-6 shadow-lg"
                : currentPath === item.href
                  ? "text-blue-600"
                  : "text-gray-600"
            }`}
          >
            <span className="text-lg">
              {item.icon === "home" && "🏠"}
              {item.icon === "document" && "📄"}
              {item.icon === "plus" && "➕"}
              {item.icon === "sparkles" && "✨"}
              {item.icon === "user" && "👤"}
            </span>
            <span className="text-xs">{item.name}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
