import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";
import { v4 as uuidv4 } from "uuid";

export const runtime = "nodejs";

const ALLOWED_FOLDERS = ["ats-jobs", "ats-resumes"] as const;
type AllowedFolder = (typeof ALLOWED_FOLDERS)[number];

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const userId = formData.get("userId") as string;
    const folder = (formData.get("folder") as string) || "ats-jobs";

    if (!file || !userId) {
      return NextResponse.json(
        { success: false, error: "Missing file or userId" },
        { status: 400 },
      );
    }

    if (!ALLOWED_FOLDERS.includes(folder as AllowedFolder)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid folder. Must be one of: ${ALLOWED_FOLDERS.join(", ")}`,
        },
        { status: 400 },
      );
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { success: false, error: "Only PDF files are allowed" },
        { status: 400 },
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: "File size must be under 5MB" },
        { status: 400 },
      );
    }

    const fileName = `${uuidv4()}.pdf`;
    const fileKey = `${folder}/${userId}/${fileName}`;

    const { error: uploadError, data: uploaded } = await supabaseAdmin.storage
      .from("ai-reviews")
      .upload(fileKey, file, {
        contentType: "application/pdf",
        upsert: false,
      });

    if (uploadError) {
      console.error("Supabase upload error:", uploadError);
      throw uploadError;
    }

    console.log("✅ File uploaded:", { fileKey, size: file.size });

    return NextResponse.json({
      success: true,
      fileKey,
      fileName,
      fileSize: file.size,
      folder,
    });
  } catch (error: any) {
    console.error("ATS upload error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to upload file",
        debug: process.env.NODE_ENV === "development" ? error : undefined,
      },
      { status: 500 },
    );
  }
}
