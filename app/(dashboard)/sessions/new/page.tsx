"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "@/lib/api";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Toast, { useToast } from "@/components/ui/Toast";
import {
  ArrowLeft, Save, Minus, Plus, Users, Sparkles, Activity, ClipboardList,
} from "lucide-react";
import { format } from "date-fns";
import { SessionGuard } from "@/components/PrerequisiteGuard";

const TECHNIQUES = [
  "Manual Therapy", "Dry Needling", "Ultrasound",
  "TENS", "IFT", "Hot Pack", "Cold Pack",
  "Laser Therapy", "Cupping", "Kinesio Taping",
  "Acupressure", "Mobilization", "Manipulation",
  "Soft Tissue Release", "PNF Stretching",
];

const schema = z.object({
  clientId: z
    .string()
    .min(1, "Please select a client"),
  sessionNumber: z
    .coerce
    .number()
    .min(1, "Session number must be at least 1"),
  date: z
    .string()
    .min(1, "Date is required"),
  durationMins: z
    .coerce
    .number()
    .min(15, "Duration must be at least 15 minutes")
    .max(480, "Duration cannot exceed 8 hours"),
  chiefComplaint: z
    .string()
    .max(200, "Chief complaint must be under 200 characters")
    .optional(),
  subjective: z
    .string()
    .max(500, "Subjective notes must be under 500 characters")
    .optional(),
  objective: z
    .string()
    .max(500, "Objective findings must be under 500 characters")
    .optional(),
  assessment: z
    .string()
    .max(500, "Assessment must be under 500 characters")
    .optional(),
  plan: z
    .string()
    .max(500, "Plan must be under 500 characters")
    .optional(),
  exercises: z
    .string()
    .max(500, "Exercises must be under 500 characters")
    .optional(),
  notes: z
    .string()
    .max(300, "Notes must be under 300 characters")
    .optional(),
});

type FormData = z.infer<typeof schema>;

interface Client { _id: string; name: string; phone: string; }

// ── Inner component (uses useSearchParams) ─────────────────
function NewSessionForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const { toast, showToast, hideToast } = useToast();

  const [clients,    setClients]    = useState<Client[]>([]);
  const [techniques, setTechniques] = useState<string[]>([]);
  const [painBefore, setPainBefore] = useState(5);
  const [painAfter,  setPainAfter]  = useState(3);
  const [loading,    setLoading]    = useState(false);

  const defaultClient = searchParams.get("clientId") || "";

  const {
    register, handleSubmit, watch, setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      date:          format(new Date(), "yyyy-MM-dd"),
      durationMins:  60,
      sessionNumber: 1,
      clientId:      defaultClient,
    },
  });

  useEffect(() => {
    api.get("/clients?status=ACTIVE&limit=200")
      .then(({ data }) => setClients(data.clients))
      .catch(() => {});
  }, []);

  const watchClient = watch("clientId");
  useEffect(() => {
    if (!watchClient) return;
    api.get(`/sessions?clientId=${watchClient}&limit=1`)
      .then(({ data }) => {
        setValue("sessionNumber", (data.total || 0) + 1);
      })
      .catch(() => {});
  }, [watchClient]);

  const toggleTechnique = (t: string) => {
    setTechniques((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await api.post("/sessions", {
        ...data,
        techniques,
        painBefore,
        painAfter,
        appointmentId: searchParams.get("appointmentId") || undefined,
      });
      showToast("Session recorded successfully!", "success");
      setTimeout(() => router.push("/sessions"), 1200);
    } catch (err: any) {
      showToast(
        err.response?.data?.error || "Failed to record session",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const PainSlider = ({
    label, value, onChange, icon: Icon
  }: {
    label: string; value: number; onChange: (v: number) => void; icon: any;
  }) => {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-900 text-white rounded-xl shadow-lg">
                 <Icon size={14} />
              </div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">{label}</p>
           </div>
           <span className="text-xl font-black text-gray-900 italic tracking-tighter">{value}/10</span>
        </div>
        <div className="flex gap-2">
           {[...Array(11)].map((_, i) => (
              <button
                 key={i}
                 type="button"
                 onClick={() => onChange(i)}
                 className={`flex-1 h-12 rounded-xl text-xs font-black transition-all border ${
                    value === i 
                    ? "bg-gray-900 border-gray-900 text-white shadow-xl -translate-y-1" 
                    : "bg-white border-gray-100 text-gray-400 hover:border-gray-900 hover:text-gray-900"
                 }`}
              >
                 {i}
              </button>
           ))}
        </div>
        <div className="flex justify-between px-1">
           <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest italic">Stable</span>
           <span className="text-[8px] font-black text-red-500 uppercase tracking-widest italic">Severe</span>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5">

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button
            onClick={() => router.back()}
            className="p-4 bg-white shadow-xl shadow-gray-100 rounded-2xl hover:scale-110 transition-transform text-gray-400 hover:text-gray-900 border border-gray-50"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1">
               <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Clinical Document</span>
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight italic">
              Add New Session<span className="text-emerald-600">.</span>
            </h2>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

        {/* ── Patient Info ── */}
        <Card className="p-8 border-none shadow-2xl rounded-[2.5rem] bg-white ring-1 ring-gray-100 space-y-8">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                <Users size={18} />
             </div>
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Patient Details</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 italic ml-2">
                Patient Name <span className="text-emerald-500">*</span>
              </label>
              <select
                {...register("clientId")}
                className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:bg-white transition-all italic appearance-none"
              >
                <option value="">Select patient...</option>
                {clients.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name} – {c.phone}
                  </option>
                ))}
              </select>
              {errors.clientId && (
                <p className="text-red-500 text-[10px] font-black uppercase italic ml-4 mt-2">
                  {errors.clientId.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:col-span-2">
              <Input
                {...register("sessionNumber")}
                label="Session No."
                required
                type="number"
                min={1}
                className="rounded-2xl bg-gray-50/50 border-gray-100 py-4 font-bold italic focus:bg-white transition-all"
                error={errors.sessionNumber?.message}
              />
              <Input
                {...register("date")}
                label="Date"
                required
                type="date"
                className="rounded-2xl bg-gray-50/50 border-gray-100 py-4 font-bold italic focus:bg-white transition-all"
                error={errors.date?.message}
              />
              <Select
                {...register("durationMins")}
                label="Duration"
                className="rounded-2xl bg-gray-50/50 border-gray-100 py-4 font-bold italic focus:bg-white transition-all"
                options={[
                  { value: "30",  label: "30 min" },
                  { value: "45",  label: "45 min" },
                  { value: "60",  label: "60 min" },
                  { value: "90",  label: "90 min" },
                  { value: "120", label: "120 min" },
                ]}
              />
            </div>
          </div>
        </Card>

        {/* ── Pain Assessment ── */}
        <Card className="p-8 border-none shadow-2xl rounded-[2.5rem] bg-white ring-1 ring-gray-100 space-y-10">
          <PainSlider
            label="Pain Score Before Treatment"
            value={painBefore}
            onChange={setPainBefore}
            icon={Activity}
          />
          <PainSlider
            label="Pain Score After Treatment"
            value={painAfter}
            onChange={setPainAfter}
            icon={Sparkles}
          />
        </Card>

        {/* ── Notes ── */}
        <Card className="p-8 border-none shadow-2xl rounded-[2.5rem] bg-white ring-1 ring-gray-100 space-y-8">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                <ClipboardList size={18} />
             </div>
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Clinical Notes (SOAP)</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                field: "subjective" as const,
                label: "Patient Complaints",
                placeholder: "Symptoms, pain description...",
              },
              {
                field: "objective" as const,
                label: "Clinical Findings",
                placeholder: "Range of motion, strength, posture...",
              },
              {
                field: "assessment" as const,
                label: "Diagnosis / Progress",
                placeholder: "Evaluation and progress evaluation...",
              },
              {
                field: "plan" as const,
                label: "Treatment Plan",
                placeholder: "Frequency, goals, next steps...",
              },
            ].map(({ field, label, placeholder }) => (
              <div key={field} className={field === 'subjective' || field === 'objective' ? 'md:col-span-1' : 'md:col-span-1'}>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 italic ml-2">
                  {label}
                </label>
                <textarea
                  {...register(field)}
                  rows={4}
                  placeholder={placeholder}
                  className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-3xl text-sm font-bold italic focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:bg-white transition-all resize-none shadow-sm"
                />
              </div>
            ))}
          </div>
        </Card>

        {/* ── Techniques ── */}
        <Card className="p-8 border-none shadow-2xl rounded-[2.5rem] bg-gray-900 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500 opacity-5 rounded-bl-full" />
          <h3 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.25em] mb-6 italic">
            Techniques Applied
          </h3>
          <div className="flex flex-wrap gap-3">
            {TECHNIQUES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => toggleTechnique(t)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
                            ${techniques.includes(t)
                              ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                              : "bg-white/5 text-gray-400 hover:bg-white/10"
                            }`}
              >
                {t}
              </button>
            ))}
          </div>
        </Card>

        {/* ── Exercises + Notes ── */}
        <Card className="p-8 border-none shadow-2xl rounded-[2.5rem] bg-white ring-1 ring-gray-100 space-y-8">
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 italic ml-2">
              Home Exercises
            </label>
            <textarea
              {...register("exercises")}
              rows={3}
              placeholder="Home exercises prescribed..."
              className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-3xl text-sm font-bold italic focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:bg-white transition-all resize-none shadow-sm"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 italic ml-2">
              Additional Observations
            </label>
            <textarea
              {...register("notes")}
              rows={3}
              placeholder="Any other notes..."
              className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-3xl text-sm font-bold italic focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:bg-white transition-all resize-none shadow-sm"
            />
          </div>
        </Card>

        {/* Command Center */}
        <div className="sticky bottom-8 z-50">
           <div className="bg-gray-900/90 backdrop-blur-xl border border-white/10 p-4 rounded-[2rem] shadow-2xl flex items-center justify-between px-8">
              <div className="hidden sm:block">
                 <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest italic">Command Center</p>
                 <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">Ready for record persistence</p>
              </div>
              <div className="flex items-center gap-4 w-full sm:w-auto">
                 <button
                   type="button"
                   onClick={() => router.back()}
                   className="flex-1 sm:flex-none px-8 py-4 bg-white/5 hover:bg-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all"
                 >
                   Discard
                 </button>
                 <button
                   type="submit"
                   disabled={loading}
                   className="flex-1 sm:flex-none flex items-center justify-center gap-3 px-10 py-4 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-800 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95"
                 >
                   <Save size={16} />
                   {loading ? "Recording..." : "Save Session"}
                 </button>
              </div>
           </div>
        </div>
      </form>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={hideToast} />
      )}
    </div>
  );
}

// ── Page export with Suspense wrapper ──────────────────────
export default function NewSessionPage() {
  return (
    <SessionGuard>
      <Suspense fallback={
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent
                          rounded-full animate-spin" />
        </div>
      }>
        <NewSessionForm />
      </Suspense>
    </SessionGuard>
  );
}
