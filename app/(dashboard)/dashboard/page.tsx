"use client";
import { useEffect, useState, useCallback } from "react";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Spinner from "@/components/ui/Spinner";
import {
  Users, CalendarDays, ClipboardList, IndianRupee,
  AlertCircle, UserX, Activity, ArrowUpRight, ArrowRight,
  Target, Sparkles, RefreshCw, Settings, UserPlus
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import Pagination from "@/components/ui/Pagination";

interface Stats {
  totalClients: number;
  activeClients: number;
  inactiveClients: number;
  todayAppointments: number;
  sessionsThisMonth: number;
  newClientsThisMonth: number;
  revenueThisMonth: number;
  pendingDues: number;
  noShowsThisWeek: number;
}

interface Appointment {
  _id: string;
  startTime: string;
  endTime: string;
  durationMins: number;
  type: string;
  status: string;
  clientId: {
    _id: string;
    name: string;
    phone: string;
    therapyType: string;
  };
}

const therapyUI: Record<string, { bg: string; text: string; label: string }> = {
  PHYSIOTHERAPY: { bg: "bg-blue-50/50",    text: "text-blue-600",    label: "Physio" },
  ACUPRESSURE:   { bg: "bg-emerald-50/50", text: "text-emerald-600", label: "Acu"    },
  COMBINED:      { bg: "bg-purple-50/50",  text: "text-purple-600",  label: "Mixed"  },
};

// ── Skeleton Stat Card ─────────────────────────────────────
function SkeletonStatCard() {
  return (
    <Card className="p-6 border-none shadow-2xl bg-white">
      <div className="animate-pulse space-y-4">
        <div className="w-10 h-10 bg-gray-100 rounded-xl" />
        <div className="w-20 h-2 bg-gray-100 rounded-full" />
        <div className="w-16 h-8 bg-gray-100 rounded-lg" />
        <div className="w-24 h-2 bg-gray-100 rounded-full" />
      </div>
    </Card>
  );
}

// ── Premium Stat Card ──────────────────────────────────────
function PremiumStatCard({
  label, value, icon: Icon, gradient, sub, percent
}: {
  label: string;
  value: string | number;
  icon: any;
  gradient: string;
  sub?: string;
  percent?: string;
}) {
  return (
    <Card className="p-6 border-none shadow-2xl relative overflow-hidden group hover:scale-[1.02] transition-all duration-500 bg-white">
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradient} opacity-5 rounded-bl-full group-hover:scale-110 transition-transform duration-700`} />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2.5 bg-gray-50 rounded-xl text-gray-400 group-hover:text-gray-900 group-hover:bg-white group-hover:shadow-lg transition-all duration-300">
            <Icon size={20} />
          </div>
          {percent && (
            <div className="flex items-center gap-1 text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-tighter">
              <ArrowUpRight size={10} /> {percent}
            </div>
          )}
        </div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] italic">{label}</p>
        <h4 className="text-3xl font-black text-gray-900 mt-1 tracking-tight italic">{value}</h4>
        {sub && (
          <div className="mt-3 flex items-center gap-2">
            <div className="w-1 h-1 rounded-full bg-blue-500" />
            <p className="text-xs font-bold text-gray-400 tracking-tight">{sub}</p>
          </div>
        )}
      </div>
    </Card>
  );
}

// ── Main Dashboard ─────────────────────────────────────────
export default function DashboardPage() {
  const { doctor } = useAuthStore();
  const router = useRouter();

  const [stats,        setStats]        = useState<Stats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const [appointments,  setAppointments]  = useState<Appointment[]>([]);
  const [apptLoading,   setApptLoading]   = useState(true);
  const [page,          setPage]          = useState(1);
  const [totalPages,    setTotalPages]    = useState(1);
  const [totalAppts,    setTotalAppts]    = useState(0);

  // ── Fetch stats ONCE ──────────────────────────────────
  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await api.get("/dashboard/stats");
      setStats(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // ── Fetch today's appointments (re-runs on page change) ─
  const loadAppointments = useCallback(async () => {
    setApptLoading(true);
    try {
      const res = await api.get(`/dashboard/today?page=${page}&limit=5`);
      setAppointments(res.data.appointments);
      setTotalPages(res.data.totalPages || 1);
      setTotalAppts(res.data.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setApptLoading(false);
    }
  }, [page]);

  // Stats load once on mount
  useEffect(() => { loadStats(); }, [loadStats]);

  // Appointments reload on page change
  useEffect(() => { loadAppointments(); }, [loadAppointments]);

  // Refresh everything
  const refreshAll = () => {
    loadStats();
    loadAppointments();
  };

  // Show full page loader only on very first load
  if (statsLoading && !stats && apptLoading && appointments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <Spinner size="lg" color="blue" />
        <p className="text-sm font-black text-gray-400 uppercase tracking-widest italic animate-pulse">
          Loading Dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-10 max-w-7xl mx-auto pb-20 px-2 sm:px-4">

      {/* Hero Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-100/30 rounded-full blur-3xl -z-10" />
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="px-2 py-0.5 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-md italic">Online</div>
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tight italic flex flex-wrap items-center gap-2 sm:gap-4">
            Overview<span className="text-blue-600">.</span>
          </h2>
          <p className="text-[10px] sm:text-sm font-bold text-gray-400 uppercase tracking-widest">
            Clinic Performance & Summary · {format(new Date(), "EEEE, dd MMMM yyyy")}
          </p>
        </div>

        <div className="flex items-center gap-3 sm:gap-4 bg-white/50 backdrop-blur-md p-2 rounded-2xl border border-white shadow-sm ring-1 ring-gray-100">
          <Link
            href="/appointments"
            className="px-4 sm:px-6 py-2.5 bg-gray-900 text-white text-[10px] sm:text-xs font-black uppercase tracking-widest rounded-xl hover:shadow-xl transition-all hover:translate-y-[-1px] italic"
          >
            + Book Appointment
          </Link>
          <button
            onClick={refreshAll}
            className="p-2.5 text-gray-400 hover:text-gray-900 transition-colors"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {/* ── Metric Grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {statsLoading ? (
          <>
            <SkeletonStatCard />
            <SkeletonStatCard />
            <SkeletonStatCard />
            <SkeletonStatCard />
          </>
        ) : (
          <>
            <PremiumStatCard
              label="Total Patients"
              value={stats?.totalClients || 0}
              icon={Users}
              gradient="from-blue-600 to-indigo-600"
              sub={`${stats?.activeClients || 0} active`}
            />
            <PremiumStatCard
              label="Today's Visits"
              value={stats?.todayAppointments || 0}
              icon={CalendarDays}
              gradient="from-emerald-600 to-teal-600"
              sub="scheduled"
            />
            <PremiumStatCard
              label="Monthly Visits"
              value={stats?.sessionsThisMonth || 0}
              icon={ClipboardList}
              gradient="from-violet-600 to-purple-600"
              sub={`${stats?.newClientsThisMonth || 0} new patients`}
            />
            <PremiumStatCard
              label="Monthly Revenue"
              value={`₹${(stats?.revenueThisMonth || 0).toLocaleString("en-IN")}`}
              icon={IndianRupee}
              gradient="from-orange-600 to-red-600"
              sub={`₹${(stats?.pendingDues || 0).toLocaleString("en-IN")} pending`}
            />
          </>
        )}
      </div>

      {/* ── Strategic Content ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Schedule */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-2">
            <div>
              <h3 className="text-lg sm:text-xl font-black text-gray-900 tracking-tight italic flex items-center gap-2">
                <Target size={18} className="text-blue-600" /> Today's Schedule
              </h3>
              <p className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Daily Appointments · {totalAppts} total
              </p>
            </div>
            <Link
              href="/appointments"
              className="text-[9px] sm:text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] hover:opacity-70 transition-opacity"
            >
              View All →
            </Link>
          </div>

          <Card className="p-4 sm:p-6 border-none shadow-2xl rounded-[2.5rem] bg-white ring-1 ring-gray-100 min-h-[400px] flex flex-col">

            {/* Appointments loading spinner — only on pagination change */}
            {apptLoading && (
              <div className="flex justify-center py-4">
                <Spinner size="sm" color="blue" />
              </div>
            )}

            <div className={`flex-1 space-y-4 transition-opacity duration-200 ${apptLoading ? "opacity-40 pointer-events-none" : "opacity-100"}`}>
              {appointments.length === 0 && !apptLoading ? (
                <div className="flex flex-col items-center justify-center h-full py-20 text-center space-y-4">
                  <div className="p-6 bg-gray-50 rounded-full text-gray-200">
                    <CalendarDays size={48} />
                  </div>
                  <div>
                    <p className="text-sm font-black text-gray-900 italic tracking-tight">Schedule is clear</p>
                    <p className="text-xs text-gray-400 font-medium">No appointments for today.</p>
                  </div>
                  <Link href="/appointments" className="text-xs font-black text-blue-600 uppercase tracking-widest mt-4">
                    + Book Appointment
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {appointments.map((appt) => {
                    const ui = therapyUI[appt.clientId?.therapyType || "PHYSIOTHERAPY"];
                    return (
                      <div
                        key={appt._id}
                        className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 p-4 rounded-3xl border border-gray-50 hover:bg-gray-50/80 hover:border-blue-100 hover:shadow-xl hover:translate-x-1 transition-all duration-300 group"
                      >
                        <div className="flex sm:flex-col items-center justify-between sm:justify-center p-3 bg-gray-900 text-white rounded-2xl w-full sm:w-24 shrink-0 shadow-lg shadow-gray-200 transition-transform group-hover:rotate-1">
                          <p className="text-xs font-black tracking-tight">{appt.startTime}</p>
                          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter opacity-70">Time</p>
                        </div>

                        <div className="flex-1 space-y-2 sm:space-y-1">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                            <h4 className="text-sm font-black text-gray-900 tracking-tight italic group-hover:text-blue-600 transition-colors uppercase truncate max-w-[200px]">
                              {appt.clientId?.name}
                            </h4>
                            <button
                              onClick={() => router.push(`/appointments/${appt._id}`)}
                              className="w-fit p-2.5 sm:p-3 bg-gray-900 text-white rounded-xl shadow-xl shadow-gray-200 hover:translate-y-[-2px] transition-all flex items-center gap-2 text-[9px] sm:text-[10px] font-black uppercase tracking-widest italic"
                            >
                              Details <ArrowRight size={12} />
                            </button>
                          </div>
                          <p className="text-[10px] sm:text-xs font-bold text-gray-400 tracking-tight">
                            ID: {appt._id.slice(-6).toUpperCase()} • {appt.durationMins} mins
                          </p>
                        </div>

                        <div className="flex sm:flex-col items-center sm:items-end gap-2 ml-auto sm:ml-0">
                          <Badge
                            variant={appt.status.toLowerCase() as any}
                            label={appt.status.replace("_", " ")}
                            className="px-3 py-1 text-[8px] sm:text-[9px] font-black uppercase tracking-widest"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-between">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                  Page {page} of {totalPages}
                </p>
                <Pagination
                  page={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                  limit={5}
                  total={totalAppts}
                />
              </div>
            )}
          </Card>
        </div>

        {/* Dashboard Insights */}
        <div className="space-y-8">

          {/* Alerts */}
          <div className="space-y-4">
            <h3 className="px-2 text-[10px] font-black text-red-500 uppercase tracking-[0.25em] flex items-center gap-2 italic">
              <Sparkles size={12} className="animate-pulse" /> Important Alerts
            </h3>
            <Card className="p-6 border-none shadow-2xl rounded-[2.5rem] bg-gray-900 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-red-500 opacity-10 rounded-bl-full" />
              <div className="space-y-6 relative z-10">
                {statsLoading ? (
                  <div className="animate-pulse space-y-4">
                    {[1,2,3].map(i => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="w-24 h-3 bg-white/10 rounded-full" />
                        <div className="w-8 h-3 bg-white/10 rounded-full" />
                      </div>
                    ))}
                  </div>
                ) : (
                  [
                    { label: "Missed Appointments", value: stats?.noShowsThisWeek || 0,   icon: AlertCircle, color: "text-red-400"    },
                    { label: "Inactive Patients",   value: stats?.inactiveClients || 0,   icon: UserX,       color: "text-yellow-400" },
                    { label: "Pending Payments",    value: `₹${(stats?.pendingDues || 0).toLocaleString("en-IN")}`, icon: Activity, color: "text-orange-400" },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 bg-white/5 rounded-xl ${item.color}`}>
                          <item.icon size={16} />
                        </div>
                        <span className="text-xs font-bold text-slate-400 tracking-tight italic">{item.label}</span>
                      </div>
                      <span className={`text-sm font-black italic ${item.color}`}>{item.value}</span>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            <h3 className="px-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] italic">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Add Patient",    href: "/clients/new",  icon: UserPlus,      color: "bg-blue-500"    },
                { label: "Record Session", href: "/sessions/new", icon: ClipboardList, color: "bg-purple-500"  },
                { label: "Create Bill",    href: "/billing/new",  icon: IndianRupee,   color: "bg-emerald-500" },
                { label: "Settings",       href: "/settings",     icon: Settings,      color: "bg-gray-400"    },
              ].map((action, idx) => (
                <Link
                  key={idx}
                  href={action.href}
                  className="flex flex-col items-center justify-center gap-4 p-6 rounded-[2rem] bg-white border border-gray-100 hover:border-gray-900 transition-all hover:shadow-xl group"
                >
                  <div className={`w-10 h-10 ${action.color} text-white rounded-xl flex items-center justify-center shadow-lg transition-transform group-hover:rotate-12`}>
                    <action.icon size={18} />
                  </div>
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest text-center group-hover:text-gray-900 italic">
                    {action.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Progress Goal */}
          <Card className="p-6 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-[2rem] border-none shadow-xl relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-all" />
            <p className="text-[10px] font-black uppercase tracking-widest text-blue-200 mb-2">Ongoing Goal</p>
            <p className="text-sm font-black italic tracking-tight mb-4">Focus: Patient care progress</p>
            <div className="flex items-center gap-2">
              <div className="h-1.5 flex-1 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white w-2/3" />
              </div>
              <span className="text-[10px] font-black">67%</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}