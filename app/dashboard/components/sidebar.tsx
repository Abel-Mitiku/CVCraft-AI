"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/app/lib/supabaseClient";
const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: "home" },
  { name: "My Resumes", href: "/dashboard/resumes", icon: "document" },
  { name: "Templates", href: "/dashboard/templates", icon: "template" },
  { name: "Settings", href: "/dashboard/settings", icon: "cog" },
  {
    name: "Billing",
    href: "/dashboard/billing",
    icon: "credit-card",
    pro: true,
  },
];

interface SidebarProps {
  user: { email: string; plan: string };
  currentPath: string;
}

export default function DashboardSidebar({ user, currentPath }: SidebarProps) {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignout = async () => {
    setIsSigningOut(true);
    try {
      await supabase.auth.signOut();
      // ✅ Redirect & prevent back-button to protected route
      router.replace("/login");
    } catch (error) {
      console.error("Sign out failed:", error);
      // Optional: show toast notification
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <aside className="hidden md:flex flex-col w-64 bg-gray-50 border-r border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <p className="text-sm font-medium text-gray-900">{user.email}</p>
        <p className="text-xs text-gray-500">
          {user.plan === "pro" ? "✨ Pro Plan" : "Free Plan"}
        </p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${
              currentPath === item.href
                ? "bg-blue-100 text-blue-700"
                : "text-gray-700 hover:bg-gray-100"
            } ${item.pro && user.plan !== "pro" ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <span>{item.name}</span>
            {item.pro && user.plan !== "pro" && (
              <span className="ml-auto text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                Pro
              </span>
            )}
          </Link>
        ))}
      </nav>

      {user.plan !== "pro" && (
        <div className="p-4 border-t border-gray-200">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-4 text-white">
            <p className="text-sm font-medium mb-2">Unlock AI Features</p>
            <p className="text-xs text-white/80 mb-3">
              Get unlimited AI improvements and premium templates
            </p>
            <Link
              href="/dashboard/billing"
              className="text-xs font-medium underline"
            >
              Upgrade →
            </Link>
          </div>
        </div>
      )}

      <div className="p-4 border-t border-gray-200">
        <button
          className={`flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition ${
            isSigningOut ? "opacity-50 cursor-not-allowed" : ""
          }`}
          onClick={handleSignout}
          disabled={isSigningOut}
        >
          {isSigningOut ? (
            <>
              <svg
                className="w-4 h-4 animate-spin"
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
              Signing out...
            </>
          ) : (
            <>
              <svg
                className="w-4 h-4"
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
              Sign out
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
