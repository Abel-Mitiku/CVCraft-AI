import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId } = await req.json();
    if (!userId)
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });

    await new Promise((r) => setTimeout(r, 800));

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    return NextResponse.json({
      success: true,
      url: `${baseUrl}/dashboard/billing?portal=success`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Portal failed" },
      { status: 500 },
    );
  }
}
