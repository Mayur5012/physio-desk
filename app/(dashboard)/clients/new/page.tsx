"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "@/lib/api";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Toast, { useToast } from "@/components/ui/Toast";
import PhoneInput from "@/components/ui/PhoneInput";
import {
  ArrowLeft, Save, User, Activity, HeartPulse, Sparkles, Command,
  ClipboardCheck, Clock, Zap, Target, Brain, Heart, Landmark,
  Leaf, Microscope, MessageSquare, Check
} from "lucide-react";
import { PRACTICE_TYPES, PRACTICE_CATEGORIES, PRACTICE_TYPE_CONFIG } from "@/lib/constants";
import { validatePhoneForCountry, getCountryByCode, cleanPhoneNumber, formatPhoneWithCountry } from "@/lib/phoneValidation";

const schema = z
  .object({
    name: z
      .string()
      .min(2, "Full Name is required")
      .max(60, "Name must be under 60 characters")
      .regex(/^[a-zA-Z\s.'-]+$/, "Name can only contain letters, spaces, dots, hyphens, apostrophes"),
    age: z
      .coerce
      .number()
      .min(1, "Age must be at least 1")
      .max(120, "Age must be 120 or less"),
    gender: z.enum(["MALE", "FEMALE", "OTHER"]),
    phoneCode: z.string().min(1, "Select country code"),
    phone: z.string().min(1, "Phone number is required"),
    email: z
      .string()
      .email("Enter a valid email")
      .max(100, "Email must be under 100 characters")
      .optional()
      .or(z.literal("")),
    address: z
      .string()
      .max(200, "Address must be under 200 characters")
      .optional(),
    emergencyContact: z
      .string()
      .max(100, "Emergency contact must be under 100 characters")
      .optional(),
    referralSource: z.string().optional(),
    chiefComplaint: z
      .string()
      .min(3, "Please describe the problem")
      .max(200, "Chief complaint must be under 200 characters"),
    bodyPart: z
      .string()
      .min(1, "Specify the body part")
      .max(100, "Body part must be under 100 characters"),
    bodySide: z.enum(["LEFT", "RIGHT", "BOTH"]),
    medicalHistory: z
      .string()
      .max(500, "Medical history must be under 500 characters")
      .optional(),
    diagnosis: z
      .string()
      .max(300, "Diagnosis must be under 300 characters")
      .optional(),
    practiceTypes: z.array(z.string()).min(1, "Select at least one service type"),
    clientType: z.enum(["NEW", "REGULAR", "ONE_TIME"]),
    totalSessionsPlanned: z.coerce.number().min(0).optional(),
    sessionFee: z.coerce.number().min(0).optional(),
    reminderEnabled: z.boolean().optional(),
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

const RADIO = "relative flex items-center gap-3 cursor-pointer group";
const RADIO_INPUT = "w-5 h-5 appearance-none border-2 border-gray-200 rounded-full checked:border-blue-600 checked:bg-blue-600 transition-all cursor-pointer";
const INPUT_STYLE = "rounded-2xl bg-gray-50/50 border-gray-100 py-4 font-bold italic focus:bg-white transition-all";
const TEXTAREA_STYLE = "w-full px-4 sm:px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl sm:rounded-3xl text-sm font-bold italic focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:bg-white transition-all resize-none shadow-sm";

const Section = ({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) => (
  <Card className="p-5 sm:p-8 lg:p-10 border-none shadow-[0_20px_60px_rgba(0,0,0,0.04)] bg-white rounded-2xl sm:rounded-[2.5rem] ring-1 ring-gray-100 overflow-visible relative">
    <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-10 pb-4 sm:pb-6 border-b border-gray-50">
       <div className="p-2.5 sm:p-3 bg-gray-900 text-white rounded-xl sm:rounded-2xl shadow-xl shadow-gray-200 rotate-3">
          <Icon size={18} />
       </div>
       <h3 className="text-[10px] sm:text-[11px] font-black text-gray-900 uppercase tracking-[0.15em] sm:tracking-[0.2em] italic">
          {title}
       </h3>
    </div>
    {children}
  </Card>
);

export default function NewClientPage() {
  const router = useRouter();
  const { toast, showToast, hideToast } = useToast();
  const [loading, setLoading] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      gender:      "MALE",
      bodySide:    "BOTH",
      practiceTypes: [PRACTICE_TYPES.PHYSIOTHERAPY],
      clientType:  "NEW",
      reminderEnabled: true,
      phoneCode:   "IN",
    },
  });

  // Controlled multi-select for service types
  const selectedTypes = watch("practiceTypes") || [];

  const toggleServiceType = (type: string) => {
    const current = selectedTypes;
    if (current.includes(type)) {
      setValue("practiceTypes", current.filter((t: string) => t !== type), { shouldValidate: true });
    } else {
      setValue("practiceTypes", [...current, type], { shouldValidate: true });
    }
  };

  const onSubmit = async (data: FormData) => {
    console.log("[NewClient] Submitting practiceTypes:", JSON.stringify(data.practiceTypes));
    setLoading(true);
    try {
      const country = getCountryByCode(data.phoneCode);
      const formattedPhone = formatPhoneWithCountry(data.phone, country!);
      
      await api.post("/clients", {
        ...data,
        fullPhone: formattedPhone,
      });
      showToast("Patient record saved successfully", "success");
      setTimeout(() => router.push("/clients"), 1200);
    } catch (err: any) {
      showToast(err.response?.data?.error || "Failed to save patient record", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-10 pb-32 relative px-1 sm:px-2">

      {/* Hero Navigation */}
      <div className="flex items-center gap-4 sm:gap-6 relative">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-100/30 rounded-full blur-3xl -z-10" />
        <button
          onClick={() => router.back()}
          className="p-3 sm:p-4 bg-white shadow-xl shadow-gray-100 rounded-xl sm:rounded-[1.25rem] hover:scale-110 transition-transform text-gray-400 hover:text-gray-900 border border-gray-50 shrink-0"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
             <span className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Registration</span>
             <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          </div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-900 tracking-tight italic">
            New Patient<span className="text-blue-600">.</span>
          </h2>
          <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-[0.15em] mt-1 truncate">Register a patient for care</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 sm:space-y-10 lg:space-y-12">

        {/* ── Personal Info ── */}
        <Section title="Personal Information" icon={User}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 sm:gap-x-10 gap-y-5 sm:gap-y-8">
            <div className="sm:col-span-2">
              <Input {...register("name")} label="Full Name" required placeholder="e.g. John Sharma" className={INPUT_STYLE} error={errors.name?.message} />
            </div>
            <Input {...register("age")} label="Age" required type="number" placeholder="34" className={INPUT_STYLE} error={errors.age?.message} />
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 sm:mb-4 italic ml-2">Gender</label>
              <div className="flex gap-4 sm:gap-8 bg-gray-50/50 p-2 rounded-xl sm:rounded-2xl border border-gray-100 w-fit">
                {["MALE", "FEMALE", "OTHER"].map((g) => (
                  <label key={g} className={RADIO}>
                    <input {...register("gender")} type="radio" value={g} className={RADIO_INPUT} />
                    <span className="text-[9px] sm:text-[10px] font-black text-gray-500 uppercase tracking-widest italic group-hover:text-gray-900 transition-colors">{g}</span>
                  </label>
                ))}
              </div>
            </div>
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
            <Input {...register("email")} label="Email Address" type="email" placeholder="john@email.com" className={INPUT_STYLE} error={errors.email?.message} />
            <div className="sm:col-span-2">
              <Input {...register("address")} label="Address" placeholder="Full address" className={INPUT_STYLE} />
            </div>
            <Input {...register("emergencyContact")} label="Emergency Contact" placeholder="Name & Phone" className={INPUT_STYLE} />
            <Select {...register("referralSource")} label="How did they find us?" className={INPUT_STYLE}
              options={[
                { value: "WORD_OF_MOUTH",  label: "Word of Mouth" },
                { value: "SOCIAL_MEDIA",   label: "Social Media" },
                { value: "DOCTOR_REFERRAL",label: "Doctor Referral" },
                { value: "ONLINE_SEARCH",  label: "Online Search" },
                { value: "OTHER",          label: "Other" },
              ]}
            />
          </div>
        </Section>

        {/* ── Medical Details ── */}
        <Section title="Medical Details" icon={Activity}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 sm:gap-x-10 gap-y-5 sm:gap-y-8">
            <div className="sm:col-span-2">
              <Input {...register("chiefComplaint")} label="Chief Complaint" required placeholder="e.g. Lower back pain" className={INPUT_STYLE} error={errors.chiefComplaint?.message} />
            </div>
            <Input {...register("bodyPart")} label="Affected Body Part" required placeholder="e.g. Lower Back" className={INPUT_STYLE} error={errors.bodyPart?.message} />
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 sm:mb-4 italic ml-2">Side</label>
              <div className="flex gap-4 sm:gap-8 bg-gray-50/50 p-2 rounded-xl sm:rounded-2xl border border-gray-100 w-fit">
                {["LEFT", "RIGHT", "BOTH"].map((s) => (
                  <label key={s} className={RADIO}>
                    <input {...register("bodySide")} type="radio" value={s} className={RADIO_INPUT} />
                    <span className="text-[9px] sm:text-[10px] font-black text-gray-500 uppercase tracking-widest italic group-hover:text-gray-900 transition-colors">{s}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 italic ml-2">Medical History</label>
              <textarea {...register("medicalHistory")} rows={3} placeholder="Past surgeries, allergies, conditions..." className={TEXTAREA_STYLE} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 italic ml-2">Diagnosis</label>
              <textarea {...register("diagnosis")} rows={2} placeholder="Professional diagnosis..." className={TEXTAREA_STYLE} />
            </div>
          </div>
        </Section>

        {/* ── Service Type Selection (CONTROLLED MULTI-SELECT) ── */}
        <Section title="Service Type" icon={HeartPulse}>
          <div className="space-y-8">
            {/* Selected count indicator */}
            <div className="flex items-center justify-between px-1">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">
                {selectedTypes.length > 0 ? `${selectedTypes.length} service${selectedTypes.length > 1 ? 's' : ''} selected` : 'No service selected'}
              </p>
              {errors.practiceTypes && (
                <p className="text-[10px] font-black text-red-500 uppercase tracking-widest italic">{errors.practiceTypes.message}</p>
              )}
            </div>

            {/* Selected badges */}
            {selectedTypes.length > 0 && (
              <div className="flex flex-wrap gap-2 p-3 sm:p-4 bg-blue-50/50 rounded-xl sm:rounded-2xl border border-blue-100">
                {selectedTypes.map((type: string) => {
                  const config = PRACTICE_TYPE_CONFIG[type as keyof typeof PRACTICE_TYPE_CONFIG];
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => toggleServiceType(type)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest italic hover:bg-blue-700 transition-colors group"
                    >
                      {config?.label || type}
                      <span className="opacity-60 group-hover:opacity-100 transition-opacity">&times;</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Category grid */}
            {Object.entries(PRACTICE_CATEGORIES).map(([cat, types]) => (
              <div key={cat} className="space-y-4">
                <h5 className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] sm:tracking-[0.3em] px-1 sm:px-2 flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                   {cat.replace(/_/g, " ")}
                </h5>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
                  {types.map((type) => {
                    const config = PRACTICE_TYPE_CONFIG[type as keyof typeof PRACTICE_TYPE_CONFIG];
                    const isSelected = selectedTypes.includes(type);
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => toggleServiceType(type)}
                        className={`relative p-3 sm:p-4 lg:p-5 rounded-xl sm:rounded-2xl border transition-all text-center group ${
                          isSelected
                            ? "border-blue-600 bg-blue-50 shadow-xl shadow-blue-100 ring-1 ring-blue-200"
                            : "border-gray-100 bg-white shadow-sm hover:bg-gray-50 hover:border-gray-200"
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 bg-blue-600 text-white p-0.5 sm:p-1 rounded-full">
                            <Check size={8} className="sm:w-[10px] sm:h-[10px]" />
                          </div>
                        )}
                        <p className={`text-[8px] sm:text-[9px] font-black uppercase tracking-wider sm:tracking-widest italic leading-tight ${
                          isSelected ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600"
                        } transition-colors`}>
                          {config?.label || type}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* ── Visit Setup ── */}
        <Section title="Visit Configuration" icon={Clock}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 sm:gap-x-10 gap-y-5 sm:gap-y-8">
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 sm:mb-4 italic ml-2">Visit Plan</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                {[
                  { value: "NEW",      label: "New Cycle",   desc: "Complete evaluation" },
                  { value: "REGULAR",  label: "Follow-up",   desc: "Part of existing plan" },
                  { value: "ONE_TIME", label: "Single Visit", desc: "One-off consultation" },
                ].map((v) => (
                  <label key={v.value} className="relative cursor-pointer group">
                    <input {...register("clientType")} type="radio" value={v.value} className="peer sr-only" />
                    <div className="p-4 sm:p-5 lg:p-6 bg-white border border-gray-100 rounded-xl sm:rounded-2xl shadow-sm peer-checked:border-blue-600 peer-checked:bg-blue-50/50 peer-checked:shadow-xl peer-checked:shadow-blue-100 transition-all group-hover:bg-gray-50 text-left">
                       <p className="text-[10px] font-black text-gray-900 uppercase tracking-widest italic leading-none mb-1">{v.label}</p>
                       <p className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter italic">{v.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            <Input {...register("totalSessionsPlanned")} label="Total Sessions Planned" type="number" placeholder="10" className={INPUT_STYLE} />
            <Input {...register("sessionFee")} label="Fee per Session (₹)" type="number" placeholder="500" className={INPUT_STYLE} />
            <div className="sm:col-span-2 mt-2 sm:mt-4">
              <label className="flex items-center gap-4 sm:gap-6 p-5 sm:p-8 bg-gray-50/50 border border-gray-100 rounded-xl sm:rounded-[2.5rem] cursor-pointer hover:bg-white transition-all shadow-sm group">
                <input {...register("reminderEnabled")} type="checkbox" defaultChecked className="w-6 h-6 sm:w-8 sm:h-8 appearance-none border-2 border-gray-200 rounded-lg sm:rounded-xl checked:border-blue-600 checked:bg-blue-600 transition-all cursor-pointer shadow-sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-black text-gray-900 uppercase tracking-widest italic group-hover:text-blue-600 transition-colors">Email Reminders</p>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter mt-1 italic truncate">Send appointment reminders via email</p>
                </div>
              </label>
            </div>
          </div>
        </Section>

        {/* Sticky Save Bar */}
        <div className="sticky bottom-4 sm:bottom-10 left-0 right-0 z-50 px-2 sm:px-4">
           <div className="max-w-3xl mx-auto bg-gray-900/90 backdrop-blur-3xl rounded-xl sm:rounded-[2.5rem] p-3 sm:p-4 border border-white/10 shadow-[0_40px_80px_rgba(0,0,0,0.4)] flex items-center justify-between gap-3 sm:gap-6 overflow-hidden">
              <button type="button" onClick={() => router.back()} className="px-4 sm:px-10 py-3 sm:py-5 bg-white/5 text-gray-400 hover:text-white rounded-lg sm:rounded-[1.5rem] text-[9px] sm:text-[10px] font-black uppercase tracking-widest italic transition-all hover:bg-white/10">
                Cancel
              </button>
              <div className="hidden sm:flex flex-1 items-center justify-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                 <span className="text-[8px] font-black text-white/40 uppercase tracking-[0.3em] italic">Ready to Save</span>
              </div>
              <button type="submit" disabled={loading} className="group relative px-6 sm:px-12 py-3 sm:py-5 bg-blue-600 text-white rounded-lg sm:rounded-[1.5rem] shadow-2xl shadow-blue-500/40 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 overflow-hidden">
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative z-10 flex items-center gap-2 sm:gap-3 text-[9px] sm:text-[10px] font-black uppercase tracking-widest italic">
                  {loading ? <><Clock size={14} className="animate-spin" /> Saving...</> : <><Command size={14} /> Save Patient</>}
                </span>
              </button>
           </div>
        </div>
      </form>

      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </div>
  );
}
