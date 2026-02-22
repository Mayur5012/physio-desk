"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useAuthStore } from "@/store/authStore";
import { Eye, EyeOff, Stethoscope } from "lucide-react";

const schema = z
  .object({
    name:            z.string().min(2, "Name too short"),
    clinicName:      z.string().min(2, "Clinic name too short"),
    email:           z.string().email("Invalid email"),
    phone:           z.string().min(10, "Enter valid phone number"),
    password:        z.string().min(8, "Minimum 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

export default function SignupPage() {
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
      const res = await axios.post("/api/auth/signup", {
        name:       data.name,
        clinicName: data.clinicName,
        email:      data.email,
        phone:      data.phone,
        password:   data.password,
      });
      setAuth(res.data.doctor, res.data.accessToken);
      router.push("/dashboard");
    } catch (err: any) {
      setServerError(err.response?.data?.error || "Signup failed. Try again.");
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
          <p className="text-sm text-gray-500 mt-1">Create your clinic account</p>
        </div>

        {serverError && (
          <div className="bg-red-50 border border-red-200 text-red-700 
                          text-sm rounded-lg px-4 py-3 mb-5">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Full Name
            </label>
            <input
              {...register("name")}
              type="text"
              placeholder="Dr. Ramesh Sharma"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg 
                         text-sm focus:outline-none focus:ring-2 
                         focus:ring-blue-500 focus:border-transparent transition"
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Clinic Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Clinic Name
            </label>
            <input
              {...register("clinicName")}
              type="text"
              placeholder="Sharma Physio & Wellness"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg 
                         text-sm focus:outline-none focus:ring-2 
                         focus:ring-blue-500 focus:border-transparent transition"
            />
            {errors.clinicName && (
              <p className="text-red-500 text-xs mt-1">
                {errors.clinicName.message}
              </p>
            )}
          </div>

          {/* Email + Phone row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email
              </label>
              <input
                {...register("email")}
                type="email"
                placeholder="doctor@clinic.com"
                suppressHydrationWarning
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Phone
              </label>
              <input
                {...register("phone")}
                type="tel"
                placeholder="9876543210"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg 
                           text-sm focus:outline-none focus:ring-2 
                           focus:ring-blue-500 focus:border-transparent transition"
              />
              {errors.phone && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.phone.message}
                </p>
              )}
            </div>
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
                placeholder="Minimum 8 characters"
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

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Confirm Password
            </label>
            <input
              {...register("confirmPassword")}
              type="password"
              placeholder="Re-enter password"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg 
                         text-sm focus:outline-none focus:ring-2 
                         focus:ring-blue-500 focus:border-transparent transition"
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 
                       disabled:bg-blue-400 text-white font-medium 
                       py-2.5 rounded-lg transition-colors duration-150 
                       text-sm mt-2"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <a href="/login"
             className="text-blue-600 font-medium hover:underline">
            Sign In
          </a>
        </p>
      </div>
    </div>
  );
}
