"use client";
import { useState } from "react";
import api from "@/lib/api";
import Spinner from "@/components/ui/Spinner";
import Toast, { useToast } from "@/components/ui/Toast";

interface Plan {
  id: string;
  name: string;
  price: number;
  duration: string;
}

const PLANS: Plan[] = [
  { id: "plan_monthly_1", name: "Monthly", price: 999, duration: "1 month" },
  { id: "plan_quarterly_3", name: "Quarterly", price: 2499, duration: "3 months" },
  { id: "plan_halfyearly_6", name: "Half Yearly", price: 4499, duration: "6 months" },
  { id: "plan_yearly_12", name: "Yearly", price: 7999, duration: "12 months" },
];

export default function SubscriptionWall({ doctorId }: { doctorId: string }) {
  const { toast, showToast, hideToast } = useToast();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleSubscribe = async (plan: Plan) => {
    setLoadingPlan(plan.id);
    try {
      // 1. Create subscription on backend
      const { data } = await api.post("/razorpay/subscription", {
        planId: plan.id,
      });

      // 2. Open Razorpay Checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        subscription_id: data.subscriptionId,
        name: "Physio Desk",
        description: `${plan.name} Subscription`,
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

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-[3rem] shadow-2xl p-12 text-center border border-gray-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-50 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-50 rounded-full -ml-32 -mb-32 blur-3xl opacity-50" />
        
        <div className="relative z-10">
          <div className="w-20 h-20 bg-orange-100 rounded-3xl flex items-center justify-center mx-auto mb-8 rotate-12">
            <span className="text-4xl">⏳</span>
          </div>
          <h2 className="text-4xl font-black text-gray-900 mb-4 italic tracking-tight">Trial Period Ended<span className="text-orange-600">.</span></h2>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-sm mb-12">Your 3-day access has expired. Please choose a plan to continue.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-left">
            {PLANS.map((plan) => (
              <div 
                key={plan.id} 
                className="p-6 rounded-3xl bg-gray-50 border border-gray-100 hover:border-orange-500 transition-all group cursor-pointer flex flex-col"
              >
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{plan.name}</p>
                <h3 className="text-2xl font-black text-gray-900 italic mb-4">₹{plan.price}</h3>
                <p className="text-xs text-gray-500 font-bold mb-6 italic">{plan.duration}</p>
                <button 
                  disabled={!!loadingPlan}
                  onClick={() => handleSubscribe(plan)}
                  className="mt-auto w-full py-3 bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl group-hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
                >
                  {loadingPlan === plan.id ? <Spinner size="sm" color="white" /> : "Subscribe"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={hideToast} />
      )}
    </div>
  );
}
