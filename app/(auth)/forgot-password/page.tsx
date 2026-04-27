"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Mail, ArrowLeft, ShieldCheck } from "lucide-react";
import Link from "next/link";
import Spinner from "@/components/ui/Spinner";

const schema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .max(100, "Email must be under 100 characters")
    .toLowerCase(),
});

type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const emailValue = watch("email");

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setServerError("");
    setSuccessMessage("");
    try {
      const res = await axios.post("/api/auth/forgot-password", data);
      setSuccessMessage("OTP sent to your email!");
      
      // Redirect to OTP verification after 2 seconds
      setTimeout(() => {
        router.push(`/verify-otp?email=${encodeURIComponent(data.email)}`);
      }, 2000);
    } catch (err: any) {
      setServerError(err.response?.data?.error || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 relative overflow-hidden">
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
              href="/login"
              className="p-2.5 hover:bg-gray-100 rounded-xl transition-colors text-gray-400 hover:text-gray-900"
            >
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight italic">
                Reset Password
              </h1>
              <p className="text-xs text-gray-400 font-bold mt-1 uppercase tracking-widest">Enter your email to receive OTP</p>
            </div>
          </div>

          {serverError && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-[11px] font-black uppercase tracking-widest rounded-2xl px-6 py-4 mb-8 italic flex items-center gap-3">
              <ShieldCheck size={16} />
              {serverError}
            </div>
          )}

          {successMessage && (
            <div className="bg-green-50 border border-green-100 text-green-600 text-[11px] font-black uppercase tracking-widest rounded-2xl px-6 py-4 mb-8 italic flex items-center gap-3">
              <ShieldCheck size={16} />
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 italic">
                Registered Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 size-4" />
                <input
                  {...register("email")}
                  type="email"
                  placeholder="doctor@clinic.com"
                  className="w-full pl-14 pr-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:bg-white transition-all italic"
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-[10px] font-black uppercase italic ml-4">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Info Message */}
            <div className="bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3.5">
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest italic">
                💡 We'll send a 6-digit OTP to your email that's valid for 5 minutes.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !emailValue}
              className="w-full py-7 bg-gray-900 text-white rounded-2xl text-xs font-black uppercase tracking-[0.3em] shadow-[0_20px_50px_rgba(0,0,0,0.2)] hover:bg-black transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-wait relative overflow-hidden group/btn"
            >
              <span className="flex items-center justify-center gap-3 relative z-10 italic">
                {loading ? (
                  <>
                    <Spinner size="sm" color="white" />
                    Sending OTP...
                  </>
                ) : (
                  <>
                    <Mail size={18} />
                    Send OTP
                  </>
                )}
              </span>
            </button>
          </form>

          <p className="text-center text-[10px] font-black text-gray-400 mt-10 uppercase tracking-[0.2em] italic">
            Remember your password?{" "}
            <Link href="/login" className="text-blue-600 hover:underline">
              Login
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}
