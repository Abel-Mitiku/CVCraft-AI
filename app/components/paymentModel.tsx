"use client";

import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { X, ShieldCheck, Loader2, AlertCircle } from "lucide-react";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
);

function CheckoutForm({
  onSuccess,
  onClose,
}: {
  onSuccess: (piId: string) => void;
  onClose: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    setError(null);

    const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: window.location.origin },
      redirect: "if_required", // Handles 3D Secure inline
    });

    if (stripeError) {
      setError(stripeError.message || "Payment failed");
      setProcessing(false);
    } else if (paymentIntent?.status === "succeeded") {
      onSuccess(paymentIntent.id);
    } else {
      setError("Payment could not be confirmed");
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <PaymentElement
        options={{
          layout: "tabs",
          defaultValues: { billingDetails: { name: "" } },
        }}
      />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {processing ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          "Pay & Upgrade"
        )}
      </button>
    </form>
  );
}

export default function StripeCheckoutModal({
  isOpen,
  onClose,
  clientSecret,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  clientSecret: string | null;
  onSuccess: (paymentIntentId: string) => void;
}) {
  if (!isOpen || !clientSecret) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-green-600" />
            <h2 className="font-semibold text-gray-900">Secure Checkout</h2>
          </div>
          <button
            title="close"
            onClick={onClose}
            className="p-1.5 hover:bg-gray-200 rounded-lg transition"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="p-5">
          <Elements
            stripe={stripePromise}
            options={{ clientSecret, appearance: { theme: "flat" } }}
          >
            <CheckoutForm onSuccess={onSuccess} onClose={onClose} />
          </Elements>

          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
            <ShieldCheck className="w-3.5 h-3.5" />
            Encrypted by Stripe • Test Mode (Use `4242 4242 4242 4242`)
          </div>
        </div>
      </div>
    </div>
  );
}
