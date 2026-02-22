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
import { ArrowLeft, Save, Minus, Plus } from "lucide-react";
import { format } from "date-fns";

const TECHNIQUES = [
  "Manual Therapy", "Dry Needling", "Ultrasound",
  "TENS", "IFT", "Hot Pack", "Cold Pack",
  "Laser Therapy", "Cupping", "Kinesio Taping",
  "Acupressure", "Mobilization", "Manipulation",
  "Soft Tissue Release", "PNF Stretching",
];

const schema = z.object({
  clientId:       z.string().min(1, "Select a client"),
  sessionNumber:  z.coerce.number().min(1),
  date:           z.string().min(1, "Date required"),
  durationMins:   z.coerce.number().min(15),
  chiefComplaint: z.string().optional(),
  subjective:     z.string().optional(),
  objective:      z.string().optional(),
  assessment:     z.string().optional(),
  plan:           z.string().optional(),
  exercises:      z.string().optional(),
  notes:          z.string().optional(),
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
    label, value, onChange,
  }: {
    label: string; value: number; onChange: (v: number) => void;
  }) => {
    const color = value <= 3
      ? "text-green-600 bg-green-50 border-green-200"
      : value <= 6
        ? "text-yellow-600 bg-yellow-50 border-yellow-200"
        : "text-red-600 bg-red-50 border-red-200";

    return (
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700">{label}</label>
          <span className={`text-sm font-bold px-2.5 py-0.5 rounded-lg border ${color}`}>
            {value}/10
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onChange(Math.max(0, value - 1))}
            className="w-8 h-8 rounded-full border border-gray-300
                       flex items-center justify-center
                       hover:bg-gray-50 transition text-gray-600"
          >
            <Minus size={14} />
          </button>
          <input
            type="range"
            min={0} max={10} value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="flex-1 h-2 appearance-none bg-gray-200
                       rounded-full cursor-pointer accent-blue-600"
          />
          <button
            type="button"
            onClick={() => onChange(Math.min(10, value + 1))}
            className="w-8 h-8 rounded-full border border-gray-300
                       flex items-center justify-center
                       hover:bg-gray-50 transition text-gray-600"
          >
            <Plus size={14} />
          </button>
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-1 px-1">
          <span>No pain</span>
          <span>Worst pain</span>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5">

      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-500"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Record Session</h2>
          <p className="text-sm text-gray-500">SOAP notes + treatment details</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

        {/* ── Basic Info ── */}
        <Card className="p-6 space-y-4">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Session Info
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Client <span className="text-red-500">*</span>
            </label>
            <select
              {...register("clientId")}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg
                         text-sm focus:outline-none focus:ring-2
                         focus:ring-blue-500 bg-white"
            >
              <option value="">Select client...</option>
              {clients.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name} – {c.phone}
                </option>
              ))}
            </select>
            {errors.clientId && (
              <p className="text-red-500 text-xs mt-1">
                {errors.clientId.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              {...register("sessionNumber")}
              label="Session #"
              required
              type="number"
              min={1}
              error={errors.sessionNumber?.message}
            />
            <Input
              {...register("date")}
              label="Date"
              required
              type="date"
              error={errors.date?.message}
            />
            <Select
              {...register("durationMins")}
              label="Duration"
              options={[
                { value: "30",  label: "30 min" },
                { value: "45",  label: "45 min" },
                { value: "60",  label: "60 min" },
                { value: "90",  label: "90 min" },
                { value: "120", label: "120 min" },
              ]}
            />
          </div>
        </Card>

        {/* ── Pain Scale ── */}
        <Card className="p-6 space-y-5">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Pain Assessment (VAS Scale)
          </h3>
          <PainSlider
            label="Pain Score Before Treatment"
            value={painBefore}
            onChange={setPainBefore}
          />
          <PainSlider
            label="Pain Score After Treatment"
            value={painAfter}
            onChange={setPainAfter}
          />
        </Card>

        {/* ── SOAP Notes ── */}
        <Card className="p-6 space-y-4">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            SOAP Notes
          </h3>
          {[
            {
              field: "subjective" as const,
              label: "S – Subjective",
              placeholder: "Patient's complaints, symptoms, pain description...",
            },
            {
              field: "objective" as const,
              label: "O – Objective",
              placeholder: "Clinical findings, ROM, strength, posture...",
            },
            {
              field: "assessment" as const,
              label: "A – Assessment",
              placeholder: "Diagnosis, progress evaluation, clinical impression...",
            },
            {
              field: "plan" as const,
              label: "P – Plan",
              placeholder: "Treatment plan, frequency, goals, next steps...",
            },
          ].map(({ field, label, placeholder }) => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {label}
              </label>
              <textarea
                {...register(field)}
                rows={2}
                placeholder={placeholder}
                className="w-full px-4 py-2.5 border border-gray-300
                           rounded-lg text-sm focus:outline-none focus:ring-2
                           focus:ring-blue-500 resize-none"
              />
            </div>
          ))}
        </Card>

        {/* ── Techniques ── */}
        <Card className="p-6">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
            Techniques Used
          </h3>
          <div className="flex flex-wrap gap-2">
            {TECHNIQUES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => toggleTechnique(t)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium
                            border transition
                            ${techniques.includes(t)
                              ? "bg-blue-600 border-blue-600 text-white"
                              : "border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600"
                            }`}
              >
                {t}
              </button>
            ))}
          </div>
        </Card>

        {/* ── Exercises + Notes ── */}
        <Card className="p-6 space-y-4">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Exercises & Notes
          </h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Home Exercises
            </label>
            <textarea
              {...register("exercises")}
              rows={2}
              placeholder="Exercises prescribed for home practice..."
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg
                         text-sm focus:outline-none focus:ring-2
                         focus:ring-blue-500 resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Additional Notes
            </label>
            <textarea
              {...register("notes")}
              rows={2}
              placeholder="Any additional observations or notes..."
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg
                         text-sm focus:outline-none focus:ring-2
                         focus:ring-blue-500 resize-none"
            />
          </div>
        </Card>

        {/* Sticky Submit Bar */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200
                        -mx-4 sm:-mx-6 px-4 sm:px-6 py-4 flex gap-3 justify-end">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-5 py-2.5 border border-gray-300 rounded-lg
                       text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600
                       hover:bg-blue-700 disabled:bg-blue-400 text-white
                       rounded-lg text-sm font-medium transition"
          >
            <Save size={16} />
            {loading ? "Saving..." : "Save Session"}
          </button>
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
    <Suspense fallback={
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent
                        rounded-full animate-spin" />
      </div>
    }>
      <NewSessionForm />
    </Suspense>
  );
}
