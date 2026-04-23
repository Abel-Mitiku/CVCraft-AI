import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "No userId provided", success: false },
        { status: 401 },
      );
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (profileError) {
      return NextResponse.json(
        { error: profileError.message, success: false },
        { status: 500 },
      );
    }

    const { data: resumes, error: resumesError } = await supabaseAdmin
      .from("resumes")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(6);

    console.log("resumes:", resumes);

    if (resumesError) {
      return NextResponse.json(
        { error: resumesError.message, success: false },
        { status: 500 },
      );
    }

    const stats = {
      totalResumes: resumes?.length || 0,
      weeklyGrowth: 0,
      avgAtsScore: resumes?.length
        ? resumes.reduce((acc, r) => acc + (r.ats_score || 0), 0) /
          resumes.length
        : 0,
      totalDownloads: resumes?.length
        ? resumes.reduce((acc, r) => acc + (r.downloads || 0), 0)
        : 0,
    };

    return NextResponse.json({
      success: true,
      profile,
      resumes,
      stats,
      userId,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Unknown error", success: false },
      { status: 500 },
    );
  }
}
