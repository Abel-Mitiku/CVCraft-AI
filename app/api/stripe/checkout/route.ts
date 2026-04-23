import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId, planId } = await req.json();
    if (!userId || !planId || planId === "free") {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    await new Promise((r) => setTimeout(r, 1200));

    const planMap: Record<string, { name: string; amount: number }> = {
      pro: { name: "Pro Plan - Monthly", amount: 1200 },
      business: { name: "Business Plan - Monthly", amount: 2900 },
    };
    const plan = planMap[planId] || planMap.pro;

    const subscriptionId = `sub_${Math.random().toString(36).slice(2, 11)}`;
    const invoiceId = `inv_${Math.random().toString(36).slice(2, 11)}`;
    const periodEnd = new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000,
    ).toISOString();

    console.log(userId, planId);
    await supabaseAdmin
      .from("profiles")
      .update({
        plan: planId,
      })
      .eq("id", userId);

    await supabaseAdmin.from("subscriptions").upsert({
      id: subscriptionId,
      user_id: userId,
      status: "active",
      plan_id: planId,
      current_period_end: periodEnd,
      cancel_at_period_end: false,
    });

    await supabaseAdmin.from("invoices").insert({
      id: invoiceId,
      stripe_customer_id: `cus_mock_${userId.slice(0, 8)}`,
      date: new Date().toISOString(),
      description: plan.name,
      amount: plan.amount,
      status: "paid",
      pdf_url: `/mock/invoices/${invoiceId}.pdf`,
    });

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    return NextResponse.json({
      success: true,
      url: `${baseUrl}/dashboard/billing?success=true&plan=${planId}`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Checkout failed" },
      { status: 500 },
    );
  }
}
