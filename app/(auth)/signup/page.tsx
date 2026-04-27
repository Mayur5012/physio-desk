"use client";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useAuthStore } from "@/store/authStore";
import { Eye, EyeOff, Activity, ShieldCheck, Sparkles, UserPlus } from "lucide-react";
import Link from "next/link";
import Spinner from "@/components/ui/Spinner";
import PhoneInput from "@/components/ui/PhoneInput";
import { validatePhoneForCountry, getCountryByCode, cleanPhoneNumber, formatPhoneWithCountry } from "@/lib/phoneValidation";

const schema = z
  .object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(60, "Name must be under 60 characters")
      .regex(/^[a-zA-Z\s.'-]+$/, "Name can only contain letters, spaces, dots, hyphens, apostrophes"),

    clinicName: z
      .string()
      .min(2, "Clinic name must be at least 2 characters")
      .max(100, "Clinic name must be under 100 characters")
      .regex(/^[a-zA-Z0-9\s.,'&()-]+$/, "Clinic name contains invalid characters"),

    email: z
      .string()
      .min(1, "Email is required")
      .email("Enter a valid email address")
      .max(100, "Email must be under 100 characters")
      .toLowerCase(),

    phoneCode: z
      .string()
      .min(1, "Select a country code"),

    phone: z
      .string()
      .min(1, "Phone number is required"),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(72, "Password must be under 72 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),

    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((d) => {
    const country = getCountryByCode(d.phoneCode);
    if (!country) return false;
    const cleanedPhone = cleanPhoneNumber(d.phone);
    return validatePhoneForCountry(cleanedPhone, country);
  }, {
    message: "Invalid phone number for the selected country",
    path: ["phone"],
  });

type FormData = z.infer<typeof schema>;

export default function SignupPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({ 
    resolver: zodResolver(schema),
    defaultValues: {
      phoneCode: "IN",
    }
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setServerError("");
    try {
      const country = getCountryByCode(data.phoneCode);
      const formattedPhone = formatPhoneWithCountry(data.phone, country!);
      
      const res = await axios.post("/api/auth/signup", {
        name:       data.name,
        clinicName: data.clinicName,
        email:      data.email,
        phoneCode:  data.phoneCode,
        phone:      data.phone,
        fullPhone:  formattedPhone,
        password:   data.password,
      });
      setAuth(res.data.doctor, res.data.accessToken);
      router.push("/dashboard");
    } catch (err: any) {
      setServerError(err.response?.data?.error || "Failed to create account. Please try again.");
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

      <div className="bg-white/80 backdrop-blur-2xl rounded-[3rem] shadow-[0_40px_100px_rgba(0,0,0,0.06)] border border-white w-full max-w-2xl overflow-hidden relative z-10 transition-all duration-700">
        <div className="p-8 md:p-12">
          
          {/* Brand Identity */}
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-gray-900 rounded-2xl flex items-center justify-center shadow-xl shadow-gray-200 rotate-3">
                 <Activity size={24} className="text-white" />
               </div>
               <div>
                  <h1 className="text-2xl font-black text-gray-900 tracking-tighter italic">
                    Clin<span className="text-blue-600">Desk</span>
                  </h1>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] leading-none">Clinic Manager</p>
               </div>
            </div>
          </div>

          <div className="mb-10">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight italic flex items-center gap-3">
              Create New Account<span className="text-blue-600">.</span>
            </h2>
            <p className="text-xs text-gray-400 font-bold mt-1 uppercase tracking-widest">Start managing your clinic today</p>
          </div>

          {serverError && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-[11px] font-black uppercase tracking-widest rounded-2xl px-6 py-4 mb-8 italic">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {/* Full Name */}
               <div className="space-y-1.5">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 italic">Doctor Name</label>
                 <input
                   {...register("name")}
                   type="text"
                   placeholder="Dr. Julian Vane"
                   className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:bg-white transition-all italic"
                 />
                 {errors.name && <p className="text-red-500 text-[10px] font-black uppercase italic ml-4">{errors.name.message}</p>}
               </div>

               {/* Clinic Name */}
               <div className="space-y-1.5">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 italic">Clinic Name</label>
                 <input
                   {...register("clinicName")}
                   type="text"
                   placeholder="Vane Rehab Center"
                   className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:bg-white transition-all italic"
                 />
                 {errors.clinicName && <p className="text-red-500 text-[10px] font-black uppercase italic ml-4">{errors.clinicName.message}</p>}
               </div>

               {/* Email */}
               <div className="space-y-1.5">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 italic">Email Address</label>
                 <input
                   {...register("email")}
                   type="email"
                   placeholder="doctor@clinic.com"
                   className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:bg-white transition-all italic"
                 />
                 {errors.email && <p className="text-red-500 text-[10px] font-black uppercase italic ml-4">{errors.email.message}</p>}
               </div>

               {/* Phone */}
               <Controller
                 name="phoneCode"
                 control={control}
                 render={({ field }) => (
                   <Controller
                     name="phone"
                     control={control}
                     render={({ field: phoneField }) => (
                       <PhoneInput
                         phoneCode={field.value}
                         phone={phoneField.value}
                         onPhoneCodeChange={field.onChange}
                         onPhoneChange={phoneField.onChange}
                         error={errors.phone?.message}
                         placeholder="1234567890"
                       />
                     )}
                   />
                 )}
               />

               {/* Password */}
               <div className="space-y-1.5">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 italic">Password</label>
                 <div className="relative">
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
                 {errors.password && <p className="text-red-500 text-[10px] font-black uppercase italic ml-4">{errors.password.message}</p>}
               </div>

               {/* Confirm Password */}
               <div className="space-y-1.5">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 italic">Confirm Password</label>
                 <div className="relative">
                   <input
                     {...register("confirmPassword")}
                     type={showConfirmPassword ? "text" : "password"}
                     placeholder="••••••••••••"
                     className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:bg-white transition-all pr-14 italic"
                   />
                   <button
                     type="button"
                     onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                     className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-900 transition-colors"
                   >
                     {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                   </button>
                 </div>
                 {errors.confirmPassword && <p className="text-red-500 text-[10px] font-black uppercase italic ml-4">{errors.confirmPassword.message}</p>}
               </div>
            </div>

            <button
               type="submit"
               disabled={loading}
               className="w-full relative group bg-gray-900 mt-6 overflow-hidden text-white py-6 rounded-[1.5rem] shadow-2xl shadow-gray-200 transition-all active:scale-95 disabled:opacity-50"
            >
               <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
               <span className="relative z-10 text-xs font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3">
                  {loading ? (
                    <>
                      <Spinner size="sm" color="white" />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <UserPlus size={16} />
                      Sign Up Now
                    </>
                  )}
               </span>
            </button>
          </form>

          <p className="text-center text-[10px] font-black text-gray-400 mt-10 uppercase tracking-[0.2em] italic">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-600 hover:underline">
              Login
            </Link>
          </p>

          </div>
      </div>
    </div>
  );
}
