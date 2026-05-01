"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useAuthStore } from "@/store/authStore";
import { Eye, EyeOff, Activity, ShieldCheck, Sparkles, Command } from "lucide-react";
import Link from "next/link";
import Spinner from "@/components/ui/Spinner";

const schema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .max(100, "Email must be under 100 characters")
    .toLowerCase(),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters")
    .max(72, "Password must be under 72 characters"),
  keepActive: z.boolean().optional(),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setServerError("");
    try {
      const res = await axios.post("/api/auth/login", data);
      setAuth(res.data.doctor, res.data.accessToken);
      router.push("/dashboard");
    } catch (err: any) {
      setServerError(err.response?.data?.error || "Login failed. Please check your email and password.");
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
          
          {/* Brand Identity */}
          <div className="flex flex-col items-center mb-12">
            <div className="w-16 h-16 bg-gray-900 rounded-[1.5rem] flex items-center justify-center mb-6 shadow-2xl shadow-gray-200 rotate-3 hover:rotate-0 transition-transform duration-500">
              <Activity size={32} className="text-white" />
            </div>
            <div className="text-center">
               <img 
                 src="/logo.png" 
                 alt="clindesk app" 
                 className="h-12 w-auto object-contain mx-auto" 
               />
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mt-3">Clinic Manager</p>
            </div>

          </div>

          <div className="mb-10 text-center">
            <h2 className="text-xl font-black text-gray-900 tracking-tight italic">
              Welcome Back
            </h2>
            <p className="text-xs text-gray-400 font-bold mt-1 uppercase tracking-widest">Login to your account</p>
          </div>

          {serverError && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-[11px] font-black uppercase tracking-widest rounded-2xl px-6 py-4 mb-8 italic flex items-center gap-3">
              <ShieldCheck size={16} />
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 italic">
                Email Address
              </label>
              <div className="relative group">
                <input
                  {...register("email")}
                  type="email"
                  placeholder="doctor@clinic.com"
                  className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:bg-white transition-all italic"
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-[10px] font-black uppercase italic ml-4">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 italic">
                Password
              </label>
              <div className="relative group">
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••••"
                  className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:bg-white transition-all pr-14 italic"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-900 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-[10px] font-black uppercase italic ml-4">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Global Actions */}
            <div className="flex items-center justify-between px-2 pt-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  {...register("keepActive")}
                  type="checkbox"
                  className="w-5 h-5 rounded-md border-gray-200 text-gray-900 focus:ring-gray-900 cursor-pointer"
                />
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-gray-900 transition-colors italic">Keep Active</span>
              </label>
              <Link
                href="/forgot-password"
                className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline italic"
              >
                Forgot Password
              </Link>
            </div>

            <button
               type="submit"
               disabled={loading}
               className="w-full py-7 bg-gray-900 text-white rounded-2xl text-xs font-black uppercase tracking-[0.3em] shadow-[0_20px_50px_rgba(0,0,0,0.2)] hover:bg-black transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-wait relative overflow-hidden group/btn"
             >
               <span className="flex items-center justify-center gap-3 relative z-10 italic">
                  {loading ? (
                    <Spinner size="sm" color="white" />
                  ) : (
                    <>
                      <Command size={18} />
                      Login to Dashboard
                    </>
                  )}
               </span>
            </button>
          </form>

          <p className="text-center text-[10px] font-black text-gray-400 mt-12 uppercase tracking-[0.2em] italic">
            Don't have an account?{" "}
            <Link href="/signup" className="text-blue-600 hover:underline">
              Sign Up
            </Link>
          </p>

          </div>
      </div>
    </div>
  );
}
