import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

export async function POST(req: Request) {
  const { userId } = await req.json();
  if (!userId) {
    return NextResponse.json({ error: "No user id required", success: false });
  }
  try {
    const user = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    if (!user) {
      return NextResponse.json({ error: "No user fetched", success: false });
    }
    return NextResponse.json({ user, success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message, success: false });
  }
}
