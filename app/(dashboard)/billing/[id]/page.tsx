"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import api from "@/lib/api";
import Card from "@/components/ui/Card";
import Spinner from "@/components/ui/Spinner";
import Input from "@/components/ui/Input";
import Toast, { useToast } from "@/components/ui/Toast";
import {
  ArrowLeft, Save, User, AlertCircle,
} from "lucide-react";
import { format, parseISO } from "date-fns";

export default function EditBillPage() {
  const { id }  = useParams<{ id: string }>();
  const router  = useRouter();
  const { toast, showToast, hideToast } = useToast();

  const [bill,    setBill]    = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [balance, setBalance] = useState(0);

  const { register, handleSubmit, watch, reset } = useForm();

  const watchTotal = watch("totalFee");
  const watchPaid  = watch("amountPaid");

  useEffect(() => {
    setBalance(Number(watchTotal || 0) - Number(watchPaid || 0));
  }, [watchTotal, watchPaid]);

  useEffect(() => {
    api.get(`/billing/${id}`)
      .then(({ data }) => {
        setBill(data.bill);
        reset({
          totalFee:    data.bill.totalFee,
          amountPaid:  data.bill.amountPaid,
          paymentMode: data.bill.paymentMode,
          notes:       data.bill.notes || "",
          date:        data.bill.date
            ? format(parseISO(data.bill.date), "yyyy-MM-dd")
            : format(new Date(), "yyyy-MM-dd"),
        });
        setBalance(data.bill.totalFee - data.bill.amountPaid);
      })
      .catch(() => showToast("Failed to load bill", "error"))
      .finally(() => setLoading(false));
  }, [id]);

  const onSubmit = async (data: any) => {
    setSaving(true);
    try {
      await api.put(`/billing/${id}`, {
        totalFee:    Number(data.totalFee),
        amountPaid:  Number(data.amountPaid),
        paymentMode: data.paymentMode,
        notes:       data.notes || undefined,
        date:        data.date,
      });
      showToast("Bill updated successfully!", "success");
      setTimeout(() => router.push("/billing"), 1200);
    } catch (err: any) {
      showToast(
        err.response?.data?.error || "Failed to update bill",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!bill) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <AlertCircle size={40} className="text-red-400" />
        <p className="text-gray-600">Bill not found</p>
        <button
          onClick={() => router.push("/billing")}
          className="text-blue-600 text-sm hover:underline"
        >
          ← Back to Billing
        </button>
      </div>
    );
  }

  const statusLabel =
    balance <= 0 ? "PAID" :
    Number(watchPaid) > 0 ? "PARTIAL" :
    "PENDING";

  const statusColor =
    statusLabel === "PAID"    ? "bg-green-100 text-green-700" :
    statusLabel === "PARTIAL" ? "bg-blue-100 text-blue-700"   :
                                "bg-yellow-100 text-yellow-700";

  return (
    <div className="max-w-2xl mx-auto space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/billing")}
            className="p-2 hover:bg-gray-100 rounded-lg transition 
                       text-gray-500"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Edit Bill</h2>
            <p className="text-sm text-gray-500">
              {bill.clientId?.name} •{" "}
              {bill.date
                ? format(parseISO(bill.date), "dd MMM yyyy")
                : "—"}
            </p>
          </div>
        </div>
        <button
          onClick={() => router.push(`/clients/${bill.clientId?._id}`)}
          className="flex items-center gap-2 px-4 py-2 border 
                     border-gray-300 rounded-lg text-sm text-gray-700 
                     hover:bg-gray-50 transition"
        >
          <User size={15} />
          View Client
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

        <Card className="p-6 space-y-4">
          <h3 className="text-xs font-semibold text-gray-400 uppercase 
                         tracking-wider">
            Bill Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              {...register("date")}
              label="Bill Date"
              type="date"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 
                                mb-1.5">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              {...register("totalFee")}
              label="Total Fee (₹)"
              type="number"
              min={0}
            />
            <Input
              {...register("amountPaid")}
              label="Amount Paid (₹)"
              type="number"
              min={0}
            />
          </div>

          {/* Balance */}
          <div className="flex items-center justify-between p-4 
                          bg-gray-50 rounded-xl border border-gray-100">
            <div>
              <p className="text-xs text-gray-500">Balance Due</p>
              <p className={`text-2xl font-bold
                             ${balance > 0 ? "text-red-500" : "text-green-600"}`}>
                ₹{Math.max(0, balance).toLocaleString("en-IN")}
              </p>
            </div>
            <span className={`px-3 py-1.5 rounded-full text-xs font-bold
                              ${statusColor}`}>
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
                        -mx-4 sm:-mx-6 px-4 sm:px-6 py-4 
                        flex gap-3 justify-end">
          <button
            type="button"
            onClick={() => router.push("/billing")}
            className="px-5 py-2.5 border border-gray-300 rounded-lg 
                       text-sm font-medium text-gray-700 
                       hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 
                       hover:bg-blue-700 disabled:bg-blue-400 text-white 
                       rounded-lg text-sm font-medium transition"
          >
            <Save size={16} />
            {saving ? "Saving..." : "Update Bill"}
          </button>
        </div>
      </form>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}
    </div>
  );
}
