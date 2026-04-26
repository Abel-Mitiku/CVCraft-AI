import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const userId = formData.get("userId") as string;

    if (!file || !userId) {
      return NextResponse.json(
        { error: "Missing file or userId" },
        { status: 400 },
      );
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files are allowed" },
        { status: 400 },
      );
    }
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be under 10MB" },
        { status: 400 },
      );
    }

    const fileKey = `resumes/${userId}/${uuidv4()}.pdf`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from("ai-reviews")
      .upload(fileKey, file, {
        contentType: "application/pdf",
        upsert: false,
      });

    if (uploadError) throw uploadError;

    return NextResponse.json({
      success: true,
      fileKey,
      fileName: file.name,
      fileSize: file.size,
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload file" },
      { status: 500 },
    );
  }
}
