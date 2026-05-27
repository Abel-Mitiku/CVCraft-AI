"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { Search, Grid3X3, List, Plus, Filter, ArrowUpDown } from "lucide-react";
import { supabase } from "@/app/lib/supabaseClient";

import DashboardHeader from "../../components/header";
import DashboardSidebar from "../../components/sidebar";
import MobileNav from "../../components/mobilenav";
import ResumeHeader from "./resume-header";
import ResumeGrid from "./resume-grid";
import ResumeList from "./resume-list";
import EmptyState from "./empty-state";
import LoadingSkeleton from "./loading-skeleton";
import ConfirmDeleteModal from "./delete-modal";
import { CheckSession } from "@/app/components/check-session";

interface Resume {
  id: string;
  title: string;
  template: string;
  updated_at: string;
  atsScore?: number;
  isPublic: boolean;
  downloads: number;
}

const MOCK_RESUMES: Resume[] = [
  {
    id: "1",
    title: "Software Engineer Resume",
    template: "modern",
    updated_at: "2024-02-15T10:30:00Z",
    atsScore: 92,
    isPublic: false,
    downloads: 3,
  },
  {
    id: "2",
    title: "Marketing Manager CV",
    template: "classic",
    updated_at: "2024-02-10T14:20:00Z",
    atsScore: 87,
    isPublic: true,
    downloads: 12,
  },
  {
    id: "3",
    title: "Data Analyst Portfolio",
    template: "minimal",
    updated_at: "2024-02-01T09:15:00Z",
    atsScore: 0,
    isPublic: false,
    downloads: 0,
  },
];

export default function ResumesPage() {
  const router = useRouter();

  const [resumes, setResumes] = useState<Resume[]>([]);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"updated" | "name" | "ats">("updated");
  const [filterTemplate, setFilterTemplate] = useState<string>("all");
  const [session, setSession] = useState<any | null>(null);
  const searchParams = useSearchParams();
  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    resumeId: string | null;
  }>({
    open: false,
    resumeId: null,
  });
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
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        });

        const data = await res.json();
        console.log("Resume card : ", data);
        data.resumes.map((r: any) => {
          console.log(r.template);
        });

        if (data.success && isMounted) {
          setResumes(data.resumes || []);
          setProfile(data.profile || null);
        }
        console.log(data);
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

  const filteredResumes = resumes
    .filter((resume) => {
      const matchesSearch = resume.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesTemplate =
        filterTemplate === "all" || resume.template === filterTemplate;
      return matchesSearch && matchesTemplate;
    })
    .sort((a, b) => {
      if (sortBy === "updated") {
        return (
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        );
      }
      if (sortBy === "name") {
        return a.title.localeCompare(b.title);
      }
      if (sortBy === "ats" && a.atsScore && b.atsScore) {
        return b.atsScore - a.atsScore;
      }
      return 0;
    });

  const handleCreateResume = () => {
    router.push("/dashboard/templates");
  };

  const handleEditResume = (resumeId: string) => {
    router.push(`/dashboard/editor?resume=${resumeId}`);
  };

  const handleDeleteResume = async (resumeId: string) => {
    setResumes((prev) => prev.filter((r) => r.id !== resumeId));
    setDeleteModal({ open: false, resumeId: null });
  };

  const handleDuplicateResume = async (resumeId: string) => {
    const original = resumes.find((r) => r.id === resumeId);
    if (original) {
      const newResume: Resume = {
        ...original,
        id: `${Date.now()}`,
        title: `${original.title} (Copy)`,
        updated_at: new Date().toISOString(),
      };
      setResumes((prev) => [newResume, ...prev]);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader user={{ email: "user@example.com" }} />
        <div className="flex">
          <DashboardSidebar
            user={{ plan: "free", email: "user@example.com" }}
            currentPath="/dashboard/resumes"
          />
          <main className="flex-1 p-6 md:p-8">
            <LoadingSkeleton viewMode={viewMode} />
          </main>
        </div>
        <MobileNav currentPath="/dashboard/resumes" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader user={user} />

      <div className="flex">
        <DashboardSidebar user={user!} currentPath="/dashboard/resumes" />

        <main className="flex-1 p-6 md:p-8 pb-24 md:pb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Resumes</h1>
              <p className="text-gray-600">
                Manage and edit your resume documents
              </p>
            </div>
            <button
              onClick={handleCreateResume}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2.5 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Create New Resume
            </button>
          </div>

          <ResumeHeader
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            sortBy={sortBy}
            onSortChange={setSortBy}
            filterTemplate={filterTemplate}
            onFilterChange={setFilterTemplate}
            totalResults={filteredResumes.length}
          />

          {filteredResumes.length === 0 ? (
            searchQuery || filterTemplate !== "all" ? (
              <EmptyState
                title="No matches found"
                description={`No resumes match "${searchQuery}" with template "${filterTemplate}"`}
                actionLabel="Clear filters"
                onAction={() => {
                  setSearchQuery("");
                  setFilterTemplate("all");
                }}
              />
            ) : (
              <EmptyState
                title="No resumes yet"
                description="Create your first resume to get started with AI-powered optimization"
                actionLabel="Create Resume"
                onAction={handleCreateResume}
                illustration="resume"
              />
            )
          ) : viewMode === "grid" ? (
            <ResumeGrid
              resumes={filteredResumes}
              onEdit={handleEditResume}
              onDelete={(id: any) =>
                setDeleteModal({ open: true, resumeId: id })
              }
              onDuplicate={handleDuplicateResume}
            />
          ) : (
            <ResumeList
              resumes={filteredResumes}
              onEdit={handleEditResume}
              onDelete={(id) => setDeleteModal({ open: true, resumeId: id })}
              onDuplicate={handleDuplicateResume}
            />
          )}
        </main>
      </div>

      {deleteModal.open && deleteModal.resumeId && (
        <ConfirmDeleteModal
          resumeTitle={
            resumes.find((r) => r.id === deleteModal.resumeId)?.title || ""
          }
          onConfirm={() => handleDeleteResume(deleteModal.resumeId!)}
          onCancel={() => setDeleteModal({ open: false, resumeId: null })}
        />
      )}

      <MobileNav currentPath="/dashboard/resumes" />
    </div>
  );
}
