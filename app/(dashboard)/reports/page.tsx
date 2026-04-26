"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import Card from "@/components/ui/Card";
import Spinner from "@/components/ui/Spinner";
import Toast, { useToast } from "@/components/ui/Toast";
import {
  BarChart3, TrendingUp, Users, DollarSign, Calendar,
  FileText, Download, Filter, ArrowUpRight, ArrowDownRight,
  Target, PieChart, Activity, Clock
} from "lucide-react";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";

export default function ReportsPage() {
  const { toast, showToast, hideToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [monthYear, setMonthYear] = useState(new Date());
  const [timeRange, setTimeRange] = useState<"month" | "quarter" | "year">(
    "month"
  );

  // ── Load analytics data ───────────────────────────────────
  useEffect(() => {
    loadAnalytics();
  }, [monthYear, timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const startDate = getStartDate();
      const endDate = endOfMonth(monthYear);

      const response = await api.get("/reports", {
        params: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
      });
      setStats(response.data);
    } catch (error: any) {
      showToast("Failed to load reports", "error");
    } finally {
      setLoading(false);
    }
  };

  const getStartDate = () => {
    if (timeRange === "month") return startOfMonth(monthYear);
    if (timeRange === "quarter") return subMonths(monthYear, 3);
    return subMonths(monthYear, 12);
  };

  const handleExport = () => {
    // Advanced CSV export (Excel compatible)
    const csvContent = generateCSV();
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Clinic_Analytics_${format(monthYear, "MMM_yyyy")}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generateCSV = () => {
    if (!stats) return "";
    const rows = [
      ["Clinic Analytics Report"],
      ["Date Range", `${format(getStartDate(), "dd MMM yyyy")} to ${format(endOfMonth(monthYear), "dd MMM yyyy")}`],
      [""],
      ["FINANCIAL METRICS"],
      ["Total Revenue", `₹${stats.totalRevenue}`],
      ["Total Paid", `₹${stats.totalPaid}`],
      ["Pending Dues", `₹${stats.pendingDues}`],
      ["Collection Rate", `${((stats.totalPaid / (stats.totalRevenue || 1)) * 100).toFixed(2)}%`],
      ["Average Bill Value", `₹${Math.round(stats.totalRevenue / (stats.totalBills || 1))}`],
      [""],
      ["CLIENT METRICS"],
      ["Total Clients", stats.totalClients],
      ["New Clients", stats.newClients],
      ["Active Clients", stats.activeClients],
      ["Inactive Clients", stats.inactiveClients],
      ["Discharged Clients", stats.dischargedClients],
      [""],
      ["SESSION & APPOINTMENT ANALYTICS"],
      ["Total Appointments", stats.totalAppointments],
      ["Completed Appointments", stats.appointmentsCompleted],
      ["No-Show Appointments", stats.appointmentsNoShow],
      ["Appointment Completion Rate", `${((stats.appointmentsCompleted / (stats.totalAppointments || 1)) * 100).toFixed(2)}%`],
      ["Total Documentation Sessions", stats.totalSessions],
      ["Average Session Duration", `${Math.round(stats.avgSessionDuration)} mins`],
      ["Clients Improving (%)", `${((stats.sessionsImproving / (stats.totalSessions || 1)) * 100).toFixed(2)}%`],
    ];

    return rows.map(e => e.join(",")).join("\n");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <Spinner size="lg" color="blue" />
        <p className="text-gray-500 animate-pulse font-medium">Loading analytics...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
        <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <BarChart3 size={32} className="text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">No Data Found</h3>
        <p className="text-gray-500 mt-1">Try changing the date range or check back later.</p>
      </div>
    );
  }

  const collectionRate = (stats.totalPaid / (stats.totalRevenue || 1)) * 100;
  const completionRate = (stats.appointmentsCompleted / (stats.totalAppointments || 1)) * 100;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Header & Tropical Glassmorphism Effect */}
      <div className="flex items-end justify-between flex-wrap gap-6 relative">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider mb-2">
            <Activity size={14} /> Clinic Performance
          </div>
          <h2 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            Clinic Performance<span className="text-blue-600">.</span>
          </h2>
          <p className="text-gray-500 max-w-md">
            Track your clinic's growth, revenue, and patient results.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-semibold transition-all hover:shadow-xl hover:-translate-y-0.5 active:scale-95"
          >
            <Download size={18} />
            Export data
          </button>
        </div>
      </div>

      {/* Global Filters - Sleek Horizontal Bar */}
      <div className="bg-white/80 backdrop-blur-md border border-gray-200 p-2 rounded-2xl sticky top-4 z-30 shadow-sm flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl border border-gray-100 flex-1 min-w-[200px]">
          <Calendar size={18} className="text-gray-400" />
          <input
            type="month"
            value={format(monthYear, "yyyy-MM")}
            onChange={(e) => setMonthYear(new Date(e.target.value))}
            className="bg-transparent border-none focus:ring-0 text-sm font-semibold text-gray-900 w-full"
          />
        </div>

        <div className="flex bg-gray-100 p-1 rounded-xl">
          {(["month", "quarter", "year"] as const).map((r) => (
            <button
               key={r}
               onClick={() => setTimeRange(r)}
               className={`px-6 py-2 rounded-lg text-xs font-bold capitalize transition-all ${
                 timeRange === r
                   ? "bg-white text-blue-600 shadow-sm"
                   : "text-gray-500 hover:text-gray-700"
               }`}
             >
               {r === 'month' ? 'Monthly' : r === 'quarter' ? 'Quarterly' : 'Yearly'}
             </button>
          ))}
        </div>
      </div>

      {/* ── HIGHLIGHT METRICS ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Revenue Card */}
        <div className="group bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-8 text-white shadow-lg shadow-emerald-200 relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
            <DollarSign size={160} />
          </div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <span className="text-emerald-100 font-bold text-sm uppercase tracking-widest">Total Revenue</span>
              <div className="p-2 bg-white/20 rounded-lg">
                <TrendingUp size={20} />
              </div>
            </div>
            <h4 className="text-5xl font-black mb-2 flex items-baseline gap-1">
              <span className="text-2xl font-medium opacity-80">₹</span>
              {(stats.totalRevenue ?? 0).toLocaleString("en-IN")}
            </h4>
            <div className="flex items-center gap-2 text-emerald-100 text-sm font-medium">
              <div className="h-1.5 flex-1 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white transition-all duration-1000" 
                  style={{ width: `${collectionRate}%` }}
                />
              </div>
              <span>{collectionRate.toFixed(1)}% collected</span>
            </div>
          </div>
        </div>

        {/* Collection Efficiency */}
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
           <div>
            <div className="flex items-center justify-between mb-6">
              <div className="p-3 bg-orange-50 rounded-2xl text-orange-600">
                <Target size={24} />
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${collectionRate > 80 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                {collectionRate > 80 ? 'HEALTHY' : 'CRITICAL'}
              </span>
            </div>
            <h4 className="text-gray-500 font-bold text-xs uppercase tracking-widest mb-1">Pending Payments</h4>
            <p className="text-3xl font-black text-gray-900">
              ₹{(stats.pendingDues ?? 0).toLocaleString("en-IN")}
            </p>
          </div>
          <p className="text-sm text-gray-400 mt-4">
            Uncollected revenue from {stats.pendingBills} pending invoices in this period.
          </p>
        </div>

        {/* Engagement Meter */}
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
                <PieChart size={24} />
              </div>
            </div>
            <h4 className="text-gray-500 font-bold text-xs uppercase tracking-widest mb-1">Patient Growth</h4>
            <p className="text-3xl font-black text-gray-900">
              {stats.newClients ?? 0} <span className="text-blue-600 text-lg">New</span>
            </p>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-green-600 font-bold text-sm">
            <ArrowUpRight size={16} />
            <span>Growth: {((stats.newClients / (stats.totalClients || 1)) * 100).toFixed(1)}%</span>
            <span className="text-gray-300 font-normal ml-auto text-xs">of {stats.totalClients} total</span>
          </div>
        </div>
      </div>

      {/* Grid for Detailed Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Client Health Section */}
        <Card className="p-0 overflow-hidden border-none shadow-xl bg-slate-50">
          <div className="p-6 border-b border-gray-200 bg-white">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Users size={20} className="text-blue-600" />
              Patient Status
            </h3>
          </div>
          <div className="p-6 grid grid-cols-2 gap-4">
             <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                <p className="text-xs font-bold text-gray-400 uppercase mb-2">Ongoing Care</p>
                <div className="flex items-end justify-between">
                  <span className="text-2xl font-black text-teal-600">{stats.activeClients}</span>
                  <span className="text-xs font-semibold text-gray-500">{((stats.activeClients / stats.totalClients) * 100).toFixed(0)}%</span>
                </div>
             </div>
             <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                <p className="text-xs font-bold text-gray-400 uppercase mb-2">Total Recovered</p>
                <div className="flex items-end justify-between">
                  <span className="text-2xl font-black text-blue-600">{stats.dischargedClients}</span>
                  <span className="text-xs font-semibold text-gray-500 overflow-hidden text-ellipsis">Treatment Finished</span>
                </div>
             </div>
             <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                <p className="text-xs font-bold text-gray-400 uppercase mb-2">Inactive</p>
                <div className="flex items-end justify-between">
                  <span className="text-2xl font-black text-orange-500">{stats.inactiveClients}</span>
                  <span className="text-xs font-semibold text-gray-500">Dormant</span>
                </div>
             </div>
             <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                <p className="text-xs font-bold text-gray-400 uppercase mb-2">Lifetime Total</p>
                <div className="flex items-end justify-between">
                  <span className="text-2xl font-black text-gray-900">{stats.totalClients}</span>
                  <Activity size={18} className="text-gray-200" />
                </div>
             </div>
          </div>
        </Card>

        {/* Appointment Efficiency */}
        <Card className="p-0 overflow-hidden border-none shadow-xl bg-slate-50">
          <div className="p-6 border-b border-gray-200 bg-white">
             <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Calendar size={20} className="text-purple-600" />
              Appointment Stats
            </h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
               <div className="flex justify-between items-center mb-4">
                  <p className="text-sm font-bold text-gray-900">Success Rate</p>
                  <span className="px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-xs font-black">
                    {completionRate.toFixed(1)}%
                  </span>
               </div>
               <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden mb-6">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 transition-all duration-1000" 
                    style={{ width: `${completionRate}%` }}
                  />
               </div>
               <div className="grid grid-cols-3 gap-2">
                  <div className="text-center">
                    <p className="text-xl font-black text-gray-900">{stats.appointmentsCompleted}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Success</p>
                  </div>
                  <div className="text-center border-x border-gray-100">
                    <p className="text-xl font-black text-gray-900">{stats.appointmentsNoShow}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase text-red-400">No-Show</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-black text-gray-900">{stats.appointmentsCancelled}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase text-amber-500">Cancelled</p>
                  </div>
               </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-1 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                 <div className="p-3 bg-gray-50 rounded-xl text-gray-600">
                    <Clock size={20} />
                 </div>
                 <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Avg Duration</p>
                    <p className="text-lg font-black text-gray-900">{Math.round(stats.avgSessionDuration ?? 0)} <span className="text-xs font-normal">min</span></p>
                 </div>
              </div>
              <div className="flex-1 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                 <div className="p-3 bg-green-50 rounded-xl text-green-600">
                    <TrendingUp size={20} />
                 </div>
                 <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Recovery Rate</p>
                    <p className="text-lg font-black text-gray-900">{stats.sessionsImproving ?? 0} <span className="text-xs font-normal text-green-500 tracking-tighter">Improving</span></p>
                 </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Strategic Insights - AI-like feel */}
      <div className="bg-gradient-to-r from-gray-900 to-blue-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px] -mr-48 -mt-48" />
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-10">
          <div>
            <h3 className="text-2xl font-black mb-6 flex items-center gap-3 italic">
              <Target className="text-blue-400" /> How to Improve
            </h3>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex-shrink-0 flex items-center justify-center font-black text-blue-400">01</div>
                <div>
                  <h5 className="font-bold text-gray-100 italic">Unpaid Bills</h5>
                  <p className="text-gray-400 text-sm leading-relaxed mt-1">
                    Your collection efficiency is <span className="text-blue-400 font-bold">{collectionRate.toFixed(1)}%</span>. 
                    Targeting 90%+ could unlock ₹{(stats.pendingDues * 0.5).toLocaleString()} in immediate cash flow.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex-shrink-0 flex items-center justify-center font-black text-blue-400">02</div>
                <div>
                  <h5 className="font-bold text-gray-100 italic">Missed Appointments</h5>
                  <p className="text-gray-400 text-sm leading-relaxed mt-1">
                    With a no-show rate of <span className="text-red-400 font-bold">{((stats.appointmentsNoShow / (stats.totalAppointments || 1)) * 100).toFixed(1)}%</span>, 
                    consider automated SMS reminders to recover lost slots.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/10 rounded-3xl p-8 backdrop-blur-xl border border-white/10 self-center">
             <div className="flex items-center gap-4 mb-4">
               <div className="p-3 bg-blue-500 rounded-xl">
                 <ArrowUpRight size={24} className="text-white" />
               </div>
               <div>
                  <h5 className="font-black text-lg tracking-tight italic">Average Value</h5>
                  <p className="text-blue-300 text-xs font-bold uppercase tracking-widest">Summary</p>
               </div>
             </div>
             <p className="text-3xl font-black text-white py-4">
               ₹{Math.round(stats.totalRevenue / (stats.totalClients || 1)).toLocaleString("en-IN")}
               <span className="text-sm font-medium text-blue-200 ml-2 italic">per patient avg.</span>
             </p>
             <div className="h-1 w-full bg-white/20 rounded-full">
                <div className="h-full bg-blue-400 w-3/4 rounded-full shadow-[0_0_15px_rgba(96,165,250,0.5)]" />
             </div>
          </div>
        </div>
      </div>

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
