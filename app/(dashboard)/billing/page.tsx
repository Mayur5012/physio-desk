"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import Card from "@/components/ui/Card";
import SubscriptionBadge from "@/components/subscription/SubscriptionBadge";

import Badge from "@/components/ui/Badge";
import Spinner from "@/components/ui/Spinner";
import Pagination from "@/components/ui/Pagination";
import Toast, { useToast } from "@/components/ui/Toast";
import {
  CreditCard, Plus, IndianRupee, DollarSign, Zap, PieChart,
  TrendingUp, Clock, CheckCircle, Target, ArrowUpRight, Filter, Eye, Pencil, Trash2
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
  totalBilled:      number;
  collectedRevenue: number;
  pendingRevenue:   number;
  totalBills:       number;
}

const STATUS_FILTER = ["ALL", "PAID", "PENDING", "PARTIAL"];

const statusColor: Record<string, string> = {
  PAID:    "text-emerald-600 bg-emerald-50 shadow-emerald-100/50 outline-emerald-100",
  PENDING: "text-red-600 bg-red-50 shadow-red-100/50 outline-red-100",
  PARTIAL: "text-blue-600 bg-blue-50 shadow-blue-100/50 outline-blue-100",
};

const modeIcon: Record<string, string> = {
  CASH: "💵",
  UPI:  "📱",
  CARD: "💳",
};

export default function BillingPage() {
  const router = useRouter();
  const { doctor } = useAuthStore();
  const { toast, showToast, hideToast } = useToast();

  const [bills,      setBills]      = useState<Bill[]>([]);
  const [summary,    setSummary]    = useState<Summary>({
    totalBilled: 0, collectedRevenue: 0, pendingRevenue: 0, totalBills: 0,
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
      showToast("Failed to load invoice history", "error");
    } finally {
      setLoading(false);
    }
  }, [page, status]);

  useEffect(() => { fetchBills(); }, [fetchBills]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this invoice record?")) return;
    try {
      await api.delete(`/billing/${id}`);
      showToast("Invoice deleted successfully", "success");
      fetchBills();
    } catch {
      showToast("Failed to delete invoice", "error");
    }
  };

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-20 px-2">

      {/* Hero Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative">
         <div className="absolute -top-10 -left-10 w-40 h-40 bg-orange-100/30 rounded-full blur-3xl -z-10" />
         <div className="space-y-1">
            <div className="flex items-center gap-2 mb-2">
               <SubscriptionBadge doctor={doctor} />
               <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            </div>
            <h2 className="text-4xl font-black text-gray-900 tracking-tight italic flex items-center gap-4">
              Invoices<span className="text-orange-600">.</span>
            </h2>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Track payments and bills</p>
         </div>
         
         <button
            onClick={() => router.push("/billing/new")}
            className="px-8 py-3.5 bg-gray-900 text-white text-xs font-black uppercase tracking-[0.2em] rounded-2xl hover:shadow-2xl hover:translate-y-[-2px] transition-all flex items-center gap-3 italic"
         >
            <Plus size={18} />
            + New Entry
         </button>
      </div>

      {/* Billing Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
        {[
          { label: "Total Billed", value: `₹${(summary.totalBilled || 0).toLocaleString("en-IN")}`, icon: IndianRupee, gradient: "from-orange-600 to-red-600", sub: "Gross Invoiced" },
          { label: "Collected", value: `₹${(summary.collectedRevenue || 0).toLocaleString("en-IN")}`, icon: TrendingUp, gradient: "from-emerald-600 to-teal-600", sub: "Cash Flow" },
          { label: "Pending Payments", value: `₹${(summary.pendingRevenue || 0).toLocaleString("en-IN")}`, icon: Zap, gradient: "from-blue-600 to-indigo-600", sub: "Outstanding Invoices" },
          { label: "Monthly Avg", value: `₹${((summary.totalBilled || 0) / 12).toLocaleString("en-IN")}`, icon: PieChart, gradient: "from-purple-600 to-pink-600", sub: "Average per Month" },
        ].map((item, idx) => (
          <Card key={idx} className="p-8 border-none shadow-2xl relative overflow-hidden group hover:scale-[1.02] transition-all duration-500 bg-white ring-1 ring-gray-100">
             <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${item.gradient} opacity-5 rounded-bl-full`} />
             
             <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between">
                   <div className="p-3 bg-gray-50 rounded-2xl text-gray-400 group-hover:text-gray-900 transition-colors">
                      <item.icon size={22} />
                   </div>
                </div>
                <div>
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">{item.label}</p>
                   <h4 className="text-2xl font-black tracking-tight italic mt-1 text-gray-900">{item.value}</h4>
                   <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{item.sub}</p>
                </div>
             </div>
          </Card>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 px-2">
         <div className="flex bg-gray-100/50 p-1.5 rounded-[1.5rem] gap-1 ring-1 ring-gray-100 shadow-sm">
           {STATUS_FILTER.map((s) => (
             <button
               key={s}
               onClick={() => { setStatus(s); setPage(1); }}
               className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest
                           transition-all duration-300 italic
                           ${status === s
                             ? "bg-gray-900 text-white shadow-xl"
                             : "text-gray-400 hover:text-gray-900"}`}
             >
               {s === 'ALL' ? 'All' : s}
             </button>
           ))}
         </div>
         
         <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-2xl border border-gray-100 shadow-sm italic">
            <Filter size={14} className="text-gray-300" />
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Filter</p>
         </div>
      </div>

      {/* Invoices */}
      <Card className="border-none shadow-[0_30px_70px_rgba(0,0,0,0.06)] rounded-[3rem] bg-white overflow-hidden ring-1 ring-gray-100">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
            <Spinner size="lg" color="blue" />
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic animate-pulse">Loading data...</p>
          </div>
        ) : bills.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-40 text-center px-10">
            <div className="p-8 bg-gray-50 rounded-full text-gray-300 mb-6">
               <CreditCard size={64} strokeWidth={1} />
            </div>
            <h4 className="text-xl font-black text-gray-900 tracking-tight italic">No Records Found</h4>
            <p className="text-sm text-gray-400 font-medium max-w-xs mt-2">There are no billing records to display.</p>
            <button onClick={() => router.push("/billing/new")} className="mt-6 text-[10px] font-black text-orange-600 uppercase tracking-widest hover:underline">+ Create New Entry</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-8 py-6 text-left">
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Patient</p>
                  </th>
                  <th className="px-8 py-6 text-left">
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Amount</p>
                  </th>
                  <th className="px-8 py-6 text-left">
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Paid/Balance</p>
                  </th>
                  <th className="px-8 py-6 text-left">
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Date</p>
                  </th>
                  <th className="px-8 py-6 text-left">
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Payment Status</p>
                  </th>
                  <th className="px-8 py-6 text-left">
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Actions</p>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {bills.map((b) => {
                  const balance = b.totalFee - b.amountPaid;
                  return (
                    <tr key={b._id} className="group hover:bg-slate-50/50 transition-all duration-300">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center text-white text-xs font-black italic shadow-lg group-hover:rotate-12 transition-transform">
                             {b.clientId?.name?.charAt(0) ?? "?"}
                          </div>
                          <div>
                            <p className="text-sm font-black text-gray-900 uppercase tracking-tight italic">
                              {b.clientId?.name ?? "—"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-sm font-black text-gray-900 italic">
                        ₹{b.totalFee.toLocaleString("en-IN")}
                      </td>
                      <td className="px-8 py-6 text-sm font-black text-emerald-600 italic">
                        ₹{b.amountPaid.toLocaleString("en-IN")}
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2 bg-gray-50 w-fit px-3 py-1.5 rounded-xl border border-gray-100">
                          <span className="text-xs grayscale">{modeIcon[b.paymentMode] ?? "⚙️"}</span>
                          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{b.paymentMode}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <Badge
                          variant={b.status.toLowerCase() as any}
                          label={b.status}
                          className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest shadow-lg ${statusColor[b.status]}`}
                        />
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-1">
                           <button onClick={() => router.push(`/billing/${b._id}`)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                              <Pencil size={16} />
                           </button>
                           <button onClick={() => handleDelete(b._id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                              <Trash2 size={16} />
                           </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Navigation */}
        {!loading && bills.length > 0 && (
          <div className="flex items-center justify-between px-10 py-8 bg-gray-50/30 border-t border-gray-100">
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-orange-500" />
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Page {page} of {totalPages}</p>
             </div>
             <Pagination
                page={page}
                totalPages={totalPages}
                total={total}
                limit={10}
                onPageChange={setPage}
              />
          </div>
        )}
      </Card>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={hideToast} />
      )}
    </div>
  );
}
