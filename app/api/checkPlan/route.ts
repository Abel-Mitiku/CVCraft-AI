import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 400 },
      );
    }

    const { data: profile, error } = await supabaseAdmin
      .from("profiles")
      .select("plan")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching plan:", error);

      if (error.code === "PGRST116") {
        return NextResponse.json({ success: true, plan: "free" });
      }

      return NextResponse.json(
        { success: false, error: "Failed to fetch user plan" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      plan: profile?.plan || "free",
    });
  } catch (error) {
    console.error("Check plan API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
