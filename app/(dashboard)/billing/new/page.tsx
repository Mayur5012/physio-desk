"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "@/lib/api";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Toast, { useToast } from "@/components/ui/Toast";
import { ArrowLeft, Save } from "lucide-react";
import { format } from "date-fns";

const schema = z.object({
  clientId:    z.string().min(1, "Select a client"),
  totalFee:    z.coerce.number().min(1, "Fee must be greater than 0"),
  amountPaid:  z.coerce.number().min(0),
  paymentMode: z.enum(["CASH", "UPI", "CARD"]),
  date:        z.string().min(1, "Date required"),
  notes:       z.string().optional(),
  sessionId:   z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Client {
  _id: string;
  name: string;
  phone: string;
  sessionFee: number;
}

// ── Inner component (uses useSearchParams) ─────────────────
function NewBillForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const { toast, showToast, hideToast } = useToast();

  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState(0);

  const defaultClient = searchParams.get("clientId") || "";

  const {
    register, handleSubmit, watch, setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      date:        format(new Date(), "yyyy-MM-dd"),
      paymentMode: "CASH",
      amountPaid:  0,
      totalFee:    0,
      clientId:    defaultClient,
    },
  });

  const watchTotal  = watch("totalFee");
  const watchPaid   = watch("amountPaid");
  const watchClient = watch("clientId");

  useEffect(() => {
    setBalance(Number(watchTotal || 0) - Number(watchPaid || 0));
  }, [watchTotal, watchPaid]);

  useEffect(() => {
    if (!watchClient) return;
    const client = clients.find((c) => c._id === watchClient);
    if (client?.sessionFee) {
      setValue("totalFee",   client.sessionFee);
      setValue("amountPaid", client.sessionFee);
    }
  }, [watchClient, clients]);

  useEffect(() => {
    api.get("/clients?status=ACTIVE&limit=200")
      .then(({ data }) => setClients(data.clients))
      .catch(() => {});
  }, []);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await api.post("/billing", {
        ...data,
        sessionId: data.sessionId || undefined,
      });
      showToast("Bill created successfully!", "success");
      setTimeout(() => router.push("/billing"), 1200);
    } catch (err: any) {
      showToast(
        err.response?.data?.error || "Failed to create bill",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const statusLabel =
    balance <= 0        ? "PAID"    :
    Number(watchPaid) > 0 ? "PARTIAL" :
    "PENDING";

  const statusColor =
    statusLabel === "PAID"    ? "bg-green-100 text-green-700" :
    statusLabel === "PARTIAL" ? "bg-blue-100 text-blue-700"   :
                                "bg-yellow-100 text-yellow-700";

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
          <h2 className="text-xl font-bold text-gray-900">New Bill</h2>
          <p className="text-sm text-gray-500">Create a billing record</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

        {/* Client + Date */}
        <Card className="p-6 space-y-4">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Bill Details
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Client <span className="text-red-500">*</span>
            </label>
            <select
              {...register("clientId")}
              className="w-full px-4 py-2.5 border border-gray-300
                         rounded-lg text-sm focus:outline-none focus:ring-2
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              {...register("date")}
              label="Bill Date"
              type="date"
              required
              error={errors.date?.message}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Payment Mode
              </label>
              <select
                {...register("paymentMode")}
                className="w-full px-4 py-2.5 border border-gray-300
                           rounded-lg text-sm focus:outline-none focus:ring-2
                           focus:ring-blue-500 bg-white"
              >
                <option value="CASH">💵 Cash</option>
                <option value="UPI">📱 UPI</option>
                <option value="CARD">💳 Card</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Fee Breakdown */}
        <Card className="p-6 space-y-4">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Fee Breakdown
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              {...register("totalFee")}
              label="Total Fee (₹)"
              type="number"
              min={0}
              required
              error={errors.totalFee?.message}
            />
            <Input
              {...register("amountPaid")}
              label="Amount Paid (₹)"
              type="number"
              min={0}
              error={errors.amountPaid?.message}
            />
          </div>

          {/* Balance Summary */}
          <div className="flex items-center justify-between p-4
                          bg-gray-50 rounded-xl border border-gray-100">
            <div>
              <p className="text-xs text-gray-500">Balance Due</p>
              <p className={`text-2xl font-bold
                             ${balance > 0 ? "text-red-500" : "text-green-600"}`}>
                ₹{Math.max(0, balance).toLocaleString("en-IN")}
              </p>
            </div>
            <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${statusColor}`}>
              {statusLabel}
            </span>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Notes
            </label>
            <textarea
              {...register("notes")}
              rows={2}
              placeholder="Optional payment notes..."
              className="w-full px-4 py-2.5 border border-gray-300
                         rounded-lg text-sm focus:outline-none focus:ring-2
                         focus:ring-blue-500 resize-none"
            />
          </div>
        </Card>

        {/* Submit */}
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
            {loading ? "Saving..." : "Create Bill"}
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
export default function NewBillPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent
                        rounded-full animate-spin" />
      </div>
    }>
      <NewBillForm />
    </Suspense>
  );
}
