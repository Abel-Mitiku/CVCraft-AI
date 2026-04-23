import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

export async function POST(req: Request) {
  const { resumeId } = await req.json();
  if (!resumeId) {
    return NextResponse.json({
      error: "No resume id required",
      success: false,
    });
  }
  try {
    const { data, error } = await supabaseAdmin
      .from("resumes")
      .select("*")
      .eq("id", resumeId)
      .single();
    console.log("resume", data);
    if (error) {
      return NextResponse.json({ error: error, success: false });
    }
    return NextResponse.json({ data, success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message, success: false });
  }
}
