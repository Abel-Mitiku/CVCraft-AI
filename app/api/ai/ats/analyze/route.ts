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

function formatResumeToText(r: any): string {
  const parts: string[] = [];
  if (r.personalInfo) {
    parts.push(`Name: ${r.personalInfo.fullName || ""}`);
    parts.push(
      `Contact: ${r.personalInfo.email || ""} | ${r.personalInfo.phone || ""}`,
    );
  }
  if (r.summary) parts.push(`Summary: ${r.summary}`);
  if (r.skills?.technical?.length)
    parts.push(`Technical Skills: ${r.skills.technical.join(", ")}`);
  if (r.skills?.soft?.length)
    parts.push(`Soft Skills: ${r.skills.soft.join(", ")}`);
  if (r.skills?.languages?.length)
    parts.push(`Languages: ${r.skills.languages.join(", ")}`);

  r.experience?.forEach((exp: any) => {
    parts.push(`Role: ${exp.role || ""} at ${exp.company || ""}`);
    if (exp.description) parts.push(`Details: ${exp.description}`);
  });

  r.education?.forEach((edu: any) => {
    parts.push(`Education: ${edu.degree || ""} at ${edu.school || ""}`);
  });

  r.certifications?.forEach((cert: any) => {
    parts.push(`Certification: ${cert.name || cert}`);
  });

  return parts.filter((p) => p.trim()).join("\n");
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, resumeId, resumeFileKey, jobDescription, jobFileKey } =
      body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Missing userId" },
        { status: 400 },
      );
    }

    let resumeText = "";
    let isFromLibrary = false;

    if (resumeId) {
      isFromLibrary = true;

      const { data: resume, error: resumeError } = await supabaseAdmin
        .from("resumes")
        .select("*")
        .eq("id", resumeId)
        .eq("user_id", userId)
        .single();

      if (resumeError || !resume) {
        return NextResponse.json(
          { success: false, error: "Resume not found" },
          { status: 404 },
        );
      }

      resumeText = formatResumeToText(resume);

      const hasBasicInfo =
        resumeText.includes("Name:") &&
        (resumeText.includes("email") || resumeText.includes("Contact"));
      if (!resumeText || (!hasBasicInfo && resumeText.length < 30)) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Your resume appears to be empty. Please add experience, skills, or education before analyzing.",
            hint: "Go to your resume builder to add content.",
          },
          { status: 400 },
        );
      }
    } else if (resumeFileKey) {
      const { data: fileData, error: downloadError } =
        await supabaseAdmin.storage.from("ai-reviews").download(resumeFileKey);

      if (downloadError) {
        return NextResponse.json(
          {
            success: false,
            error: `Failed to download resume PDF: ${downloadError.message}`,
          },
          { status: 500 },
        );
      }

      if (!fileData) {
        return NextResponse.json(
          {
            success: false,
            error: "Resume PDF not found in storage. Please upload again.",
          },
          { status: 404 },
        );
      }

      const arrayBuffer = await fileData.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      resumeText = await extractTextFromPDF(buffer);

      if (!resumeText || resumeText.length < 50) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Could not extract meaningful text from the uploaded PDF. Ensure it's a text-based PDF (not scanned/image).",
          },
          { status: 400 },
        );
      }
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "Missing resume source (provide resumeId or resumeFileKey)",
        },
        { status: 400 },
      );
    }

    let jobDescText = jobDescription?.trim();

    if (jobFileKey && !jobDescText) {
      const { data: fileData, error: downloadError } =
        await supabaseAdmin.storage.from("ai-reviews").download(jobFileKey);

      if (downloadError) {
        return NextResponse.json(
          {
            success: false,
            error: `Failed to download job PDF: ${downloadError.message}`,
          },
          { status: 500 },
        );
      }

      if (!fileData) {
        return NextResponse.json(
          { success: false, error: "Job description PDF not found in storage" },
          { status: 404 },
        );
      }

      const arrayBuffer = await fileData.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      jobDescText = await extractTextFromPDF(buffer);
    }

    if (!jobDescText || jobDescText.length < 50) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Job description is too short or invalid. Please provide at least 50 characters.",
        },
        { status: 400 },
      );
    }

    const completion = groq.chat.completions.create({
      model: "openai/gpt-oss-120b",
      messages: [
        {
          role: "system",
          content: `You are an ATS expert. Analyze the resume against the job description and return EXACTLY this JSON:
{
  "score": number (0-100),
  "keywordMatchPercentage": number (0-100),
  "matchedKeywords": ["string"],
  "missingKeywords": ["string"],
  "strengths": ["string"],
  "improvements": ["string"],
  "atsWarnings": ["string"],
  "feedback": "string"
}
Rules:
- score: overall ATS compatibility (60% keywords, 40% structure)
- matchedKeywords: terms from job description found in resume (5-10 items)
- missingKeywords: important job terms NOT in resume (5-10 items)
- strengths: what the resume does well for ATS (3-5 items)
- improvements: actionable fixes (3-5 items)
- atsWarnings: formatting/parsing risks (0-3 items)
- feedback: one concise paragraph summarizing results
Return ONLY valid JSON, no markdown, no code blocks, no extra text.`,
        },
        {
          role: "user",
          content: `JOB DESCRIPTION:\n${jobDescText}\n\nRESUME:\n${resumeText.slice(0, 12000)}`,
        },
      ],
      temperature: 0.2,
      max_tokens: 2048,
      top_p: 1,
      stream: false,
    });

    const aiResponse = (await completion).choices[0].message?.content?.trim();
    if (!aiResponse) throw new Error("Empty AI response");

    let result: any;
    try {
      const cleaned = aiResponse
        .replace(/^```json\s*/i, "")
        .replace(/```$/i, "")
        .trim();
      result = JSON.parse(cleaned);

      if (
        typeof result.score !== "number" ||
        !Array.isArray(result.matchedKeywords) ||
        !Array.isArray(result.missingKeywords) ||
        !Array.isArray(result.strengths) ||
        !Array.isArray(result.improvements) ||
        !Array.isArray(result.atsWarnings) ||
        typeof result.feedback !== "string"
      ) {
        throw new Error("Invalid JSON structure");
      }
    } catch (parseError) {
      return NextResponse.json(
        {
          success: false,
          error: "AI response could not be parsed. Please try again.",
        },
        { status: 502 },
      );
    }

    try {
      await supabaseAdmin.from("ats_checks").insert({
        user_id: userId,
        resume_id: resumeId || null,
        resume_file_key: resumeFileKey || null,
        job_hash: jobDescText.slice(0, 100),
        score: result.score,
        matched_keywords: result.matchedKeywords,
        missing_keywords: result.missingKeywords,
        feedback: result.feedback,
        created_at: new Date().toISOString(),
      });
    } catch (dbError: any) {
      return NextResponse.json({ error: dbError.message, success: false });
    }

    return NextResponse.json({
      success: true,
      result: {
        score: result.score,
        keywordMatchPercentage: result.keywordMatchPercentage,
        matchedKeywords: result.matchedKeywords,
        missingKeywords: result.missingKeywords,
        strengths: result.strengths,
        improvements: result.improvements,
        atsWarnings: result.atsWarnings,
        feedback: result.feedback,
      },
    });
  } catch (err: any) {
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
      {
        success: false,
        error: err.message || "Failed to analyze ATS compatibility",
      },
      { status: 500 },
    );
  }
}
