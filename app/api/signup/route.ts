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
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: "https://cv-craft-ai-omega.vercel.app/auth/callback",
    },
  });

  if (error) {
    return NextResponse.json({ error: error.message, success: false });
  }
  return NextResponse.json({
    message: "User registered successfully please confirm your email",
    success: true,
    user: data.user,
  });
}
