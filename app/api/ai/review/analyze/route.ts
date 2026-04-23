import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";
import PDFParser from "pdf2json";

const groq = new Groq({
  apiKey: process.env.GROQ_API,
});

function extractTextFromPDF(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser(null, true);

    pdfParser.on("pdfParser_dataError", (err: any) => {
      reject(new Error(`PDF parse error: ${err.parserError}`));
    });

    pdfParser.on("pdfParser_dataReady", () => {
      const text = pdfParser.getRawTextContent();
      resolve(text.trim());
    });

    pdfParser.parseBuffer(buffer);
  });
}

export async function POST(req: Request) {
  try {
    const { userId, fileKey } = await req.json();
    console.log("🔍 Analyzing resume:", { userId, fileKey });

    if (!userId || !fileKey) {
      return NextResponse.json(
        { success: false, error: "Missing userId or fileKey" },
        { status: 400 },
      );
    }

    console.log("🔎 Checking if file exists in Supabase Storage...");
    const { data: existingFile, error: listError } = await supabaseAdmin.storage
      .from("ai-reviews")
      .list(`resumes/${userId}/`, {
        limit: 100,
        offset: 0,
        sortBy: { column: "name", order: "asc" },
      });

    if (listError) {
      console.error("❌ Failed to list files:", listError);
    } else {
      const fileExists = existingFile?.some(
        (f: any) => f.name === fileKey.split("/").pop(),
      );
      console.log(
        "📁 Files in user folder:",
        existingFile?.map((f: any) => f.name),
      );
      console.log("✅ File exists:", fileExists);
    }

    console.log("📥 Attempting to download:", fileKey);

    const { data: fileData, error: downloadError } = await supabaseAdmin.storage
      .from("ai-reviews")
      .download(fileKey);

    if (downloadError) {
      console.error("❌ Supabase download error:", {
        message: downloadError.message,
        status: downloadError.status,
        statusCode: downloadError.statusCode,
        name: downloadError.name,
      });
      return NextResponse.json(
        {
          success: false,
          error: `Failed to download PDF: ${downloadError.message}`,
          debug:
            process.env.NODE_ENV === "development" ? downloadError : undefined,
        },
        { status: 500 },
      );
    }

    if (!fileData) {
      console.error("❌ No file data AND no error — this usually means:");
      console.error("   • File doesn't exist at that path");
      console.error("   • Bucket name is wrong (must be 'ai-reviews')");
      console.error("   • Service role key lacks storage access");
      console.error("   • File path format is incorrect");

      return NextResponse.json(
        {
          success: false,
          error: "PDF file not found in storage. Please upload a resume first.",
          debug: {
            fileKey,
            expectedPath: `ai-reviews/${fileKey}`,
            tip: "Check that the bucket name is exactly 'ai-reviews' (lowercase, hyphen)",
          },
        },
        { status: 404 },
      );
    }

    console.log(
      "✅ PDF downloaded successfully, size:",
      fileData.size,
      "bytes",
    );

    const arrayBuffer = await fileData.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log("📄 Parsing PDF with pdf2json...");
    const resumeText = await extractTextFromPDF(buffer);
    console.log("📄 Extracted text length:", resumeText.length);

    if (!resumeText || resumeText.length < 50) {
      return NextResponse.json(
        { success: false, error: "Could not extract text from PDF" },
        { status: 400 },
      );
    }

    console.log("🤖 Sending to Groq for analysis...");
    const completion = groq.chat.completions.create({
      model: "openai/gpt-oss-120b",
      messages: [
        {
          role: "system",
          content: `You are an expert resume reviewer. Analyze the provided resume text and return a JSON object with:
{
  "score": number (0-100),
  "strengths": ["string", "..."],
  "improvements": ["string", "..."],
  "suggestions": ["string", "..."],
  "rawFeedback": "string"
}

Rules:
- Return ONLY valid JSON, no markdown, no code blocks, no extra text
- Be constructive, specific, and professional
- Focus on: formatting, keyword optimization, quantifiable achievements, ATS compatibility
- strengths/improvements/suggestions: 3-5 items each, concise and actionable`,
        },
        {
          role: "user",
          content: `Resume text to review:\n\n${resumeText.slice(0, 12000)}`,
        },
      ],
      temperature: 0.2,
      max_tokens: 2048,
      top_p: 1,
      stream: false,
    });

    const aiResponse = (await completion).choices[0].message?.content?.trim();
    if (!aiResponse) throw new Error("Empty AI response");

    let review: any;
    try {
      const cleaned = aiResponse
        .replace(/^```json\s*/i, "")
        .replace(/```$/i, "")
        .trim();
      review = JSON.parse(cleaned);

      if (
        typeof review.score !== "number" ||
        !Array.isArray(review.strengths) ||
        !Array.isArray(review.improvements) ||
        !Array.isArray(review.suggestions) ||
        typeof review.rawFeedback !== "string"
      ) {
        throw new Error("Invalid JSON structure");
      }
    } catch (parseError) {
      console.error("Failed to parse Groq response:", {
        raw: aiResponse,
        error: parseError,
      });
      return NextResponse.json(
        {
          success: false,
          error: "AI response could not be parsed. Please try again.",
        },
        { status: 502 },
      );
    }

    await supabaseAdmin.from("ai_reviews").insert({
      user_id: userId,
      file_key: fileKey,
      score: review.score,
      strengths: review.strengths,
      improvements: review.improvements,
      suggestions: review.suggestions,
      raw_feedback: review.rawFeedback,
      created_at: new Date().toISOString(),
    });

    console.log("✅ AI review saved to database");

    return NextResponse.json({
      success: true,
      review: {
        score: review.score,
        strengths: review.strengths,
        improvements: review.improvements,
        suggestions: review.suggestions,
        rawFeedback: review.rawFeedback,
      },
    });
  } catch (err: any) {
    console.error("💥 AI analysis error:", err);

    if (err?.status === 401) {
      return NextResponse.json(
        { success: false, error: "Invalid Groq API key" },
        { status: 401 },
      );
    }
    if (err?.status === 429) {
      return NextResponse.json(
        { success: false, error: "Rate limit exceeded" },
        { status: 429 },
      );
    }

    return NextResponse.json(
      { success: false, error: err.message || "Failed to analyze resume" },
      { status: 500 },
    );
  }
}
