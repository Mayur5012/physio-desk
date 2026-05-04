"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import Spinner from "@/components/ui/Spinner";
import Toast, { useToast } from "@/components/ui/Toast";
import { detectCountry, getPricingForCountry } from "@/lib/pricing";

interface Plan {
  id: string;
  name: string;
  price: number;
  duration: string;
  label: string;
}

export default function SubscriptionWall({ doctorId }: { doctorId: string }) {
  const { toast, showToast, hideToast } = useToast();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [pricing, setPricing] = useState<any>(null);
  const [countryCode, setCountryCode] = useState<string>("US");

  useEffect(() => {
    async function initPricing() {
      const code = await detectCountry();
      setCountryCode(code);
      setPricing(getPricingForCountry(code));
    }
    initPricing();
  }, []);

  const handleSubscribe = async (planKey: string, planData: any) => {
    setLoadingPlan(planKey);
    try {
      // 1. Create subscription on backend
      const { data } = await api.post("/razorpay/subscription", {
        planId: `plan_${planKey}`,
        countryCode: countryCode,
      });

      // 2. Open Razorpay Checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        subscription_id: data.subscriptionId,
        name: "Clindesk",
        description: `${planData.label} Subscription`,
        image: "/logo.png",
        handler: async function (response: any) {
          // Verify payment on backend
          try {
            await api.post("/razorpay/verify", {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_subscription_id: response.razorpay_subscription_id,
              razorpay_signature: response.razorpay_signature,
            });
            showToast("Subscription activated! Welcome back.", "success");
            setTimeout(() => window.location.reload(), 1500);
          } catch (err) {
            showToast("Payment verification failed. Please contact support.", "error");
          }
        },
        modal: {
          ondismiss: function() {
            showToast("Payment cancelled", "error");
            setLoadingPlan(null);
          }
        },
        prefill: {
          name: "",
          email: "",
          contact: "",
        },
        theme: {
          color: "#2563eb",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Subscription error:", error);
      alert("Failed to initiate subscription. Please try again.");
    } finally {
      setLoadingPlan(null);
    }
  };

  if (!pricing) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Spinner size="lg" color="blue" />
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="max-w-5xl w-full bg-white rounded-[3rem] shadow-2xl p-12 text-center border border-gray-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-50 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-50 rounded-full -ml-32 -mb-32 blur-3xl opacity-50" />
        
        <div className="relative z-10">
          <div className="w-20 h-20 bg-orange-100 rounded-3xl flex items-center justify-center mx-auto mb-8 rotate-12">
            <span className="text-4xl">⏳</span>
          </div>
          <h2 className="text-4xl font-black text-gray-900 mb-4 italic tracking-tight">Trial Period Ended<span className="text-orange-600">.</span></h2>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-sm mb-4">Your 3-day access has expired. Please choose a plan to continue.</p>
          
          <div className="inline-flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-full border border-gray-100 text-xs font-bold text-gray-400 mb-12">
             <span>🌍</span> Showing prices for <strong>{pricing.name} ({pricing.currency})</strong>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left max-w-6xl mx-auto">
            {Object.entries(pricing.plans)
              .filter(([key]) => {
                // Only show "test" plan if ?test=true is in the URL
                if (key === 'test') {
                  const params = new URLSearchParams(window.location.search);
                  return params.get('test') === 'true';
                }
                return true;
              })
              .map(([key, plan]: [string, any]) => {
                const monthlyPrice = pricing.plans["1"].amount;
                const isTest = key === 'test';
                const planDuration = isTest ? 1 : parseInt(key);
                const totalMonthlyCost = monthlyPrice * planDuration;
                const savings = isTest ? 0 : (totalMonthlyCost - plan.amount);
                const savingsPercent = totalMonthlyCost > 0 ? Math.round((savings / totalMonthlyCost) * 100) : 0;
                const isBestValue = key === '6';

              return (
                <div 
                  key={key} 
                  className={`clindesk-card p-10 flex flex-col relative group ${
                    isBestValue ? 'ring-2 ring-blue-600 scale-105 z-10 shadow-2xl shadow-blue-100' : 'hover:scale-[1.02]'
                  }`}
                >
                  {isBestValue && (
                    <div className="absolute top-0 right-0 bg-gradient-to-br from-blue-600 to-indigo-600 text-white text-[9px] font-black px-6 py-2 rounded-bl-3xl uppercase tracking-[0.2em] italic shadow-lg">
                      Best Value
                    </div>
                  )}

                  <div className="mb-8">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 italic">
                      {plan.label}
                    </p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-black text-slate-400">{pricing.symbol}</span>
                      <span className="text-5xl font-black text-slate-900 italic tracking-tighter">
                        {plan.amount.toLocaleString()}
                      </span>
                    </div>
                    {savings > 0 && (
                      <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest mt-3 bg-emerald-50 px-3 py-1 rounded-full w-fit italic">
                        Save {pricing.symbol}{savings.toLocaleString()} ({savingsPercent}%)
                      </p>
                    )}
                  </div>
                  
                  <ul className="space-y-4 mb-12 flex-1">
                    {[
                      "Smart Scheduling",
                      "EHR & Document Storage",
                      "GST Compliant Invoicing",
                      "Clinical Dashboard",
                      "Email Reminders",
                      "Premium Support"
                    ].map((feat) => (
                      <li key={feat} className="flex items-center gap-3 text-[11px] font-black text-slate-600 uppercase tracking-tight italic">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-600 shadow-sm" />
                        {feat}
                      </li>
                    ))}
                  </ul>

                  <button 
                    disabled={!!loadingPlan}
                    onClick={() => handleSubscribe(key, plan)}
                    className={`clindesk-btn-primary w-full shadow-2xl transition-all ${
                      isBestValue ? 'bg-blue-600 shadow-blue-200/50 hover:bg-blue-700' : ''
                    }`}
                  >
                    {loadingPlan === key ? <Spinner size="sm" color="white" /> : "Select Plan →"}
                  </button>
                </div>
              );
            })}
          </div>


          
          <p className="mt-12 text-[10px] text-gray-400 font-bold uppercase tracking-widest italic">
            Secure payments processed via Razorpay. Cancel anytime.
          </p>
        </div>
      </div>
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={hideToast} />
      )}
    </div>
  );
}

