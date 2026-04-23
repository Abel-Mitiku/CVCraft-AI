import { NextResponse } from "next/server";
import { supabase } from "@/app/lib/supabaseClient";
import { error } from "console";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const templateId = searchParams.get("templateId");
  console.log(templateId);
  if (!templateId) {
    return NextResponse.json({ error: "Missing temp id", success: false });
  }

  const { data, error } = await supabase
    .from("templates")
    .select("*")
    .eq("id", templateId)
    .single();
  if (error) {
    return NextResponse.json({ error: error.message, success: false });
  }

  return NextResponse.json({ data, success: true });
}
