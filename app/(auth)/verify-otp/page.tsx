"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { ShieldCheck, ArrowLeft, Clock, RefreshCw } from "lucide-react";
import Link from "next/link";
import Spinner from "@/components/ui/Spinner";

const schema = z.object({
  otp: z
    .string()
    .length(6, "OTP must be exactly 6 digits")
    .regex(/^\d{6}$/, "OTP must contain only numbers"),
});

type FormData = z.infer<typeof schema>;

export default function OTPVerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [resending, setResending] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setServerError("");
    try {
      const res = await axios.post("/api/auth/verify-otp", {
        email,
        otp: data.otp,
      });

      // Redirect to reset password page
      router.push(
        `/reset-password?email=${encodeURIComponent(email)}&token=${encodeURIComponent(
          res.data.resetToken
        )}`
      );
    } catch (err: any) {
      setServerError(
        err.response?.data?.error || "Failed to verify OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResending(true);
    try {
      await axios.post("/api/auth/forgot-password", { email });
      setTimeLeft(300); // Reset timer
      setServerError("");
    } catch (err: any) {
      setServerError("Failed to resend OTP. Please try again.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div suppressHydrationWarning className="min-h-screen bg-gray-50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-100/50 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-100/50 rounded-full blur-[120px]" />
      </div>

      <div className="bg-white/80 backdrop-blur-2xl rounded-[3rem] shadow-[0_40px_100px_rgba(0,0,0,0.06)] border border-white w-full max-w-lg overflow-hidden relative z-10 transition-all duration-700">
        <div className="p-10 md:p-14">
          
          {/* Header with Back Button */}
          <div className="flex items-center gap-4 mb-12">
            <Link
              href="/forgot-password"
              className="p-2.5 hover:bg-gray-100 rounded-xl transition-colors text-gray-400 hover:text-gray-900"
            >
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight italic">
                Verify OTP
              </h1>
              <p className="text-xs text-gray-400 font-bold mt-1 uppercase tracking-widest">
                Check your email for OTP
              </p>
            </div>
          </div>

          {serverError && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-[11px] font-black uppercase tracking-widest rounded-2xl px-6 py-4 mb-8 italic flex items-center gap-3">
              <ShieldCheck size={16} />
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email Display */}
            <div className="bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">
                Verification Code Sent To
              </p>
              <p className="text-sm font-bold text-gray-900 mt-2">{email}</p>
            </div>

            {/* OTP Input */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 italic">
                6-Digit OTP Code
              </label>
              <input
                {...register("otp")}
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-center text-2xl font-black tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:bg-white transition-all italic"
              />
              {errors.otp && (
                <p className="text-red-500 text-[10px] font-black uppercase italic ml-4">
                  {errors.otp.message}
                </p>
              )}
            </div>

            {/* Timer */}
            <div className={`flex items-center gap-2 px-4 py-3 rounded-xl ${
              timeLeft < 60 ? "bg-orange-50 border border-orange-100" : "bg-blue-50 border border-blue-100"
            }`}>
              <Clock size={16} className={timeLeft < 60 ? "text-orange-600" : "text-blue-600"} />
              <span className={`text-[11px] font-black uppercase tracking-widest italic ${
                timeLeft < 60 ? "text-orange-600" : "text-blue-600"
              }`}>
                {timeLeft > 0 ? `OTP expires in ${formatTime(timeLeft)}` : "OTP has expired"}
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || timeLeft <= 0}
              className="w-full py-7 bg-gray-900 text-white rounded-2xl text-xs font-black uppercase tracking-[0.3em] shadow-[0_20px_50px_rgba(0,0,0,0.2)] hover:bg-black transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-wait relative overflow-hidden"
            >
              <span className="flex items-center justify-center gap-3 relative z-10 italic">
                {loading ? (
                  <>
                    <Spinner size="sm" color="white" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <ShieldCheck size={18} />
                    Verify OTP
                  </>
                )}
              </span>
            </button>

            {/* Resend OTP */}
            <div className="text-center">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">
                Didn't receive OTP?
              </p>
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={resending || timeLeft > 120}
                className="text-blue-600 hover:underline text-[11px] font-black uppercase tracking-widest italic mt-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mx-auto"
              >
                {resending ? (
                  <>
                    <Spinner size="sm" color="blue" />
                    Resending...
                  </>
                ) : (
                  <>
                    <RefreshCw size={14} />
                    Resend OTP
                  </>
                )}
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}


