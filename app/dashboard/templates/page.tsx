"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Filter, Grid3X3, List, Star, Sparkles } from "lucide-react";

import DashboardHeader from "../components/header";
import DashboardSidebar from "../components/sidebar";
import MobileNav from "../components/mobilenav";
import TemplateHeader from "./components/template-header";
import TemplateGrid from "./components/template-grid";
import TemplateList from "./components/template-list";
import TemplatePreview from "./components/template-preview";
import LoadingSkeleton from "./components/loading-skeleton";
import { CheckSession } from "@/app/components/check-session";
import { supabase } from "@/app/lib/supabaseClient";

interface Template {
  id: string;
  name: string;
  description: string;
  category: "classic" | "modern" | "minimal" | "creative" | "professional";
  isPremium: boolean;
  rating: number;
  downloads: number;
  thumbnail: string;
  colors: string[];
  features: string[];
}

export default function TemplatesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [templates, setTemplates] = useState<Template[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || "",
  );
  const [selectedCategory, setSelectedCategory] = useState<string>(
    searchParams.get("category") || "all",
  );
  const [showPremiumOnly, setShowPremiumOnly] = useState(false);
  const [sortBy, setSortBy] = useState<"popular" | "rating" | "newest">(
    (searchParams.get("sortBy") as any) || "popular",
  );
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [isProUser, setIsProUser] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        category: selectedCategory !== "all" ? selectedCategory : "",
        premium: showPremiumOnly ? "true" : "",
        sortBy: sortBy,
        search: searchQuery,
      });

      const res = await fetch(`/api/templates?${params}`, {
        method: "GET",
      });

      const data = await res.json();
      console.log(data);

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch templates");
      }

      if (data.success) {
        setTemplates(data.templates || []);
        if (data.message && !showPremiumOnly) {
          console.log(data.message);
        }
      }
      if (!data.success) {
        setError(data.message);
        if (data.type && data.type === "Pro-only") {
          setError(data.message);
        }
      }
    } catch (err: any) {
      console.error("Failed to fetch templates:", err);
      setError(err.message || "Failed to load templates");
      setTemplates([]);
    }
  }, [selectedCategory, showPremiumOnly, sortBy, searchQuery]);

  useEffect(() => {
    let isMounted = true;

    const initializePage = async () => {
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

          const isPro = session.user?.user_metadata?.plan === "pro";
          setIsProUser(isPro);

          await fetchTemplates();
        }
      } catch (err) {
        console.error("Page init error:", err);
        if (isMounted) {
          setError("Failed to load page");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initializePage();

    return () => {
      isMounted = false;
    };
  }, [router, fetchTemplates]);

  useEffect(() => {
    if (loading || !session) return;

    const timeoutId = setTimeout(() => {
      fetchTemplates();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [
    searchQuery,
    selectedCategory,
    showPremiumOnly,
    sortBy,
    loading,
    session,
    fetchTemplates,
  ]);

  const filteredTemplates = templates
    .filter((template) => {
      const matchesSearch =
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || template.category === selectedCategory;
      const matchesPremium =
        !showPremiumOnly || template.isPremium || isProUser;
      return matchesSearch && matchesCategory && matchesPremium;
    })
    .sort((a, b) => {
      if (sortBy === "popular") {
        return b.downloads - a.downloads;
      }
      if (sortBy === "rating") {
        return b.rating - a.rating;
      }
      if (sortBy === "newest") {
        return parseInt(b.id) - parseInt(a.id);
      }
      return 0;
    });

  const handleSelectTemplate = async (templateId: string) => {
    try {
      if (session?.user?.id) {
        await fetch("/api/user/template", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: session.user.id,
            templateId,
          }),
        });
      }

      setSelectedTemplate(templateId);
      localStorage.setItem("selectedTemplate", templateId);
      router.push("/dashboard/editor?template=" + templateId);
    } catch (err) {
      console.error("Failed to select template:", err);
      setSelectedTemplate(templateId);
      router.push("/dashboard/resumes?template=" + templateId);
    }
  };

  const handlePreviewTemplate = (template: Template) => {
    if (template.isPremium && !isProUser) {
      router.push("/dashboard/billing?template=" + template.id);
      return;
    }
    setPreviewTemplate(template);
  };

  const updateUrlParams = () => {
    const params = new URLSearchParams(searchParams);
    if (searchQuery) params.set("search", searchQuery);
    else params.delete("search");

    if (selectedCategory !== "all") params.set("category", selectedCategory);
    else params.delete("category");

    params.set("sortBy", sortBy);

    router.replace(`/dashboard/templates?${params.toString()}`, {
      scroll: false,
    });
  };

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
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader user={session?.user || { email: "Loading..." }} />
        <div className="flex">
          <DashboardSidebar
            user={session?.user || { email: "Loading..." }}
            currentPath="/dashboard/templates"
          />
          <main className="flex-1 p-6 md:p-8">
            <LoadingSkeleton viewMode={viewMode} />
          </main>
        </div>
        <MobileNav currentPath="/dashboard/templates" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => {
              setError(null);
              setLoading(true);
              fetchTemplates();
            }}
            className="text-blue-600 hover:underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader user={user} />

      <div className="flex">
        <DashboardSidebar user={user} currentPath="/dashboard/templates" />

        <main className="flex-1 p-6 md:p-8 pb-24 md:pb-8">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Resume Templates
                </h1>
                <p className="text-gray-600">
                  Choose from professionally designed templates
                </p>
              </div>
            </div>
          </div>

          <TemplateHeader
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            sortBy={sortBy}
            onSortChange={setSortBy}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            showPremiumOnly={showPremiumOnly}
            onPremiumToggle={setShowPremiumOnly}
            totalResults={filteredTemplates.length}
          />

          {user?.plan !== "pro" && user?.plan !== "business" && (
            <div className="mb-6 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg mb-1">
                    ✨ Unlock Premium Templates
                  </h3>
                  <p className="text-white/90 text-sm">
                    Get access to 20+ premium templates with AI-powered
                    optimization
                  </p>
                </div>
                <button
                  onClick={() => router.push("/dashboard/billing")}
                  className="bg-white text-purple-600 px-5 py-2.5 rounded-lg font-medium hover:bg-white/90 transition"
                >
                  Upgrade to Pro
                </button>
              </div>
            </div>
          )}

          {filteredTemplates.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchQuery || selectedCategory !== "all" || showPremiumOnly
                  ? "No templates found"
                  : "No templates available"}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchQuery || selectedCategory !== "all" || showPremiumOnly
                  ? "Try adjusting your search or filters to find what you're looking for"
                  : isProUser
                    ? "Check back later for new templates!"
                    : "Upgrade to Pro to unlock premium templates"}
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                  setShowPremiumOnly(false);
                }}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear all filters
              </button>
            </div>
          ) : viewMode === "grid" ? (
            <TemplateGrid
              templates={filteredTemplates}
              onSelect={handleSelectTemplate}
              onPreview={handlePreviewTemplate}
              selectedTemplate={selectedTemplate}
              // isProUser={isProUser}
            />
          ) : (
            <TemplateList
              templates={filteredTemplates}
              onSelect={handleSelectTemplate}
              onPreview={handlePreviewTemplate}
              selectedTemplate={selectedTemplate}
              // isProUser={isProUser}
            />
          )}
        </main>
      </div>

      {previewTemplate && (
        <TemplatePreview
          template={previewTemplate}
          onClose={() => setPreviewTemplate(null)}
          onSelect={handleSelectTemplate}
          isSelected={selectedTemplate === previewTemplate.id}
          // isProUser={isProUser}
        />
      )}

      <MobileNav currentPath="/dashboard/templates" />
    </div>
  );
}
