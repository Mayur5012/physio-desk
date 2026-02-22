"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "@/lib/api";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Toast, { useToast } from "@/components/ui/Toast";
import { ArrowLeft, Save } from "lucide-react";

const schema = z.object({
  // Personal
  name:             z.string().min(2, "Name required"),
  age:              z.coerce.number().min(1).max(120),
  gender:           z.enum(["MALE", "FEMALE", "OTHER"]),
  phone:            z.string().min(10, "Valid phone required"),
  email:            z.string().email().optional().or(z.literal("")),
  address:          z.string().optional(),
  emergencyContact: z.string().optional(),
  referralSource:   z.string().optional(),
  // Medical
  chiefComplaint:   z.string().min(3, "Complaint required"),
  bodyPart:         z.string().min(1, "Body part required"),
  bodySide:         z.enum(["LEFT", "RIGHT", "BOTH"]),
  medicalHistory:   z.string().optional(),
  diagnosis:        z.string().optional(),
  therapyType:      z.enum(["PHYSIOTHERAPY", "ACUPRESSURE", "COMBINED"]),
  clientType:       z.enum(["NEW", "REGULAR", "ONE_TIME"]),
  // Package
  totalSessionsPlanned: z.coerce.number().optional(),
  sessionFee:           z.coerce.number().min(0).optional(),
  reminderEnabled:      z.boolean().optional(),
});

type FormData = z.infer<typeof schema>;

const RADIO = "flex items-center gap-2 cursor-pointer";
const RADIO_INPUT = "w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500";

export default function NewClientPage() {
  const router = useRouter();
  const { toast, showToast, hideToast } = useToast();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      gender:      "MALE",
      bodySide:    "BOTH",
      therapyType: "PHYSIOTHERAPY",
      clientType:  "NEW",
      reminderEnabled: true,
    },
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await api.post("/clients", data);
      showToast("Client added successfully!", "success");
      setTimeout(() => router.push("/clients"), 1200);
    } catch (err: any) {
      showToast(
        err.response?.data?.error || "Failed to create client",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const Section = ({
    title, children
  }: { title: string; children: React.ReactNode }) => (
    <Card className="p-6">
      <h3 className="text-xs font-semibold text-gray-400 uppercase 
                     tracking-wider mb-5">
        {title}
      </h3>
      {children}
    </Card>
  );

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
          <h2 className="text-xl font-bold text-gray-900">Add New Client</h2>
          <p className="text-sm text-gray-500">
            Fill in the details to register a new client
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

        {/* ── Personal Details ── */}
        <Section title="Personal Details">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Input
                {...register("name")}
                label="Full Name"
                required
                placeholder="e.g. Rahul Sharma"
                error={errors.name?.message}
              />
            </div>

            <Input
              {...register("age")}
              label="Age"
              required
              type="number"
              placeholder="34"
              error={errors.age?.message}
            />

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gender <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-5">
                {["MALE", "FEMALE", "OTHER"].map((g) => (
                  <label key={g} className={RADIO}>
                    <input
                      {...register("gender")}
                      type="radio"
                      value={g}
                      className={RADIO_INPUT}
                    />
                    <span className="text-sm text-gray-700 capitalize">
                      {g.charAt(0) + g.slice(1).toLowerCase()}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <Input
              {...register("phone")}
              label="Phone"
              required
              type="tel"
              placeholder="9876543210"
              error={errors.phone?.message}
            />

            <Input
              {...register("email")}
              label="Email"
              type="email"
              placeholder="client@email.com"
              error={errors.email?.message}
            />

            <div className="sm:col-span-2">
              <Input
                {...register("address")}
                label="Address"
                placeholder="Faridabad, Haryana"
              />
            </div>

            <Input
              {...register("emergencyContact")}
              label="Emergency Contact"
              placeholder="Name & phone number"
            />

            <Select
              {...register("referralSource")}
              label="Referral Source"
              placeholder="Select source"
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
        <Section title="Medical Details">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <div className="sm:col-span-2">
              <Input
                {...register("chiefComplaint")}
                label="Chief Complaint"
                required
                placeholder="e.g. Lower back pain since 2 weeks"
                error={errors.chiefComplaint?.message}
              />
            </div>

            <Input
              {...register("bodyPart")}
              label="Body Part Affected"
              required
              placeholder="e.g. Lumbar Spine, Shoulder"
              error={errors.bodyPart?.message}
            />

            {/* Body Side */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Side <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-5">
                {["LEFT", "RIGHT", "BOTH"].map((s) => (
                  <label key={s} className={RADIO}>
                    <input
                      {...register("bodySide")}
                      type="radio"
                      value={s}
                      className={RADIO_INPUT}
                    />
                    <span className="text-sm text-gray-700 capitalize">
                      {s.charAt(0) + s.slice(1).toLowerCase()}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Medical History
              </label>
              <textarea
                {...register("medicalHistory")}
                rows={3}
                placeholder="Past surgeries, existing conditions, medications..."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg 
                           text-sm focus:outline-none focus:ring-2 
                           focus:ring-blue-500 focus:border-transparent 
                           resize-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Diagnosis
              </label>
              <textarea
                {...register("diagnosis")}
                rows={2}
                placeholder="Clinical diagnosis..."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg 
                           text-sm focus:outline-none focus:ring-2 
                           focus:ring-blue-500 focus:border-transparent 
                           resize-none"
              />
            </div>

            {/* Therapy Type */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Therapy Type <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-4 flex-wrap">
                {[
                  { value: "PHYSIOTHERAPY", label: "Physiotherapy" },
                  { value: "ACUPRESSURE",   label: "Acupressure" },
                  { value: "COMBINED",      label: "Combined" },
                ].map((t) => (
                  <label key={t.value} className={RADIO}>
                    <input
                      {...register("therapyType")}
                      type="radio"
                      value={t.value}
                      className={RADIO_INPUT}
                    />
                    <span className="text-sm text-gray-700">{t.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Client Type */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Client Type <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-4 flex-wrap">
                {[
                  { value: "NEW",      label: "New Client" },
                  { value: "REGULAR",  label: "Regular" },
                  { value: "ONE_TIME", label: "One-time" },
                ].map((t) => (
                  <label key={t.value} className={RADIO}>
                    <input
                      {...register("clientType")}
                      type="radio"
                      value={t.value}
                      className={RADIO_INPUT}
                    />
                    <span className="text-sm text-gray-700">{t.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* ── Package Details ── */}
        <Section title="Package & Billing">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              {...register("totalSessionsPlanned")}
              label="Total Sessions Planned"
              type="number"
              placeholder="10"
              hint="Leave blank if open-ended"
            />
            <Input
              {...register("sessionFee")}
              label="Session Fee (₹)"
              type="number"
              placeholder="500"
            />
            <div className="sm:col-span-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  {...register("reminderEnabled")}
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 rounded border-gray-300 
                             text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Send email reminders to this client
                  </p>
                  <p className="text-xs text-gray-400">
                    Client will receive appointment reminders via email
                  </p>
                </div>
              </label>
            </div>
          </div>
        </Section>

        {/* Sticky Bottom Bar */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 
                        -mx-6 px-6 py-4 flex gap-3 justify-end">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-5 py-2.5 border border-gray-300 rounded-lg 
                       text-sm font-medium text-gray-700 hover:bg-gray-50 
                       transition"
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
            {loading ? "Saving..." : "Save Client"}
          </button>
        </div>
      </form>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={hideToast} />
      )}
    </div>
  );
}
