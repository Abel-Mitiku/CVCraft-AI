// "use client";

// import { useState, useEffect } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import { supabase } from "@/app/lib/supabaseClient";
// import { loadStripe } from "@stripe/stripe-js";
// import {
//   Elements,
//   PaymentElement,
//   useStripe,
//   useElements,
// } from "@stripe/react-stripe-js";
// import {
//   Check,
//   CreditCard,
//   Download,
//   AlertCircle,
//   Loader2,
//   Star,
//   X,
//   ShieldCheck,
// } from "lucide-react";

// const stripePromise = loadStripe(
//   process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
// );

// type Plan = "free" | "pro" | "business";
// type Status = "active" | "canceled" | "past_due" | "trialing";

// interface Subscription {
//   plan: Plan;
//   status: Status;
//   currentPeriodEnd: string;
//   cancelAtPeriodEnd: boolean;
// }

// interface Invoice {
//   id: string;
//   date: string;
//   description: string;
//   amount: number;
//   status: "paid" | "open";
// }

// interface PlanConfig {
//   id: Plan;
//   name: string;
//   price: string;
//   interval: string;
//   features: string[];
//   popular?: boolean;
// }

// const PLANS: PlanConfig[] = [
//   {
//     id: "free",
//     name: "Free",
//     price: "$0",
//     interval: "forever",
//     features: ["1 Resume", "Basic Templates", "PDF Export", "Email Support"],
//   },
//   {
//     id: "pro",
//     name: "Pro",
//     price: "$12",
//     interval: "/month",
//     features: [
//       "Unlimited Resumes",
//       "Premium Templates",
//       "AI Writer",
//       "Custom Colors",
//       "Priority Support",
//     ],
//     popular: true,
//   },
//   {
//     id: "business",
//     name: "Business",
//     price: "$29",
//     interval: "/month",
//     features: [
//       "Everything in Pro",
//       "Team Management",
//       "Brand Customization",
//       "API Access",
//       "Dedicated Manager",
//     ],
//   },
// ];

// function StripeCheckoutForm({
//   onSuccess,
//   onError,
// }: {
//   onSuccess: (piId: string) => void;
//   onError: (msg: string) => void;
// }) {
//   const stripe = useStripe();
//   const elements = useElements();
//   const [processing, setProcessing] = useState(false);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!stripe || !elements) return;

//     setProcessing(true);
//     const { error, paymentIntent } = await stripe.confirmPayment({
//       elements,
//       confirmParams: { return_url: window.location.origin },
//       redirect: "if_required",
//     });

//     if (error) {
//       onError(error.message || "Payment failed");
//       setProcessing(false);
//     } else if (paymentIntent?.status === "succeeded") {
//       onSuccess(paymentIntent.id);
//     } else {
//       onError("Payment could not be confirmed");
//       setProcessing(false);
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit} className="space-y-5">
//       <PaymentElement
//         options={{
//           layout: "tabs",
//           defaultValues: { billingDetails: { name: "" } },
//         }}
//       />
//       <button
//         type="submit"
//         disabled={!stripe || processing}
//         className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
//       >
//         {processing ? (
//           <Loader2 className="w-4 h-4 animate-spin" />
//         ) : (
//           "Pay & Upgrade"
//         )}
//       </button>
//     </form>
//   );
// }

// export function BillingClientPage() {
//   const router = useRouter();
//   const searchParams = useSearchParams();

//   const [loading, setLoading] = useState(true);
//   const [subscription, setSubscription] = useState<Subscription | null>(null);
//   const [invoices, setInvoices] = useState<Invoice[]>([]);
//   const [processing, setProcessing] = useState<string | null>(null);
//   const [toast, setToast] = useState<{
//     type: "success" | "error" | "info";
//     msg: string;
//   } | null>(null);
//   const [userId, setUserId] = useState<string | null>(null);

//   const [showStripeModal, setShowStripeModal] = useState(false);
//   const [clientSecret, setClientSecret] = useState<string | null>(null);
//   const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

//   const normalizeSubscription = (sub: any): Subscription => ({
//     plan: sub?.plan_id || sub?.plan || "free",
//     status: sub?.status || "active",
//     currentPeriodEnd: sub?.current_period_end || sub?.currentPeriodEnd || "",
//     cancelAtPeriodEnd:
//       sub?.cancel_at_period_end || sub?.cancelAtPeriodEnd || false,
//   });

//   useEffect(() => {
//     const success = searchParams.get("success");
//     const plan = searchParams.get("plan");
//     if (success === "true" && plan) {
//       showToast(
//         "success",
//         `✅ Successfully upgraded to ${plan.charAt(0).toUpperCase() + plan.slice(1)}!`,
//       );
//       router.replace("/dashboard/billing");
//     }
//   }, [searchParams, router]);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const {
//           data: { session },
//         } = await supabase.auth.getSession();
//         if (!session) {
//           router.push("/login");
//           return;
//         }
//         setUserId(session.user.id);

//         const res = await fetch("/api/billing", {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${session.access_token}`,
//           },
//           body: JSON.stringify({ userId: session.user.id }),
//         });
//         const result = await res.json();
//         console.log("📡 Billing API response:", result);

//         if (!res.ok) throw new Error(result.error || "Failed to load data");

//         const normalizedSub = normalizeSubscription(result.subscription);
//         console.log("🎯 Normalized subscription:", normalizedSub);

//         setSubscription(normalizedSub);
//         setInvoices(result.invoices || []);
//       } catch (err: any) {
//         console.error("❌ Fetch error:", err);
//         showToast("error", err.message);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchData();
//   }, [router]);

//   const showToast = (type: "success" | "error" | "info", msg: string) => {
//     setToast({ type, msg });
//     setTimeout(() => setToast(null), 3000);
//   };

//   const initiatePlanChange = async (targetPlan: Plan) => {
//     const currentPlan = subscription?.plan || "free";

//     if (targetPlan === currentPlan) {
//       showToast("info", `You're already on the ${currentPlan} plan`);
//       return;
//     }

//     if (targetPlan === "free") {
//       if (
//         confirm(
//           "Downgrade to Free? You'll lose Pro/Business features at period end.",
//         )
//       ) {
//         await handleDowngradeToFree();
//       }
//       return;
//     }

//     setSelectedPlan(targetPlan);
//     setProcessing(targetPlan);

//     try {
//       const res = await fetch("/api/stripe/intent", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ planId: targetPlan, currentPlan }),
//       });
//       const data = await res.json();

//       if (data.clientSecret) {
//         setClientSecret(data.clientSecret);
//         setShowStripeModal(true);
//       } else {
//         showToast("error", data.error || "Failed to initialize payment");
//       }
//     } catch {
//       showToast("error", "Network error");
//     } finally {
//       setProcessing(null);
//     }
//   };

//   const handleDowngradeToFree = async () => {
//     if (!userId) return;
//     setProcessing("free");

//     try {
//       const {
//         data: { session },
//       } = await supabase.auth.getSession();
//       const res = await fetch("/api/billing/downgrade", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${session!.access_token}`,
//         },
//         body: JSON.stringify({ userId }),
//       });
//       const data = await res.json();

//       if (data.success) {
//         showToast(
//           "success",
//           "✅ Downgraded to Free. Changes apply at period end.",
//         );
//         if (session) {
//           const res = await fetch("/api/billing", {
//             method: "POST",
//             headers: {
//               "Content-Type": "application/json",
//               Authorization: `Bearer ${session.access_token}`,
//             },
//             body: JSON.stringify({ userId }),
//           });
//           const result = await res.json();
//           setSubscription(normalizeSubscription(result.subscription));
//           setInvoices(result.invoices || []);
//         }
//       } else {
//         showToast("error", data.error || "Downgrade failed");
//       }
//     } catch {
//       showToast("error", "Network error during downgrade");
//     } finally {
//       setProcessing(null);
//     }
//   };

//   const handlePaymentSuccess = async (paymentIntentId: string) => {
//     if (!selectedPlan || !userId) return;
//     setProcessing(selectedPlan);
//     console.log("Handle payment success called");

//     try {
//       const res = await fetch("/api/billing/confirm", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ userId, planId: selectedPlan, paymentIntentId }),
//       });
//       const data = await res.json();
//       console.log("Confirm response:", data);

//       if (data.success) {
//         setShowStripeModal(false);
//         setClientSecret(null);
//         setSelectedPlan(null);
//         showToast("success", `✅ Successfully upgraded to ${selectedPlan}!`);
//         const {
//           data: { session },
//         } = await supabase.auth.getSession();
//         if (session) {
//           const res = await fetch("/api/billing", {
//             method: "POST",
//             headers: {
//               "Content-Type": "application/json",
//               Authorization: `Bearer ${session.access_token}`,
//             },
//             body: JSON.stringify({ userId }),
//           });
//           const result = await res.json();
//           setSubscription(normalizeSubscription(result.subscription));
//           setInvoices(result.invoices || []);
//         }
//       } else {
//         showToast("error", data.error || "Failed to activate subscription");
//       }
//     } catch {
//       showToast("error", "Activation failed");
//     } finally {
//       setProcessing(null);
//     }
//   };

//   const openPortal = async () => {
//     if (!userId) return;
//     setProcessing("portal");
//     try {
//       const {
//         data: { session },
//       } = await supabase.auth.getSession();
//       const res = await fetch("/api/stripe/portal", {
//         method: "POST",
//         headers: { Authorization: `Bearer ${session!.access_token}` },
//         body: JSON.stringify({ userId }),
//       });
//       const data = await res.json();
//       if (data.url) window.location.href = data.url;
//       else showToast("error", data.error || "Portal failed");
//     } catch {
//       showToast("error", "Network error");
//     } finally {
//       setProcessing(null);
//     }
//   };

//   const getButtonText = (planId: Plan) => {
//     const current = subscription?.plan || "free";
//     if (planId === current) return "Current Plan";
//     if (planId === "free") return "Downgrade to Free";
//     if (current === "free") return "Upgrade";
//     if (current === "pro" && planId === "business")
//       return "Upgrade to Business";
//     if (current === "business" && planId === "pro") return "Downgrade to Pro";
//     return "Change Plan";
//   };

//   const isButtonDisabled = (planId: Plan) => {
//     const current = subscription?.plan || "free";
//     return planId === current || processing === planId;
//   };

//   if (loading || !userId) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50">
//         <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 relative">
//       {toast && (
//         <div
//           className={`fixed top-4 right-4 px-4 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2 transition-all ${
//             toast.type === "success"
//               ? "bg-green-100 text-green-800"
//               : toast.type === "error"
//                 ? "bg-red-100 text-red-800"
//                 : "bg-blue-100 text-blue-800"
//           }`}
//         >
//           {toast.type === "success" ? (
//             <Check className="w-5 h-5" />
//           ) : (
//             <AlertCircle className="w-5 h-5" />
//           )}
//           {toast.msg}
//         </div>
//       )}

//       <div className="fixed top-4 left-4 px-3 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-full border border-amber-200 flex items-center gap-1">
//         <Star className="w-3 h-3" /> Portfolio Mode (Stripe Test)
//       </div>

//       <div className="max-w-5xl mx-auto space-y-8">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-900">
//             Billing & Subscription
//           </h1>
//           <p className="mt-2 text-gray-600">
//             Manage your plan, payment methods, and view invoices.
//           </p>
//         </div>

//         {subscription && (
//           <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
//             <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//               <div>
//                 <p className="text-sm font-medium text-gray-500">
//                   Current Plan
//                 </p>
//                 <div className="flex items-center gap-2 mt-1">
//                   <span className="text-2xl font-bold text-gray-900 capitalize">
//                     {subscription.plan}
//                   </span>
//                   <span
//                     className={`px-2 py-0.5 text-xs font-medium rounded-full ${subscription.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}
//                   >
//                     {subscription.status.toUpperCase()}
//                   </span>
//                 </div>
//                 {subscription.currentPeriodEnd && (
//                   <p className="text-sm text-gray-600 mt-1">
//                     {subscription.cancelAtPeriodEnd
//                       ? "Cancels on "
//                       : "Renews on "}
//                     {new Date(subscription.currentPeriodEnd).toLocaleDateString(
//                       "en-US",
//                       { month: "long", day: "numeric", year: "numeric" },
//                     )}
//                   </p>
//                 )}
//                 {subscription.cancelAtPeriodEnd &&
//                   subscription.plan !== "free" && (
//                     <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
//                       <AlertCircle className="w-3 h-3" />
//                       Your plan will change to Free on{" "}
//                       {new Date(
//                         subscription.currentPeriodEnd,
//                       ).toLocaleDateString()}
//                     </p>
//                   )}
//               </div>
//               <button
//                 onClick={openPortal}
//                 disabled={processing === "portal"}
//                 className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition disabled:opacity-50"
//               >
//                 {processing === "portal" ? (
//                   <Loader2 className="w-4 h-4 animate-spin" />
//                 ) : (
//                   <CreditCard className="w-4 h-4" />
//                 )}
//                 Manage Payment & Invoices
//               </button>
//             </div>
//           </div>
//         )}

//         <div>
//           <h2 className="text-xl font-semibold text-gray-900 mb-4">
//             Change Plan
//           </h2>
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//             {PLANS.map((plan) => {
//               const isCurrent = subscription?.plan === plan.id;
//               return (
//                 <div
//                   key={plan.id}
//                   className={`relative bg-white rounded-xl border ${plan.popular ? "border-blue-500 ring-2 ring-blue-500/20" : "border-gray-200"} p-6 shadow-sm flex flex-col`}
//                 >
//                   {plan.popular && (
//                     <span className="absolute -top-3 left-4 px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-full">
//                       Most Popular
//                     </span>
//                   )}
//                   <h3 className="text-lg font-semibold text-gray-900">
//                     {plan.name}
//                   </h3>
//                   <div className="mt-2 flex items-baseline gap-1">
//                     <span className="text-3xl font-bold text-gray-900">
//                       {plan.price}
//                     </span>
//                     <span className="text-gray-500">{plan.interval}</span>
//                   </div>
//                   <ul className="mt-4 space-y-3 flex-1">
//                     {plan.features.map((f, i) => (
//                       <li
//                         key={i}
//                         className="flex items-start gap-2 text-sm text-gray-600"
//                       >
//                         <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
//                         {f}
//                       </li>
//                     ))}
//                   </ul>
//                   <button
//                     onClick={() => initiatePlanChange(plan.id)}
//                     disabled={isButtonDisabled(plan.id)}
//                     className={`mt-6 w-full py-2 px-4 rounded-lg font-medium transition flex items-center justify-center gap-2 ${
//                       isCurrent
//                         ? "bg-green-100 text-green-700 cursor-default"
//                         : "bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
//                     }`}
//                   >
//                     {processing === plan.id ? (
//                       <Loader2 className="w-4 h-4 animate-spin" />
//                     ) : (
//                       getButtonText(plan.id)
//                     )}
//                   </button>
//                 </div>
//               );
//             })}
//           </div>
//         </div>

//         {invoices.length > 0 && (
//           <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
//             <div className="px-6 py-4 border-b border-gray-200">
//               <h2 className="text-lg font-semibold text-gray-900">
//                 Billing History
//               </h2>
//             </div>
//             <div className="overflow-x-auto">
//               <table className="w-full text-sm text-left">
//                 <thead className="bg-gray-50 text-gray-500 font-medium">
//                   <tr>
//                     <th className="px-6 py-3">Date</th>
//                     <th className="px-6 py-3">Description</th>
//                     <th className="px-6 py-3">Amount</th>
//                     <th className="px-6 py-3">Status</th>
//                     <th className="px-6 py-3 text-right">Invoice</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-gray-200">
//                   {invoices.map((inv) => (
//                     <tr key={inv.id} className="hover:bg-gray-50">
//                       <td className="px-6 py-4 text-gray-600">
//                         {new Date(inv.date).toLocaleDateString()}
//                       </td>
//                       <td className="px-6 py-4 font-medium text-gray-900">
//                         {inv.description}
//                       </td>
//                       <td className="px-6 py-4 text-gray-900">
//                         ${(inv.amount / 100).toFixed(2)}
//                       </td>
//                       <td className="px-6 py-4">
//                         <span
//                           className={`px-2 py-1 text-xs font-medium rounded-full ${inv.status === "paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
//                         >
//                           {inv.status}
//                         </span>
//                       </td>
//                       <td className="px-6 py-4 text-right">
//                         <button
//                           className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium"
//                           onClick={() => showToast("info", "Mock PDF download")}
//                         >
//                           <Download className="w-4 h-4" /> PDF
//                         </button>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         )}
//       </div>

//       {showStripeModal && clientSecret && (
//         <div
//           className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200"
//           onClick={(e) =>
//             e.target === e.currentTarget && setShowStripeModal(false)
//           }
//         >
//           <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
//             <div className="flex items-center justify-between p-4 border-b bg-gray-50">
//               <div className="flex items-center gap-2">
//                 <ShieldCheck className="w-5 h-5 text-green-600" />
//                 <h2 className="font-semibold text-gray-900">Secure Checkout</h2>
//               </div>
//               <button
//                 title="close"
//                 onClick={() => {
//                   setShowStripeModal(false);
//                   setClientSecret(null);
//                 }}
//                 className="p-1.5 hover:bg-gray-200 rounded-lg transition"
//               >
//                 <X className="w-4 h-4 text-gray-500" />
//               </button>
//             </div>
//             <div className="p-5">
//               <Elements
//                 stripe={stripePromise}
//                 options={{ clientSecret, appearance: { theme: "flat" } }}
//               >
//                 <StripeCheckoutForm
//                   onSuccess={handlePaymentSuccess}
//                   onError={(msg) => showToast("error", msg)}
//                 />
//               </Elements>
//               <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
//                 <ShieldCheck className="w-3.5 h-3.5" /> Encrypted by Stripe •
//                 Test Mode (Use `4242 4242 4242 4242`)
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
