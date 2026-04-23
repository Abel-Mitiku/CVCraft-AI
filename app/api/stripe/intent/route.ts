import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { planId } = await req.json();
    const amounts: Record<string, number> = { pro: 1200, business: 2900 };
    if (!amounts[planId])
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amounts[planId],
      currency: "usd",
      payment_method_types: ["card"],
      metadata: { planId },
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
