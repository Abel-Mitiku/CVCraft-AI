import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API,
});

export async function POST(req: Request) {
  try {
    const { field, currentValue, context } = await req.json();

    console.log("🔍 AI Improve request:", {
      field,
      currentValueLength: currentValue?.length,
    });

    if (!field || currentValue === undefined || !context) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: field, currentValue, or context",
        },
        { status: 400 },
      );
    }

    const allowedFields = [
      "summary",
      "experience",
      "education",
      "skills.technical",
      "skills.soft",
      "experience.description",
      "experience.achievement",
      "education.description",
      "education.honors",
      "skills.languages",
      "certifications",
      "personalInfo.fullName",
      "personalInfo.email",
      "personalInfo.phone",
      "personalInfo.location",
      "personalInfo.linkedin",
      "personalInfo.portfolio",
    ];

    if (!allowedFields.includes(field)) {
      return NextResponse.json(
        { success: false, error: `Invalid field: ${field}` },
        { status: 400 },
      );
    }

    const { resumeData, jobDescription } = context;

    const resumeContext = resumeData
      ? `
RESUME CONTEXT:
- Name: ${resumeData.personalInfo?.fullName || "Not provided"}
- Current Summary: ${resumeData.summary?.slice(0, 200) || "None"}
- Experience Count: ${resumeData.experience?.length || 0}
- Technical Skills: ${resumeData.skills?.technical?.slice(0, 5).join(", ") || "None"}
- Education Count: ${resumeData.education?.length || 0}
`.trim()
      : "No resume context provided";

    const jobContext = jobDescription
      ? `\nJOB DESCRIPTION: ${jobDescription.slice(0, 500)}...`
      : "";

    const prompt = getPromptForField(
      field,
      currentValue,
      resumeContext,
      jobContext,
    );

    console.log("🤖 Sending to Groq for suggestions...");

    const completion = groq.chat.completions.create({
      model: "openai/gpt-oss-120b",
      messages: [
        {
          role: "system",
          content: `You are a professional resume writer and ATS optimization expert.

Your job is to provide highly specific, actionable improvements for resume sections.

Return EXACTLY this JSON structure:
{
  "suggestions": [
    {
      "title": "string (short, actionable)",
      "description": "string (clear explanation of the issue)",
      "example": "string (improved version the user can directly copy)",
      "impact": "string (why this improves ATS score or recruiter perception)"
    }
  ],
  "overallTip": "string (one short, high-value summary insight)"
}

Rules:
- Return 2-3 suggestions maximum (not more)
- Be extremely specific (avoid generic advice)
- Examples must be REAL improved versions, not placeholders
- Do NOT repeat the original text without improving it
- Focus on measurable impact, clarity, and ATS keyword alignment
- Do NOT include markdown or extra text
- Return ONLY valid JSON`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 1024,
      top_p: 1,
      stream: false,
    });

    const aiResponse = (await completion).choices[0].message?.content?.trim();
    if (!aiResponse) {
      throw new Error("Empty AI response");
    }

    let result: any;
    try {
      const cleaned = aiResponse
        .replace(/^```json\s*/i, "")
        .replace(/```$/i, "")
        .trim();
      result = JSON.parse(cleaned);

      if (
        !Array.isArray(result.suggestions) ||
        typeof result.overallTip !== "string" ||
        result.suggestions.some(
          (s: any) => !s.title || !s.description || !s.example || !s.impact,
        )
      ) {
        throw new Error("Invalid response structure");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", {
        raw: aiResponse,
        error: parseError,
      });
      return NextResponse.json(
        {
          success: false,
          error: "AI suggestions could not be parsed. Please try again.",
        },
        { status: 502 },
      );
    }

    console.log("🔍 AI Improve request:", {
      field,
      currentValueLength: currentValue?.length,
    });

    return NextResponse.json({
      success: true,
      field,
      suggestions: result.suggestions,
      overallTip: result.overallTip,
    });
  } catch (err: any) {
    console.error("💥 AI improve route error:", err);

    if (err?.status === 401) {
      return NextResponse.json(
        { success: false, error: "Invalid Groq API key" },
        { status: 401 },
      );
    }
    if (err?.status === 429) {
      return NextResponse.json(
        {
          success: false,
          error: "Rate limit exceeded. Please wait 30 seconds.",
        },
        { status: 429 },
      );
    }
    if (err?.status === 403) {
      return NextResponse.json(
        {
          success: false,
          error: "Access denied. Check Groq API key and model access.",
        },
        { status: 403 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to generate suggestions",
      },
      { status: 500 },
    );
  }
}

function getPromptForField(
  field: string,
  currentValue: string | string[] | any,
  resumeContext: string,
  jobContext: string,
): string {
  const formatValue = (val: any): string => {
    if (typeof val === "string") return val.trim();
    if (Array.isArray(val)) return val.filter(Boolean).join(", ");
    if (typeof val === "object" && val !== null) {
      return Object.entries(val)
        .filter(([_, v]) => v)
        .map(([k, v]) => `${k}: ${v}`)
        .join("\n");
    }
    return String(val);
  };

  const currentValueText = formatValue(currentValue);

  switch (field) {
    case "summary":
      return `
${resumeContext}${jobContext}

FIELD: Professional Summary
CURRENT VALUE: "${currentValueText || "(empty)"}"

TASK: Suggest 2-3 highly specific improvements to make this summary stronger.

Focus on:
- Making it concise (3–4 lines max)
- Adding role-specific keywords from the job description
- Improving clarity and professional tone
- Including at least one measurable or impactful statement

IMPORTANT:
- Each example must be a FULL improved summary, not a partial rewrite
- Avoid generic phrases like "hardworking" or "team player"

Return suggestions with concrete examples the user can copy.`;

    case "experience":
      return `
${resumeContext}${jobContext}

FIELD: Work Experience Entry
CURRENT VALUE: "${currentValueText || "(empty)"}"

TASK: Suggest 2-3 improvements to make this experience entry stronger and ATS-friendly.

Focus on:
- Rewriting bullets using strong action verbs
- Adding measurable results (%, numbers, impact)
- Making responsibilities sound like achievements
- Including relevant technical keywords

IMPORTANT:
- Each example must be a FULL rewritten bullet point
- Do NOT just suggest "add metrics" — actually include them in the example

Return suggestions with concrete, copy-paste ready examples.`;

    case "skills.technical":
      return `
${resumeContext}${jobContext}

FIELD: Technical Skills List
CURRENT VALUE: "${currentValueText || "(empty)"}"

TASK: Suggest 2-3 improvements to optimize this skills section.

Focus on:
- Grouping related skills clearly
- Prioritizing skills relevant to the job description
- Removing weak or outdated skills
- Making it easy for ATS to scan

IMPORTANT:
- Examples must show a CLEAN, properly grouped skills section

Return suggestions with concrete examples.`;

    case "skills.soft":
      return `
${resumeContext}${jobContext}

FIELD: Soft Skills List
CURRENT VALUE: "${currentValueText || "(empty)"}"

TASK: Suggest 2-3 improvements to make soft skills more credible.

Focus on:
- Replacing vague traits with specific behaviors
- Linking soft skills to outcomes
- Aligning wording with job description

IMPORTANT:
- Examples must show improved, realistic phrasing (not generic buzzwords)

Return suggestions with concrete examples.`;

    case "education":
      return `
${resumeContext}${jobContext}

FIELD: Education Entry
CURRENT VALUE: "${currentValueText || "(empty)"}"

TASK: Suggest 2-3 improvements to strengthen this education section.

Focus on:
- Adding relevant coursework or projects
- Including achievements (GPA, honors if strong)
- Keeping it concise and relevant

IMPORTANT:
- Examples must be realistic and properly formatted

Return suggestions with concrete examples.`;

    case "certifications":
      return `
${resumeContext}${jobContext}

FIELD: Certifications
CURRENT VALUE: "${currentValueText || "(empty)"}"

TASK: Suggest 2-3 improvements to present certifications effectively.

Focus on:
- Adding issuing organization and dates
- Improving clarity and formatting
- Prioritizing relevant certifications

IMPORTANT:
- Examples must be clean, professional, and ATS-friendly

Return suggestions with concrete examples.`;

    case "personalInfo.linkedin":
    case "personalInfo.portfolio":
      return `
${resumeContext}${jobContext}

FIELD: ${field.includes("linkedin") ? "LinkedIn URL" : "Portfolio URL"}
CURRENT VALUE: "${currentValueText || "(empty)"}"

TASK: Suggest 2-4 improvements to optimize this professional link.

Focus on:
- Using a custom, clean URL (linkedin.com/in/yourname)
- Ensuring the profile/portfolio is up-to-date and matches the resume
- Adding a brief, keyword-rich headline to the LinkedIn profile
- Including 3-5 featured projects with metrics on the portfolio

Return suggestions with concrete examples.`;

    case "education.description":
      return `
${resumeContext}${jobContext}

FIELD: Education Description
CURRENT VALUE: "${currentValueText || "(empty)"}"

TASK: Suggest 2-4 improvements to make this education description more impactful for ATS and recruiters.

Focus on:
- Adding relevant coursework, projects, or academic achievements
- Including quantifiable outcomes (GPA, honors, research impact)
- Using strong action verbs and industry keywords
- Keeping it concise and scannable

Return suggestions with concrete, copy-paste ready examples.`;

    case "education.honors":
      return `
${resumeContext}${jobContext}

FIELD: Education Honors & Awards
CURRENT VALUE: "${currentValueText || "(empty)"}"

TASK: Suggest 2-4 improvements to showcase academic honors effectively.

Focus on:
- Adding issuing organization and date for each honor
- Including relevant details (e.g., "Top 5% of class", "Selected from 500+ applicants")
- Prioritizing honors mentioned in the job description
- Removing generic or outdated entries

Return suggestions with concrete examples.`;

    default:
      return `
${resumeContext}${jobContext}

FIELD: ${field}
CURRENT VALUE: "${currentValueText || "(empty)"}"

TASK: Suggest 2-3 highly actionable improvements to strengthen this section.

Focus on:
- Clarity and conciseness
- Strong action-oriented language
- Relevance to the job description
- Measurable impact where possible

IMPORTANT:
- Examples must be fully improved versions, not vague suggestions

Return suggestions with concrete, copy-paste ready examples.`;
  }
}
