"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "@/lib/api";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Spinner from "@/components/ui/Spinner";
import Toast, { useToast } from "@/components/ui/Toast";
import { ArrowLeft, Save } from "lucide-react";

const schema = z.object({
  name:             z.string().min(2),
  age:              z.coerce.number().min(1).max(120),
  gender:           z.enum(["MALE", "FEMALE", "OTHER"]),
  phone:            z.string().min(10),
  email:            z.string().email().optional().or(z.literal("")),
  address:          z.string().optional(),
  emergencyContact: z.string().optional(),
  referralSource:   z.string().optional(),
  chiefComplaint:   z.string().min(3),
  bodyPart:         z.string().min(1),
  bodySide:         z.enum(["LEFT", "RIGHT", "BOTH"]),
  medicalHistory:   z.string().optional(),
  diagnosis:        z.string().optional(),
  therapyType:      z.enum(["PHYSIOTHERAPY", "ACUPRESSURE", "COMBINED"]),
  clientType:       z.enum(["NEW", "REGULAR", "ONE_TIME"]),
  status:           z.enum(["ACTIVE", "INACTIVE", "DISCHARGED"]),
  totalSessionsPlanned: z.coerce.number().optional(),
  sessionFee:           z.coerce.number().min(0).optional(),
  reminderEnabled:      z.boolean().optional(),
});

type FormData = z.infer<typeof schema>;
const RADIO = "flex items-center gap-2 cursor-pointer";
const RADIO_INPUT = "w-4 h-4 text-blue-600";

export default function EditClientPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { toast, showToast, hideToast } = useToast();
  const [loading,  setLoading]  = useState(false);
  const [fetching, setFetching] = useState(true);

  const {
    register, handleSubmit, reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) as any});

  useEffect(() => {
    api.get(`/clients/${id}`)
      .then(({ data }) => {
        const c = data.client;
        reset({
          ...c,
          age:   c.age?.toString(),
          email: c.email || "",
        });
      })
      .catch(() => showToast("Failed to load client", "error"))
      .finally(() => setFetching(false));
  }, [id]);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await api.put(`/clients/${id}`, data);
      showToast("Client updated successfully!", "success");
      setTimeout(() => router.push(`/clients/${id}`), 1200);
    } catch (err: any) {
      showToast(err.response?.data?.error || "Update failed", "error");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-500"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Edit Client</h2>
          <p className="text-sm text-gray-500">Update client information</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Card className="p-6 space-y-4">
          <h3 className="text-xs font-semibold text-gray-400 uppercase 
                         tracking-wider">
            Personal Details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Input {...register("name")} label="Full Name" required
                error={errors.name?.message} />
            </div>
            <Input {...register("age")} label="Age" required type="number"
              error={errors.age?.message} />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gender
              </label>
              <div className="flex gap-4">
                {["MALE","FEMALE","OTHER"].map((g) => (
                  <label key={g} className={RADIO}>
                    <input {...register("gender")} type="radio"
                      value={g} className={RADIO_INPUT} />
                    <span className="text-sm text-gray-700">
                      {g.charAt(0)+g.slice(1).toLowerCase()}
                    </span>
                  </label>
                ))}
              </div>
            </div>
            <Input {...register("phone")} label="Phone" required
              error={errors.phone?.message} />
            <Input {...register("email")} label="Email" type="email"
              error={errors.email?.message} />
            <div className="sm:col-span-2">
              <Input {...register("address")} label="Address" />
            </div>
            <Input {...register("emergencyContact")}
              label="Emergency Contact" />
            <Select {...register("status")} label="Status"
              options={[
                { value: "ACTIVE",     label: "Active" },
                { value: "INACTIVE",   label: "Inactive" },
                { value: "DISCHARGED", label: "Discharged" },
              ]}
            />
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <h3 className="text-xs font-semibold text-gray-400 uppercase 
                         tracking-wider">
            Medical Details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Input {...register("chiefComplaint")} label="Chief Complaint"
                required error={errors.chiefComplaint?.message} />
            </div>
            <Input {...register("bodyPart")} label="Body Part" required
              error={errors.bodyPart?.message} />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Side
              </label>
              <div className="flex gap-4">
                {["LEFT","RIGHT","BOTH"].map((s) => (
                  <label key={s} className={RADIO}>
                    <input {...register("bodySide")} type="radio"
                      value={s} className={RADIO_INPUT} />
                    <span className="text-sm text-gray-700">
                      {s.charAt(0)+s.slice(1).toLowerCase()}
                    </span>
                  </label>
                ))}
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Medical History
              </label>
              <textarea {...register("medicalHistory")} rows={3}
                className="w-full px-4 py-2.5 border border-gray-300 
                           rounded-lg text-sm focus:outline-none focus:ring-2 
                           focus:ring-blue-500 resize-none" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Diagnosis
              </label>
              <textarea {...register("diagnosis")} rows={2}
                className="w-full px-4 py-2.5 border border-gray-300 
                           rounded-lg text-sm focus:outline-none focus:ring-2 
                           focus:ring-blue-500 resize-none" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Therapy Type
              </label>
              <div className="flex gap-4">
                {[
                  ["PHYSIOTHERAPY","Physiotherapy"],
                  ["ACUPRESSURE","Acupressure"],
                  ["COMBINED","Combined"],
                ].map(([v, l]) => (
                  <label key={v} className={RADIO}>
                    <input {...register("therapyType")} type="radio"
                      value={v} className={RADIO_INPUT} />
                    <span className="text-sm text-gray-700">{l}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <h3 className="text-xs font-semibold text-gray-400 uppercase 
                         tracking-wider">
            Package & Billing
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input {...register("totalSessionsPlanned")}
              label="Total Sessions Planned" type="number" />
            <Input {...register("sessionFee")}
              label="Session Fee (₹)" type="number" />
            <div className="sm:col-span-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input {...register("reminderEnabled")} type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 
                             text-blue-600 focus:ring-blue-500" />
                <span className="text-sm font-medium text-gray-700">
                  Send email reminders to this client
                </span>
              </label>
            </div>
          </div>
        </Card>

        <div className="sticky bottom-0 bg-white border-t border-gray-200 
                        -mx-6 px-6 py-4 flex gap-3 justify-end">
          <button type="button" onClick={() => router.back()}
            className="px-5 py-2.5 border border-gray-300 rounded-lg 
                       text-sm font-medium text-gray-700 hover:bg-gray-50 
                       transition">
            Cancel
          </button>
          <button type="submit" disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 
                       hover:bg-blue-700 disabled:bg-blue-400 text-white 
                       rounded-lg text-sm font-medium transition">
            <Save size={16} />
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={hideToast} />
      )}
    </div>
  );
}
