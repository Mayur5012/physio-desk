"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useAuthStore } from "@/store/authStore";
import { Eye, EyeOff, Stethoscope } from "lucide-react";

const schema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Minimum 6 characters"),
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
      setServerError(err.response?.data?.error || "Login failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center 
                    justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 
                      w-full max-w-md p-8">

        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-blue-600 text-white p-3 rounded-xl mb-3">
            <Stethoscope size={28} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">PhysioDesk</h1>
          <p className="text-sm text-gray-500 mt-1">Clinic Management System</p>
        </div>

        <h2 className="text-lg font-semibold text-gray-800 mb-6">
          Welcome back
        </h2>

        {serverError && (
          <div className="bg-red-50 border border-red-200 text-red-700 
                          text-sm rounded-lg px-4 py-3 mb-5">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Email
            </label>
            <input
              {...register("email")}
              type="email"
              placeholder="doctor@clinic.com"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg 
                         text-sm focus:outline-none focus:ring-2 
                         focus:ring-blue-500 focus:border-transparent transition"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg 
                           text-sm focus:outline-none focus:ring-2 
                           focus:ring-blue-500 focus:border-transparent 
                           transition pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 
                           text-gray-400 hover:text-gray-600 transition"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Remember + Forgot */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm 
                               text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-gray-300 
                           text-blue-600 focus:ring-blue-500"
              />
              Remember me
            </label>
            <a
              href="/forgot-password"
              className="text-sm text-blue-600 hover:underline"
            >
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 
                       disabled:bg-blue-400 text-white font-medium 
                       py-2.5 rounded-lg transition-colors duration-150 
                       text-sm"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have an account?{" "}
          <a href="/signup"
             className="text-blue-600 font-medium hover:underline">
            Sign Up
          </a>
        </p>
      </div>
    </div>
  );
}
