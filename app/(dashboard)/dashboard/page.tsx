"use client";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Spinner from "@/components/ui/Spinner";
import {
  Users,
  CalendarDays,
  ClipboardList,
  IndianRupee,
  TrendingUp,
  AlertCircle,
  UserX,
  UserPlus,
  Clock,
} from "lucide-react";
import { format } from "date-fns";

// ─── Types ────────────────────────────────────────────────
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
    name: string;
    phone: string;
    therapyType: string;
  };
}

// ─── Therapy Badge Color ───────────────────────────────────
const therapyColor: Record<string, string> = {
  PHYSIOTHERAPY: "bg-blue-50 border-blue-200 text-blue-700",
  ACUPRESSURE:   "bg-green-50 border-green-200 text-green-700",
  COMBINED:      "bg-purple-50 border-purple-200 text-purple-700",
};

const therapyLabel: Record<string, string> = {
  PHYSIOTHERAPY: "Physio",
  ACUPRESSURE:   "Acupressure",
  COMBINED:      "Combined",
};

// ─── Stat Card ─────────────────────────────────────────────
function StatCard({
  label,
  value,
  icon: Icon,
  iconBg,
  iconColor,
  sub,
}: {
  label: string;
  value: string | number;
  icon: any;
  iconBg: string;
  iconColor: string;
  sub?: string;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase 
                        tracking-wide">
            {label}
          </p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
        </div>
        <div className={`p-2.5 rounded-lg ${iconBg}`}>
          <Icon size={20} className={iconColor} />
        </div>
      </div>
    </Card>
  );
}

// ─── Time Slot Row ─────────────────────────────────────────
function TimeSlotRow({ appointment }: { appointment: Appointment }) {
  const therapy = appointment.clientId?.therapyType || "PHYSIOTHERAPY";
  return (
    <div className={`flex items-center gap-4 px-4 py-3 rounded-lg 
                     border ${therapyColor[therapy]} mb-2`}>
      <div className="flex items-center gap-1.5 text-xs font-mono 
                      font-medium w-24 shrink-0">
        <Clock size={12} />
        {appointment.startTime}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {appointment.clientId?.name || "Unknown Client"}
        </p>
        <p className="text-xs text-gray-500">
          {therapyLabel[therapy]} · {appointment.durationMins} min
        </p>
      </div>
      <Badge
        variant={
          appointment.status.toLowerCase() as any
        }
        label={appointment.status.replace("_", " ")}
      />
    </div>
  );
}

// ─── Generate Time Slots 7AM–9PM ───────────────────────────
function generateTimeSlots() {
  const slots = [];
  for (let h = 7; h < 21; h++) {
    slots.push(`${String(h).padStart(2, "0")}:00`);
    slots.push(`${String(h).padStart(2, "0")}:30`);
  }
  return slots;
}

// ─── Main Dashboard ────────────────────────────────────────
export default function DashboardPage() {
  const { doctor } = useAuthStore();
  const [stats, setStats] = useState<Stats | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, todayRes] = await Promise.all([
          api.get("/dashboard/stats"),
          api.get("/dashboard/today"),
        ]);
        setStats(statsRes.data);
        setAppointments(todayRes.data.appointments);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good Morning";
    if (h < 17) return "Good Afternoon";
    return "Good Evening";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* Greeting */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">
          {greeting()}, {doctor?.name?.split(" ")[0]} 👋
        </h2>
        <p className="text-sm text-gray-500 mt-0.5">
          {format(new Date(), "EEEE, dd MMMM yyyy")}
        </p>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Clients"
          value={stats?.totalClients || 0}
          icon={Users}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
          sub={`${stats?.activeClients || 0} active`}
        />
        <StatCard
          label="Today's Appointments"
          value={stats?.todayAppointments || 0}
          icon={CalendarDays}
          iconBg="bg-green-50"
          iconColor="text-green-600"
          sub="scheduled"
        />
        <StatCard
          label="Sessions This Month"
          value={stats?.sessionsThisMonth || 0}
          icon={ClipboardList}
          iconBg="bg-purple-50"
          iconColor="text-purple-600"
          sub={`${stats?.newClientsThisMonth || 0} new clients`}
        />
        <StatCard
          label="Revenue This Month"
          value={`₹${(stats?.revenueThisMonth || 0).toLocaleString("en-IN")}`}
          icon={IndianRupee}
          iconBg="bg-orange-50"
          iconColor="text-orange-600"
          sub={`₹${(stats?.pendingDues || 0).toLocaleString("en-IN")} pending`}
        />
      </div>

      {/* ── Main Content ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Today's Schedule — 2/3 width */}
        <div className="lg:col-span-2">
          <Card>
            <div className="px-5 py-4 border-b border-gray-100 
                            flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">
                Today's Schedule
              </h3>
              <a
                href="/appointments"
                className="text-xs text-blue-600 hover:underline font-medium"
              >
                View all →
              </a>
            </div>

            <div className="p-4">
              {appointments.length === 0 ? (
                <div className="text-center py-10">
                  <CalendarDays
                    size={36}
                    className="text-gray-300 mx-auto mb-2"
                  />
                  <p className="text-sm text-gray-500">
                    No appointments today
                  </p>
                  <a
                    href="/appointments"
                    className="text-xs text-blue-600 hover:underline mt-1 
                               inline-block"
                  >
                    + Book appointment
                  </a>
                </div>
              ) : (
                <div className="space-y-1">
                  {appointments.map((appt) => (
                    <TimeSlotRow key={appt._id} appointment={appt} />
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Quick Stats — 1/3 width */}
        <div className="space-y-4">

          {/* Alerts Card */}
          <Card>
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900">
                Quick Alerts
              </h3>
            </div>
            <div className="p-4 space-y-3">
              {/* No-shows */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                  <span className="text-sm text-gray-600">
                    No-shows this week
                  </span>
                </div>
                <span className="text-sm font-semibold text-red-600">
                  {stats?.noShowsThisWeek || 0}
                </span>
              </div>

              {/* Inactive clients */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-yellow-500 shrink-0"/>
                  <span className="text-sm text-gray-600">
                    Inactive clients
                  </span>
                </div>
                <span className="text-sm font-semibold text-yellow-600">
                  {stats?.inactiveClients || 0}
                </span>
              </div>

              {/* New this month */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-green-500 shrink-0"/>
                  <span className="text-sm text-gray-600">
                    New this month
                  </span>
                </div>
                <span className="text-sm font-semibold text-green-600">
                  {stats?.newClientsThisMonth || 0}
                </span>
              </div>

              {/* Pending dues */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-orange-500 shrink-0"/>
                  <span className="text-sm text-gray-600">
                    Pending dues
                  </span>
                </div>
                <span className="text-sm font-semibold text-orange-600">
                  ₹{(stats?.pendingDues || 0).toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </Card>

          {/* Client Breakdown Card */}
          <Card>
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900">
                Client Status
              </h3>
            </div>
            <div className="p-4 space-y-3">
              {[
                {
                  label: "Active",
                  value: stats?.activeClients || 0,
                  total: stats?.totalClients || 1,
                  color: "bg-green-500",
                },
                {
                  label: "Inactive",
                  value: stats?.inactiveClients || 0,
                  total: stats?.totalClients || 1,
                  color: "bg-yellow-400",
                },
                {
                  label: "Discharged",
                  value:
                    (stats?.totalClients || 0) -
                    (stats?.activeClients || 0) -
                    (stats?.inactiveClients || 0),
                  total: stats?.totalClients || 1,
                  color: "bg-gray-300",
                },
              ].map(({ label, value, total, color }) => (
                <div key={label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600">{label}</span>
                    <span className="font-medium text-gray-900">{value}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full ${color} transition-all`}
                      style={{
                        width: `${Math.round((value / total) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}

              <a
                href="/clients"
                className="block text-center text-xs text-blue-600 
                           hover:underline font-medium pt-1"
              >
                Manage clients →
              </a>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "New Client",     href: "/clients/new",           icon: UserPlus },
                { label: "Book Slot",      href: "/appointments/new",      icon: CalendarDays },
                { label: "Add Session",    href: "/sessions/new",          icon: ClipboardList },
                { label: "Add Billing",    href: "/billing/new",           icon: IndianRupee },
              ].map(({ label, href, icon: Icon }) => (
                <a
                  key={href}
                  href={href}
                  className="flex flex-col items-center gap-1.5 p-3 
                             rounded-lg border border-gray-200 
                             hover:border-blue-300 hover:bg-blue-50 
                             transition-colors group"
                >
                  <Icon
                    size={18}
                    className="text-gray-400 group-hover:text-blue-600 
                               transition-colors"
                  />
                  <span className="text-xs text-gray-600 
                                   group-hover:text-blue-700 font-medium">
                    {label}
                  </span>
                </a>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
