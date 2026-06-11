import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

export async function POST(req: Request) {
  try {
    const { id } = await req.json();

    if (typeof id !== "string" || !id.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid resume id",
        },
        { status: 400 },
      );
    }

    const { error } = await supabaseAdmin.from("resumes").delete().eq("id", id);

    if (error) {
      return NextResponse.json(
        {
          success: false,
          error: "Delete failed",
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Delete success",
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 },
    );
  }
}
