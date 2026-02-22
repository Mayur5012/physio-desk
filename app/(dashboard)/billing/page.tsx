"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Spinner from "@/components/ui/Spinner";
import Pagination from "@/components/ui/Pagination";
import Toast, { useToast } from "@/components/ui/Toast";
import {
  CreditCard, Plus, IndianRupee,
  TrendingUp, Clock, CheckCircle,
} from "lucide-react";
import { format, parseISO } from "date-fns";

interface Bill {
  _id: string;
  date: string;
  totalFee: number;
  amountPaid: number;
  paymentMode: string;
  status: "PAID" | "PENDING" | "PARTIAL";
  notes?: string;
  clientId: { _id: string; name: string; phone: string };
  sessionId?: { sessionNumber: number };
}

interface Summary {
  totalRevenue: number;
  totalPending: number;
  totalBills:   number;
}

const STATUS_FILTER = ["ALL", "PAID", "PENDING", "PARTIAL"];

const statusStyle: Record<string, string> = {
  PAID:    "bg-green-100 text-green-700",
  PENDING: "bg-yellow-100 text-yellow-700",
  PARTIAL: "bg-blue-100 text-blue-700",
};

const modeIcon: Record<string, string> = {
  CASH: "💵",
  UPI:  "📱",
  CARD: "💳",
};

export default function BillingPage() {
  const router = useRouter();
  const { toast, showToast, hideToast } = useToast();

  const [bills,      setBills]      = useState<Bill[]>([]);
  const [summary,    setSummary]    = useState<Summary>({
    totalRevenue: 0, totalPending: 0, totalBills: 0,
  });
  const [total,      setTotal]      = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading,    setLoading]    = useState(true);
  const [page,       setPage]       = useState(1);
  const [status,     setStatus]     = useState("ALL");

  const fetchBills = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/billing", {
        params: { page, limit: 10, status },
      });
      setBills(data.bills);
      setTotal(data.total);
      setTotalPages(data.totalPages);
      setSummary(data.summary);
    } catch {
      showToast("Failed to load billing data", "error");
    } finally {
      setLoading(false);
    }
  }, [page, status]);

  useEffect(() => { fetchBills(); }, [fetchBills]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this bill?")) return;
    try {
      await api.delete(`/billing/${id}`);
      showToast("Bill deleted", "success");
      fetchBills();
    } catch {
      showToast("Failed to delete bill", "error");
    }
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Billing</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {total} total bills
          </p>
        </div>
        <button
          onClick={() => router.push("/billing/new")}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 
                     text-white text-sm font-medium px-4 py-2.5 rounded-lg 
                     transition"
        >
          <Plus size={16} />
          New Bill
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            icon:  TrendingUp,
            label: "Total Collected",
            value: `₹${summary.totalRevenue.toLocaleString("en-IN")}`,
            color: "text-green-600",
            bg:    "bg-green-50",
          },
          {
            icon:  Clock,
            label: "Total Pending",
            value: `₹${summary.totalPending.toLocaleString("en-IN")}`,
            color: "text-yellow-600",
            bg:    "bg-yellow-50",
          },
          {
            icon:  CheckCircle,
            label: "Total Bills",
            value: summary.totalBills.toString(),
            color: "text-blue-600",
            bg:    "bg-blue-50",
          },
        ].map(({ icon: Icon, label, value, color, bg }) => (
          <Card key={label} className="p-5">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${bg} shrink-0`}>
                <Icon size={20} className={color} />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">{label}</p>
                <p className={`text-xl font-bold ${color}`}>{value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {STATUS_FILTER.map((s) => (
          <button
            key={s}
            onClick={() => { setStatus(s); setPage(1); }}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold 
                        transition
                        ${status === s
                          ? "bg-white text-gray-900 shadow-sm"
                          : "text-gray-500 hover:text-gray-700"
                        }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Table */}
      <Card>
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : bills.length === 0 ? (
          <div className="flex flex-col items-center justify-center 
                          py-20 gap-3">
            <CreditCard size={40} className="text-gray-200" />
            <p className="text-gray-500 text-sm">No bills found</p>
            <button
              onClick={() => router.push("/billing/new")}
              className="text-blue-600 text-sm hover:underline"
            >
              Create first bill
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    {[
                      "Client", "Date", "Total Fee",
                      "Paid", "Balance", "Mode",
                      "Status", "Actions",
                    ].map((h) => (
                      <th
                        key={h}
                        className="text-left px-5 py-3 text-xs font-semibold 
                                   text-gray-500 uppercase tracking-wide 
                                   whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {bills.map((b) => {
                    const balance = b.totalFee - b.amountPaid;
                    return (
                      <tr
                        key={b._id}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        {/* Client */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-blue-100 
                                            text-blue-700 flex items-center 
                                            justify-center text-xs font-bold 
                                            shrink-0">
                              {b.clientId?.name?.charAt(0)?.toUpperCase() ?? "?"}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900 
                                            whitespace-nowrap">
                                {b.clientId?.name ?? "—"}
                              </p>
                              <p className="text-xs text-gray-400">
                                {b.clientId?.phone ?? ""}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Date */}
                        <td className="px-5 py-3.5 text-sm text-gray-600 
                                       whitespace-nowrap">
                          {b.date
                            ? format(parseISO(b.date), "dd MMM yyyy")
                            : "—"}
                        </td>

                        {/* Total Fee */}
                        <td className="px-5 py-3.5 text-sm font-semibold 
                                       text-gray-800 whitespace-nowrap">
                          ₹{b.totalFee.toLocaleString("en-IN")}
                        </td>

                        {/* Paid */}
                        <td className="px-5 py-3.5 text-sm font-semibold 
                                       text-green-600 whitespace-nowrap">
                          ₹{b.amountPaid.toLocaleString("en-IN")}
                        </td>

                        {/* Balance */}
                        <td className={`px-5 py-3.5 text-sm font-semibold 
                                        whitespace-nowrap
                                        ${balance > 0
                                          ? "text-red-500"
                                          : "text-gray-400"
                                        }`}>
                          {balance > 0
                            ? `₹${balance.toLocaleString("en-IN")}`
                            : "—"}
                        </td>

                        {/* Mode */}
                        <td className="px-5 py-3.5 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            {modeIcon[b.paymentMode] ?? ""}
                            {b.paymentMode}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-5 py-3.5">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs 
                                        font-semibold
                                        ${statusStyle[b.status]}`}
                          >
                            {b.status}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() =>
                                router.push(`/billing/${b._id}`)
                              }
                              className="text-xs text-blue-600 
                                         hover:underline font-medium"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(b._id)}
                              className="text-xs text-red-500 
                                         hover:underline font-medium"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="px-5 py-3 border-t border-gray-100">
              <Pagination
                page={page}
                totalPages={totalPages}
                total={total}
                limit={10}
                onPageChange={setPage}
              />
            </div>
          </>
        )}
      </Card>

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
