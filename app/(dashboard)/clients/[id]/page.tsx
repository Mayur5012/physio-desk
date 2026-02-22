"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Tabs from "@/components/ui/Tabs";
import Spinner from "@/components/ui/Spinner";
import Toast, { useToast } from "@/components/ui/Toast";
import {
  ArrowLeft, Pencil, Phone, Mail, MapPin,
  User, Calendar, IndianRupee, ClipboardList,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";

const TABS = [
  { key: "overview",      label: "Overview" },
  { key: "sessions",      label: "Sessions" },
  { key: "appointments",  label: "Appointments" },
  { key: "billing",       label: "Billing" },
];

const THERAPY_COLOR: Record<string, string> = {
  PHYSIOTHERAPY: "text-blue-600 bg-blue-50",
  ACUPRESSURE:   "text-green-600 bg-green-50",
  COMBINED:      "text-purple-600 bg-purple-50",
};

export default function ClientProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { toast, showToast, hideToast } = useToast();

  const [data,       setData]       = useState<any>(null);
  const [sessions,   setSessions]   = useState<any[]>([]);
  const [appts,      setAppts]      = useState<any[]>([]);
  const [billing,    setBilling]    = useState<any[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [activeTab,  setActiveTab]  = useState("overview");

  useEffect(() => {
    const load = async () => {
      try {
        const { data: res } = await api.get(`/clients/${id}`);
        setData(res);
      } catch {
        showToast("Failed to load client", "error");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  // Load tab data on demand
  useEffect(() => {
    if (activeTab === "sessions" && sessions.length === 0) {
      api.get(`/sessions?clientId=${id}`)
        .then((r) => setSessions(r.data.sessions))
        .catch(() => {});
    }
    if (activeTab === "appointments" && appts.length === 0) {
      api.get(`/appointments?clientId=${id}`)
        .then((r) => setAppts(r.data.appointments))
        .catch(() => {});
    }
    if (activeTab === "billing" && billing.length === 0) {
      api.get(`/billing?clientId=${id}`)
        .then((r) => setBilling(r.data.entries))
        .catch(() => {});
    }
  }, [activeTab]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <AlertCircle size={40} className="text-red-400" />
        <p className="text-gray-600">Client not found</p>
        <button
          onClick={() => router.push("/clients")}
          className="text-blue-600 text-sm hover:underline"
        >
          ← Back to clients
        </button>
      </div>
    );
  }

  const { client, summary } = data;
  const progressPct = client.totalSessionsPlanned
    ? Math.round((summary.sessionsCompleted / client.totalSessionsPlanned) * 100)
    : null;

  return (
    <div className="max-w-4xl mx-auto space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/clients")}
            className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-500"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{client.name}</h2>
            <p className="text-sm text-gray-500">Client Profile</p>
          </div>
        </div>
        <button
          onClick={() => router.push(`/clients/${id}/edit`)}
          className="flex items-center gap-2 px-4 py-2.5 border 
                     border-gray-300 rounded-lg text-sm font-medium 
                     text-gray-700 hover:bg-gray-50 transition"
        >
          <Pencil size={15} />
          Edit
        </button>
      </div>

      {/* Hero Card */}
      <Card className="p-6">
        <div className="flex items-start gap-5">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white 
                          flex items-center justify-center text-2xl font-bold 
                          shrink-0">
            {client.name.charAt(0).toUpperCase()}
          </div>

          {/* Info Grid */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap mb-3">
              <h3 className="text-lg font-bold text-gray-900">
                {client.name}
              </h3>
              <Badge
                variant={client.status.toLowerCase() as any}
                label={client.status.charAt(0) +
                       client.status.slice(1).toLowerCase()}
              />
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-medium 
                            ${THERAPY_COLOR[client.therapyType]}`}
              >
                {client.therapyType.charAt(0) +
                 client.therapyType.slice(1).toLowerCase()}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              <div className="flex items-center gap-1.5 text-gray-600">
                <User size={14} className="text-gray-400" />
                {client.age}y /{" "}
                {client.gender.charAt(0) +
                 client.gender.slice(1).toLowerCase()}
              </div>
              <div className="flex items-center gap-1.5 text-gray-600">
                <Phone size={14} className="text-gray-400" />
                {client.phone}
              </div>
              {client.email && (
                <div className="flex items-center gap-1.5 text-gray-600 
                                col-span-2">
                  <Mail size={14} className="text-gray-400" />
                  {client.email}
                </div>
              )}
              {client.address && (
                <div className="flex items-center gap-1.5 text-gray-600 
                                col-span-2">
                  <MapPin size={14} className="text-gray-400" />
                  {client.address}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 
                        pt-5 border-t border-gray-100">
          {[
            {
              label: "Sessions Done",
              value: summary.sessionsCompleted,
              sub:   client.totalSessionsPlanned
                       ? `of ${client.totalSessionsPlanned}`
                       : "total",
              icon: ClipboardList,
              color: "text-purple-600",
            },
            {
              label: "Last Visit",
              value: summary.lastVisit
                ? format(new Date(summary.lastVisit), "dd MMM")
                : "—",
              sub: summary.lastVisit
                ? format(new Date(summary.lastVisit), "yyyy")
                : "No visits yet",
              icon: Calendar,
              color: "text-blue-600",
            },
            {
              label: "Total Paid",
              value: `₹${(summary.totalPaid || 0).toLocaleString("en-IN")}`,
              sub: "collected",
              icon: IndianRupee,
              color: "text-green-600",
            },
            {
              label: "Pending Dues",
              value: `₹${(summary.totalPending || 0).toLocaleString("en-IN")}`,
              sub: "outstanding",
              icon: IndianRupee,
              color: summary.totalPending > 0
                ? "text-red-600" : "text-gray-400",
            },
          ].map(({ label, value, sub, icon: Icon, color }) => (
            <div key={label} className="text-center">
              <Icon size={18} className={`mx-auto mb-1 ${color}`} />
              <p className="text-lg font-bold text-gray-900">{value}</p>
              <p className="text-xs text-gray-400">{label}</p>
              <p className="text-xs text-gray-300">{sub}</p>
            </div>
          ))}
        </div>

        {/* Progress Bar */}
        {progressPct !== null && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex justify-between text-xs text-gray-500 mb-1.5">
              <span>Session Progress</span>
              <span>
                {summary.sessionsCompleted} / {client.totalSessionsPlanned}{" "}
                sessions ({progressPct}%)
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className="h-2 rounded-full bg-blue-600 transition-all"
                style={{ width: `${Math.min(progressPct, 100)}%` }}
              />
            </div>
          </div>
        )}
      </Card>

      {/* Tabs */}
      <Card>
        <div className="px-5 pt-4">
          <Tabs tabs={TABS} active={activeTab} onChange={setActiveTab} />
        </div>

        <div className="p-5">

          {/* ── Overview Tab ── */}
          {activeTab === "overview" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoRow label="Chief Complaint" value={client.chiefComplaint} />
                <InfoRow
                  label="Body Part"
                  value={`${client.bodyPart} (${
                    client.bodySide.charAt(0) +
                    client.bodySide.slice(1).toLowerCase()
                  })`}
                />
                {client.diagnosis && (
                  <InfoRow label="Diagnosis" value={client.diagnosis} />
                )}
                {client.medicalHistory && (
                  <InfoRow
                    label="Medical History"
                    value={client.medicalHistory}
                  />
                )}
                <InfoRow
                  label="Client Type"
                  value={
                    client.clientType.charAt(0) +
                    client.clientType.slice(1).replace("_", " ").toLowerCase()
                  }
                />
                <InfoRow
                  label="Session Fee"
                  value={`₹${client.sessionFee}`}
                />
                {client.referralSource && (
                  <InfoRow
                    label="Referral Source"
                    value={client.referralSource.replace("_", " ")}
                  />
                )}
                {client.emergencyContact && (
                  <InfoRow
                    label="Emergency Contact"
                    value={client.emergencyContact}
                  />
                )}
                <InfoRow
                  label="Registered On"
                  value={format(new Date(client.createdAt), "dd MMM yyyy")}
                />
                <InfoRow
                  label="Email Reminders"
                  value={client.reminderEnabled ? "Enabled" : "Disabled"}
                />
              </div>

              {/* Next Appointment */}
              {summary.nextAppointment && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 
                                rounded-xl">
                  <p className="text-xs font-semibold text-blue-600 
                                uppercase tracking-wide mb-1">
                    Next Appointment
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    {format(
                      new Date(summary.nextAppointment.date),
                      "EEEE, dd MMM yyyy"
                    )}{" "}
                    at {summary.nextAppointment.startTime}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ── Sessions Tab ── */}
          {activeTab === "sessions" && (
            <div>
              <div className="flex justify-end mb-4">
                <button
                  onClick={() =>
                    router.push(`/sessions/new?clientId=${id}`)
                  }
                  className="text-sm bg-blue-600 hover:bg-blue-700 
                             text-white px-4 py-2 rounded-lg transition"
                >
                  + Add Session
                </button>
              </div>
              {sessions.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">
                  No sessions recorded yet
                </p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 text-xs 
                                   text-gray-500 uppercase">
                      <th className="text-left py-2 px-3">#</th>
                      <th className="text-left py-2 px-3">Date</th>
                      <th className="text-left py-2 px-3">Therapy</th>
                      <th className="text-left py-2 px-3">Duration</th>
                      <th className="text-left py-2 px-3">Progress</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {sessions.map((s: any) => (
                      <tr key={s._id} className="hover:bg-gray-50">
                        <td className="py-3 px-3 text-gray-500">
                          {s.sessionNumber}
                        </td>
                        <td className="py-3 px-3">
                          {format(new Date(s.createdAt), "dd MMM yyyy")}
                        </td>
                        <td className="py-3 px-3 text-gray-600">
                          {s.therapyType.charAt(0) +
                           s.therapyType.slice(1).toLowerCase()}
                        </td>
                        <td className="py-3 px-3 text-gray-600">
                          {s.durationMins} min
                        </td>
                        <td className="py-3 px-3">
                          <Badge
                            variant={s.progress.toLowerCase() as any}
                            label={
                              s.progress.charAt(0) +
                              s.progress.slice(1).toLowerCase()
                            }
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* ── Appointments Tab ── */}
          {activeTab === "appointments" && (
            <div>
              <div className="flex justify-end mb-4">
                <button
                  onClick={() =>
                    router.push(`/appointments/new?clientId=${id}`)
                  }
                  className="text-sm bg-blue-600 hover:bg-blue-700 
                             text-white px-4 py-2 rounded-lg transition"
                >
                  + Book Appointment
                </button>
              </div>
              {appts.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">
                  No appointments yet
                </p>
              ) : (
                <div className="space-y-2">
                  {appts.map((a: any) => (
                    <div
                      key={a._id}
                      className="flex items-center justify-between 
                                 px-4 py-3 rounded-lg border border-gray-100 
                                 hover:border-gray-200 transition"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {format(new Date(a.date), "EEE, dd MMM yyyy")}
                        </p>
                        <p className="text-xs text-gray-500">
                          {a.startTime} – {a.endTime} · {a.durationMins} min
                        </p>
                      </div>
                      <Badge
                        variant={a.status.toLowerCase() as any}
                        label={
                          a.status.charAt(0) +
                          a.status.slice(1).replace("_", " ").toLowerCase()
                        }
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Billing Tab ── */}
          {activeTab === "billing" && (
            <div>
              <div className="flex justify-end mb-4">
                <button
                  onClick={() =>
                    router.push(`/billing/new?clientId=${id}`)
                  }
                  className="text-sm bg-blue-600 hover:bg-blue-700 
                             text-white px-4 py-2 rounded-lg transition"
                >
                  + Add Entry
                </button>
              </div>
              {billing.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">
                  No billing entries yet
                </p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 text-xs 
                                   text-gray-500 uppercase">
                      <th className="text-left py-2 px-3">Date</th>
                      <th className="text-left py-2 px-3">Fee</th>
                      <th className="text-left py-2 px-3">Paid</th>
                      <th className="text-left py-2 px-3">Mode</th>
                      <th className="text-left py-2 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {billing.map((b: any) => (
                      <tr key={b._id} className="hover:bg-gray-50">
                        <td className="py-3 px-3">
                          {format(new Date(b.date), "dd MMM yyyy")}
                        </td>
                        <td className="py-3 px-3">₹{b.totalFee}</td>
                        <td className="py-3 px-3">₹{b.amountPaid}</td>
                        <td className="py-3 px-3 text-gray-500">
                          {b.paymentMode}
                        </td>
                        <td className="py-3 px-3">
                          <Badge
                            variant={b.status.toLowerCase() as any}
                            label={
                              b.status.charAt(0) +
                              b.status.slice(1).toLowerCase()
                            }
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </Card>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={hideToast} />
      )}
    </div>
  );
}

// ── Helper Component ───────────────────────────────────────
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-400 uppercase 
                    tracking-wide mb-0.5">
        {label}
      </p>
      <p className="text-sm text-gray-800">{value}</p>
    </div>
  );
}
