import { supabaseAdmin } from "@/app/lib/supabaseAdmin";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Missing authentication token" },
        { status: 401 },
      );
    }

    const { userId } = await req.json();
    if (!userId || typeof userId !== "string") {
      return NextResponse.json(
        { error: "Invalid or missing userId" },
        { status: 400 },
      );
    }

    const { data: profile, error: profileErr } = await supabaseAdmin
      .from("profiles")
      .select("stripe_customer_id, subscription_id,plan")
      .eq("id", userId)
      .single();

    if (profileErr || !profile) {
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 },
      );
    }

    const [subRes, invRes] = await Promise.all([
      profile.subscription_id
        ? supabaseAdmin
            .from("subscriptions")
            .select("*")
            .eq("id", profile.subscription_id)
            .single()
        : Promise.resolve({ data: null, error: null }),
      profile.stripe_customer_id
        ? supabaseAdmin
            .from("invoices")
            .select("*")
            .eq("stripe_customer_id", profile.stripe_customer_id)
            .order("date", { ascending: false })
            .limit(10)
        : Promise.resolve({ data: [], error: null }),
    ]);

    if (subRes.error || invRes.error) {
      console.error("Supabase billing error:", subRes.error || invRes.error);
      return NextResponse.json(
        { error: "Failed to fetch billing records" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      subscription: subRes.data || {
        status: "active",
        plan: profile.plan,
        currentPeriodEnd: new Date().toISOString(),
        cancelAtPeriodEnd: false,
      },
      invoices: invRes.data || [],
    });
  } catch (error) {
    console.error("Billing API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
