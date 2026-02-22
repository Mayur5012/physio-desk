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
import { ArrowLeft, Save, AlertTriangle, RefreshCw } from "lucide-react";
import { format } from "date-fns";

const schema = z.object({
  clientId:          z.string().min(1, "Select a client"),
  date:              z.string().min(1, "Date required"),
  startTime:         z.string().min(1, "Time required"),
  durationMins:      z.coerce.number().min(30),
  type:              z.enum(["NEW_CONSULTATION","FOLLOWUP","ONE_TIME"]),
  notes:             z.string().optional(),
  isRecurring:       z.boolean().optional(),
  recurrencePattern: z.enum(["DAILY","EVERY_N_DAYS","CUSTOM"]).optional(),
  recurrenceEveryN:  z.coerce.number().optional(),
  endAfterSessions:  z.coerce.number().optional(),
  recurrenceEndDate: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Client { _id: string; name: string; phone: string; }
interface SlotInfo { startTime: string; endTime: string; available: boolean; }

const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

// ── Inner component (uses useSearchParams) ─────────────────
function NewAppointmentForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast, showToast, hideToast } = useToast();

  const [clients,        setClients]        = useState<Client[]>([]);
  const [slots,          setSlots]          = useState<SlotInfo[]>([]);
  const [loadingSlots,   setLoadingSlots]   = useState(false);
  const [conflictMsg,    setConflictMsg]    = useState("");
  const [loading,        setLoading]        = useState(false);
  const [showRecurrence, setShowRecurrence] = useState(false);
  const [customDays,     setCustomDays]     = useState<number[]>([]);

  const defaultDate   = searchParams.get("date") || format(new Date(), "yyyy-MM-dd");
  const defaultTime   = searchParams.get("time") || "";
  const defaultClient = searchParams.get("clientId") || "";

  const {
    register, handleSubmit, watch, setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      date:              defaultDate,
      startTime:         defaultTime,
      durationMins:      60,
      type:              "FOLLOWUP",
      isRecurring:       false,
      recurrencePattern: "EVERY_N_DAYS",
      recurrenceEveryN:  2,
      clientId:          defaultClient,
    },
  });

  const watchDate      = watch("date");
  const watchDuration  = watch("durationMins");
  const watchRecurring = watch("isRecurring");
  const watchPattern   = watch("recurrencePattern");

  useEffect(() => {
    api.get("/clients?status=ACTIVE&limit=100")
      .then(({ data }) => setClients(data.clients))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!watchDate || !watchDuration) return;
    setLoadingSlots(true);
    api.get("/appointments/slots", {
      params: { date: watchDate, duration: watchDuration },
    })
      .then(({ data }) => setSlots(data.slots))
      .catch(() => {})
      .finally(() => setLoadingSlots(false));
  }, [watchDate, watchDuration]);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setConflictMsg("");
    try {
      const payload = {
        ...data,
        isRecurring: showRecurrence,
        customDays: showRecurrence && watchPattern === "CUSTOM"
          ? customDays : [],
      };
      await api.post("/appointments", payload);
      showToast(
        showRecurrence
          ? "Recurring appointments created!"
          : "Appointment booked!",
        "success"
      );
      setTimeout(() => router.push("/appointments"), 1200);
    } catch (err: any) {
      if (err.response?.data?.conflict) {
        setConflictMsg(err.response.data.error);
      } else {
        showToast(
          err.response?.data?.error || "Failed to book appointment",
          "error"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5">

      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-500"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Book Appointment</h2>
          <p className="text-sm text-gray-500">Schedule a new appointment</p>
        </div>
      </div>

      {/* Conflict Warning */}
      {conflictMsg && (
        <div className="flex items-start gap-3 bg-yellow-50 border
                        border-yellow-200 rounded-xl px-4 py-3">
          <AlertTriangle size={18} className="text-yellow-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-yellow-800">Slot Conflict</p>
            <p className="text-xs text-yellow-700 mt-0.5">{conflictMsg}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

        {/* ── Core Details ── */}
        <Card className="p-6 space-y-4">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Appointment Details
          </h3>

          {/* Client */}
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
              <option value="">Select a client...</option>
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

          <div className="grid grid-cols-2 gap-4">
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
              required
              options={[
                { value: "30",  label: "30 minutes" },
                { value: "60",  label: "60 minutes" },
                { value: "90",  label: "90 minutes" },
                { value: "120", label: "120 minutes" },
              ]}
            />
          </div>

          {/* Time Slots */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Time <span className="text-red-500">*</span>
            </label>
            {loadingSlots ? (
              <p className="text-xs text-gray-400">Loading slots...</p>
            ) : (
              <div className="grid grid-cols-5 sm:grid-cols-7 gap-1.5">
                {slots.map((slot) => (
                  <button
                    key={slot.startTime}
                    type="button"
                    disabled={!slot.available}
                    onClick={() => setValue("startTime", slot.startTime)}
                    className={`py-1.5 text-xs rounded-lg border font-mono
                                transition font-medium
                                ${watch("startTime") === slot.startTime
                                  ? "bg-blue-600 border-blue-600 text-white"
                                  : slot.available
                                    ? "border-gray-200 text-gray-700 hover:border-blue-400 hover:text-blue-600"
                                    : "border-gray-100 text-gray-300 cursor-not-allowed bg-gray-50 line-through"
                                }`}
                  >
                    {slot.startTime}
                  </button>
                ))}
              </div>
            )}
            {errors.startTime && (
              <p className="text-red-500 text-xs mt-1">
                {errors.startTime.message}
              </p>
            )}
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Appointment Type
            </label>
            <div className="flex gap-4 flex-wrap">
              {[
                { value: "FOLLOWUP",         label: "Follow-up" },
                { value: "NEW_CONSULTATION", label: "New Consultation" },
                { value: "ONE_TIME",         label: "One-time" },
              ].map(({ value, label }) => (
                <label key={value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    {...register("type")}
                    type="radio"
                    value={value}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm text-gray-700">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Notes (optional)
            </label>
            <textarea
              {...register("notes")}
              rows={2}
              placeholder="Any special notes for this appointment..."
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg
                         text-sm focus:outline-none focus:ring-2
                         focus:ring-blue-500 resize-none"
            />
          </div>
        </Card>

        {/* ── Recurrence ── */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <RefreshCw size={16} className="text-gray-500" />
              <h3 className="text-sm font-semibold text-gray-800">
                Repeat this appointment?
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setShowRecurrence(!showRecurrence)}
              className={`relative w-11 h-6 rounded-full transition-colors
                          ${showRecurrence ? "bg-blue-600" : "bg-gray-200"}`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white
                            rounded-full shadow transition-transform
                            ${showRecurrence ? "translate-x-5" : ""}`}
              />
            </button>
          </div>

          {showRecurrence && (
            <div className="space-y-4 pt-4 border-t border-gray-100">

              {/* Pattern */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Repeat Pattern
                </label>
                <div className="flex gap-4 flex-wrap">
                  {[
                    { value: "DAILY",        label: "Daily" },
                    { value: "EVERY_N_DAYS", label: "Every N Days" },
                    { value: "CUSTOM",       label: "Custom Days" },
                  ].map(({ value, label }) => (
                    <label key={value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        {...register("recurrencePattern")}
                        type="radio"
                        value={value}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm text-gray-700">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {watchPattern === "EVERY_N_DAYS" && (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">Repeat every</span>
                  <input
                    {...register("recurrenceEveryN")}
                    type="number"
                    min={1}
                    max={30}
                    className="w-16 px-3 py-2 border border-gray-300
                               rounded-lg text-sm text-center
                               focus:outline-none focus:ring-2
                               focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-600">days</span>
                </div>
              )}

              {watchPattern === "CUSTOM" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Days
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {DAYS.map((day, idx) => (
                      <button
                        key={day}
                        type="button"
                        onClick={() =>
                          setCustomDays((prev) =>
                            prev.includes(idx)
                              ? prev.filter((d) => d !== idx)
                              : [...prev, idx]
                          )
                        }
                        className={`w-10 h-10 rounded-full text-xs font-medium
                                    border transition
                                    ${customDays.includes(idx)
                                      ? "bg-blue-600 border-blue-600 text-white"
                                      : "border-gray-200 text-gray-600 hover:border-blue-300"
                                    }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <Input
                  {...register("endAfterSessions")}
                  label="End After (sessions)"
                  type="number"
                  placeholder="10"
                  hint="Leave blank to use end date"
                />
                <Input
                  {...register("recurrenceEndDate")}
                  label="End Date"
                  type="date"
                  hint="Or pick an end date"
                />
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3">
                <p className="text-xs text-blue-700">
                  <span className="font-semibold">Note:</span>{" "}
                  All recurring appointments will be created at{" "}
                  <span className="font-mono font-semibold">
                    {watch("startTime") || "selected time"}
                  </span>
                  . You can cancel individual occurrences later.
                </p>
              </div>
            </div>
          )}
        </Card>

        {/* Sticky Bottom Bar */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200
                        -mx-6 px-6 py-4 flex gap-3 justify-end">
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
            {loading
              ? "Booking..."
              : showRecurrence
                ? "Create Recurring"
                : "Book Appointment"
            }
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
export default function NewAppointmentPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent
                        rounded-full animate-spin" />
      </div>
    }>
      <NewAppointmentForm />
    </Suspense>
  );
}
