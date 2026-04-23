import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { supabase } from "@/app/lib/supabaseClient";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const category = searchParams.get("category");
    console.log(category);
    const premiumOnly = searchParams.get("premium") === "true";
    const sortBy = searchParams.get("sortBy") || "popular";

    const {
      data: { session },
    } = await supabase.auth.getSession();
    const isProUser = session?.user?.user_metadata?.plan === "pro";

    let query = supabase.from("templates").select("*");

    if (category && category !== "all") {
      query = query.eq("category", category);
    }

    if (premiumOnly && !isProUser) {
      return NextResponse.json({
        templates: [],
        message: "Upgrade to Pro to view premium templates",
        success: false,
        type: "Pro-only",
      });
    }

    if (!premiumOnly && !isProUser) {
      query = query.eq("is_premium", false);
    }

    if (sortBy === "popular") {
      query = query.order("downloads", { ascending: false });
    } else if (sortBy === "rating") {
      query = query.order("rating", { ascending: false });
    } else if (sortBy === "newest") {
      query = query.order("created_at", { ascending: false });
    }

    const { data: templates, error } = await query;

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to fetch templates", success: false },
        { status: 500 },
      );
    }

    const formattedTemplates =
      templates?.map((t: any) => ({
        id: t.id,
        name: t.name,
        description: t.description,
        category: t.category,
        isPremium: t.is_premium,
        rating: parseFloat(t.rating),
        downloads: t.downloads,
        thumbnail: t.thumbnail_url,
        colors: t.colors,
        features: t.features,
      })) || [];

    return NextResponse.json({ templates: formattedTemplates, success: true });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
