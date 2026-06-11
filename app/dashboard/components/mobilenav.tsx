"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/app/lib/supabaseClient";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: "home" },
  { name: "Resumes", href: "/dashboard/resumes", icon: "document" },
  { name: "Templates", href: "/dashboard/templates", icon: "template" },
  { name: "Settings", href: "/dashboard/settings", icon: "cog" },
  {
    name: "Billing",
    href: "/dashboard/billing",
    icon: "credit-card",
    pro: true,
  },
];

interface MobileNavProps {
  user?: { email: string; plan: string } | null;
  currentPath: string;
}

export default function MobileNav({ user, currentPath }: MobileNavProps) {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignout = async () => {
    setIsSigningOut(true);
    try {
      await supabase.auth.signOut();
      router.replace("/login");
    } catch (error) {
      console.error("Sign out failed:", error);
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 shadow-lg">
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 bg-gray-50">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-[10px] font-bold">
            {user?.email?.charAt(0)?.toUpperCase() || "?"}
          </div>
          <div>
            <p className="text-xs font-medium text-gray-900 truncate max-w-[120px]">
              {user?.email || "Loading..."}
            </p>
            <p className="text-[10px] text-gray-500">
              {user?.plan === "pro" ? "✨ Pro Plan" : "Free Plan"}
            </p>
          </div>
        </div>
        <button
          onClick={handleSignout}
          disabled={isSigningOut}
          className="text-xs text-gray-600 hover:text-gray-900 flex items-center gap-1 disabled:opacity-50"
        >
          {isSigningOut ? (
            <svg
              className="w-3 h-3 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          ) : (
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
          )}
          Sign out
        </button>
      </div>

      {user?.plan !== "pro" && (
        <div className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium">Unlock AI Features</p>
              <p className="text-[10px] text-white/80">
                Get unlimited AI improvements
              </p>
            </div>
            <Link
              href="/dashboard/billing"
              className="text-xs font-medium underline"
            >
              Upgrade →
            </Link>
          </div>
        </div>
      )}

      <div className="flex items-center justify-around px-2 py-2 bg-white">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg flex-1 transition-colors ${
              currentPath === item.href
                ? "text-blue-600 bg-blue-50"
                : "text-gray-600 hover:bg-gray-50"
            } ${item.pro && user?.plan !== "pro" ? "opacity-60" : ""}`}
          >
            <span className="text-lg">
              {item.icon === "home" && "🏠"}
              {item.icon === "document" && "📄"}
              {item.icon === "template" && "📑"}
              {item.icon === "cog" && "⚙️"}
              {item.icon === "credit-card" && "💳"}
            </span>
            <span className="text-[10px] font-medium">{item.name}</span>

            {item.pro && user?.plan !== "pro" && (
              <span className="text-[8px] bg-purple-100 text-purple-700 px-1 rounded">
                Pro
              </span>
            )}
          </Link>
        ))}
      </div>
    </nav>
  );
}
