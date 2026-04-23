import { supabase } from "@/app/lib/supabaseClient";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { email, password } = await req.json();
  if (!email || !password) {
    return NextResponse.json({
      error: "Please fill the required fields",
      success: false,
    });
  }
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return NextResponse.json({ error: error.message, success: false });
  }

  return NextResponse.json({
    success: true,
    user: data.user,
    session: data.session,
  });
}
