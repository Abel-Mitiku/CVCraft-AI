import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { userId, planId, paymentIntentId } = await req.json();
    if (!userId || !planId || !paymentIntentId)
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (paymentIntent.status !== "succeeded")
      return NextResponse.json(
        { error: "Payment not completed" },
        { status: 400 },
      );

    const periodEnd = new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000,
    ).toISOString();
    const subId = `sub_${Math.random().toString(36).slice(2, 11)}`;
    const invId = `inv_${Math.random().toString(36).slice(2, 11)}`;
    const amount = planId === "pro" ? 1200 : 2900;

    await supabaseAdmin.from("subscriptions").upsert({
      id: subId,
      user_id: userId,
      status: "active",
      plan_id: planId,
      current_period_end: periodEnd,
      cancel_at_period_end: false,
    });
    await supabaseAdmin.from("invoices").insert({
      id: invId,
      stripe_customer_id: `cus_${userId.slice(0, 8)}`,
      date: new Date().toISOString(),
      description: `${planId} Plan`,
      amount,
      status: "paid",
      pdf_url: "#",
    });
    await supabaseAdmin
      .from("profiles")
      .update({ plan: planId })
      .eq("id", userId);
    await supabaseAdmin
      .from("profiles")
      .update({ subscription_id: subId })
      .eq("id", userId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
