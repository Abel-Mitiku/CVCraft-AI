"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabaseClient";
import { CheckSession } from "../components/check-session";

import DashboardHeader from "./components/header";
import DashboardSidebar from "./components/sidebar";
import StatsCard from "./components/main-content";
import QuickActions from "./components/quick-action";
import ResumeGrid from "./components/recent-resume";
import AICreditsWidget from "./components/ai-credits";
import MobileNav from "./components/mobilenav";

export default function DashboardPage() {
  const router = useRouter();

  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [resumes, setResumes] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const initializeDashboard = async () => {
      try {
        const isLoggedIn = await CheckSession();
        if (!isLoggedIn && isMounted) {
          router.push("/login");
          return;
        }

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session && isMounted) {
          router.push("/login");
          return;
        }

        if (session && isMounted) {
          setSession(session);

          await fetchUserData(session.user.id);
          console.log(session.user.id);
        }
      } catch (error) {
        console.error("Dashboard init error:", error);
        if (isMounted) {
          router.push("/login");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    const fetchUserData = async (userId: string) => {
      try {
        const res = await fetch("/api/fetchInfo", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.session?.access_token}`,
          },
          body: JSON.stringify({ userId }),
        });

        const data = await res.json();
        console.log(data);

        if (data.success && isMounted) {
          setStats(data.stats || null);
          setResumes(data.resumes || []);
          setProfile(data.profile || null);
        }
        // console.log(data);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
    };

    initializeDashboard();

    return () => {
      isMounted = false;
    };
  }, [router]);

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const res = await fetch("/api/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: session?.user.id }),
      });
      const data = await res.json();
      console.log("User", data.user);
      if (data.success) {
        setUser(data.user.data);
      }
      console.log(data.error);
    };
    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader user={session?.user} />

      <div className="flex">
        <DashboardSidebar user={user!} currentPath="/dashboard" />

        <main className="flex-1 p-6 md:p-8 pb-24 md:pb-8">
          <StatsCard user={session?.user} stats={stats} />

          <div className="mt-6">
            <QuickActions user={user} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            <div className="lg:col-span-2">
              <ResumeGrid resumes={resumes || []} />
            </div>
          </div>
        </main>
      </div>

      <MobileNav currentPath="/dashboard" />
    </div>
  );
}
