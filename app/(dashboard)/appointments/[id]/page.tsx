"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import Spinner from "@/components/ui/Spinner";
import Toast, { useToast } from "@/components/ui/Toast";
import {
  ArrowLeft, User, Clock, Calendar,
  RefreshCw, ClipboardList, CheckCircle,
  XCircle, AlertCircle,
} from "lucide-react";
import { format, parseISO } from "date-fns";

const STATUS_OPTIONS = [
  { value: "SCHEDULED",   label: "Scheduled",   icon: Clock },
  { value: "PRESENT",     label: "Present",      icon: CheckCircle },
  { value: "ABSENT",      label: "Absent",       icon: XCircle },
  { value: "NO_SHOW",     label: "No Show",      icon: AlertCircle },
  { value: "CANCELLED",   label: "Cancelled",    icon: XCircle },
  { value: "RESCHEDULED", label: "Rescheduled",  icon: RefreshCw },
];

export default function AppointmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router  = useRouter();
  const { toast, showToast, hideToast } = useToast();

  const [appointment,   setAppointment]   = useState<any>(null);
  const [loading,       setLoading]       = useState(true);
  const [statusModal,   setStatusModal]   = useState(false);
  const [newStatus,     setNewStatus]     = useState("");
  const [updating,      setUpdating]      = useState(false);

  // ── Handle status update ─────────────────────────────────
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");

  const updateStatus = async () => {
    setUpdating(true);
    try {
      const payload: any = {
        status: newStatus,
        scope: "single",
      };

      if (newStatus === "RESCHEDULED") {
        if (!rescheduleDate || !rescheduleTime) {
          showToast("Please select a new date and time", "error");
          setUpdating(false);
          return;
        }
        payload.date = rescheduleDate;
        payload.startTime = rescheduleTime;
      }

      await api.put(`/appointments/${id}`, payload);
      
      // Update local state
      setAppointment((prev: any) => ({ 
        ...prev, 
        status: newStatus,
        date: newStatus === "RESCHEDULED" ? rescheduleDate : prev.date,
        startTime: newStatus === "RESCHEDULED" ? rescheduleTime : prev.startTime
      }));
      
      showToast("Appointment successfully recalibrated", "success");
      setStatusModal(false);
    } catch (error: any) {
      showToast(error.response?.data?.error || "Failed to update status", "error");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <Spinner size="lg" color="blue" />
        <p className="text-gray-500 font-medium italic">Retrieving appointment data...</p>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 max-w-md mx-auto text-center">
        <div className="p-4 bg-red-50 rounded-full">
           <AlertCircle size={40} className="text-red-400" />
        </div>
        <h3 className="text-xl font-black text-gray-900">Record Not Found</h3>
        <p className="text-gray-500">The appointment record you are trying to access doesn't exist or has been purged.</p>
        <button
          onClick={() => router.push("/appointments")}
          className="mt-2 px-8 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-black italic transition-all hover:shadow-xl"
        >
          Return to Registry
        </button>
      </div>
    );
  }

  const a = appointment;

  const TIME_LABELS = Array.from({ length: 32 }, (_, i) => {
    const mins = 7 * 60 + i * 30; // Starting 7 AM
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  }).filter(t => t <= "22:00");

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/appointments")}
            className="p-2.5 bg-white border border-gray-100 shadow-sm rounded-2xl hover:border-blue-200 transition-all text-gray-400 hover:text-blue-600"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight italic">
              Appointment Details<span className="text-blue-600">.</span>
            </h2>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
              Ref ID: {id.slice(-8).toUpperCase()}
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            setNewStatus(a.status);
            setRescheduleDate(format(parseISO(a.date), "yyyy-MM-dd"));
            setRescheduleTime(a.startTime);
            setStatusModal(true);
          }}
          className="px-6 py-3 bg-gray-900 text-white rounded-2xl text-sm font-black italic hover:shadow-2xl hover:translate-y-[-2px] transition-all flex items-center gap-2"
        >
          <RefreshCw size={16} />
          Modify Status
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          <Card className="p-8 border-none shadow-2xl shadow-slate-100 rounded-[2.5rem] bg-white ring-1 ring-gray-100 overflow-hidden relative">
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br opacity-10 rounded-bl-full
              ${a.status === 'PRESENT' ? 'from-green-500 to-emerald-500' : 
                a.status === 'SCHEDULED' ? 'from-blue-500 to-indigo-500' : 
                'from-gray-500 to-slate-500'}`} 
            />

            <div className="flex items-center gap-5 mb-10 relative z-10">
              <div className="w-16 h-16 rounded-[1.5rem] bg-gray-900 text-white flex items-center justify-center text-2xl font-black italic shadow-xl shadow-gray-200">
                {a.clientId?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3">
                   <h3 className="text-2xl font-black text-gray-900 tracking-tight">{a.clientId?.name}</h3>
                   <Badge
                    variant={a.status.toLowerCase() as any}
                    label={a.status.replace("_"," ")}
                    className="px-3 py-1 text-[10px] uppercase font-black tracking-widest rounded-lg"
                  />
                </div>
                <p className="text-sm font-bold text-gray-400 tracking-tight">{a.clientId?.phone} • {a.clientId?.email || 'No email provided'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-y-8 gap-x-12 relative z-10">
              {[
                {
                  icon: Calendar,
                  label: "Date",
                  value: format(parseISO(a.date), "dd MMM yyyy"),
                  color: "text-blue-600",
                  bg: "bg-blue-50"
                },
                {
                  icon: Clock,
                  label: "Time Slot",
                  value: `${a.startTime} – ${a.endTime}`,
                  sub: `${a.durationMins} Minute Session`,
                  color: "text-purple-600",
                  bg: "bg-purple-50"
                },
                {
                  icon: ClipboardList,
                  label: "Treatment Type",
                  value: a.type.replace("_"," ").toLowerCase(),
                  isCapitalized: true,
                  color: "text-emerald-600",
                  bg: "bg-emerald-50"
                },
                {
                  icon: RefreshCw,
                  label: "Frequency",
                  value: a.isRecurring ? "Recurring Series" : "One-time Engagement",
                  color: "text-orange-600",
                  bg: "bg-orange-50"
                },
              ].map(({ icon: Icon, label, value, sub, color, bg, isCapitalized }, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`p-1.5 rounded-lg ${bg} ${color}`}>
                       <Icon size={14} />
                    </div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
                  </div>
                  <p className={`text-sm font-black text-gray-900 ${isCapitalized ? 'capitalize' : ''}`}>{value}</p>
                  {sub && <p className="text-xs font-bold text-gray-400">{sub}</p>}
                </div>
              ))}
            </div>

            {a.notes && (
              <div className="mt-10 p-6 bg-slate-50/50 rounded-[1.5rem] border border-slate-100">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 italic">Clinical Directives & Notes</p>
                <p className="text-sm font-medium text-gray-600 italic leading-relaxed">"{a.notes}"</p>
              </div>
            )}
          </Card>

          {/* Quick Actions Integration */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => router.push(`/sessions/new?appointmentId=${id}&clientId=${a.clientId?._id}`)}
              className="group p-6 bg-blue-600 hover:bg-blue-700 text-white rounded-[2rem] transition-all shadow-xl shadow-blue-100 flex flex-col justify-between h-40"
            >
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                 <ClipboardList size={20} />
              </div>
              <div>
                <p className="text-sm font-black italic tracking-tight">Initiate Session</p>
                <p className="text-xs text-blue-100 font-medium opacity-80">Log progress & findings</p>
              </div>
            </button>
            <button
              onClick={() => router.push(`/clients/${a.clientId?._id}`)}
              className="group p-6 bg-white border border-gray-100 hover:border-gray-900 rounded-[2rem] transition-all shadow-sm flex flex-col justify-between h-40"
            >
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 group-hover:text-gray-900 transition-colors">
                 <User size={20} />
              </div>
              <div>
                <p className="text-sm font-black italic tracking-tight text-gray-900">Patient Profile</p>
                <p className="text-xs text-gray-400 font-medium">View full clinical history</p>
              </div>
            </button>
          </div>
        </div>

        {/* Sidebar Insights */}
        <div className="space-y-6">
           <Card className="p-6 border-none shadow-xl rounded-[2rem] bg-gradient-to-br from-gray-900 to-slate-800 text-white overflow-hidden relative">
              <div className="absolute -right-8 -bottom-8 opacity-10 rotate-12">
                 <RefreshCw size={120} />
              </div>
              <h4 className="text-sm font-black italic mb-4 tracking-tight border-b border-white/10 pb-2">About this series</h4>
              {a.isRecurring ? (
                <div className="space-y-4 relative z-10">
                   <p className="text-xs text-slate-300 leading-relaxed font-bold italic">
                      This encounter is part of an algorithmic sequence. Synchronizing status may affect projected outcomes.
                   </p>
                   <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                      <p className="text-[10px] font-black uppercase tracking-tight text-blue-400 mb-1">RECURRENCE PATTERN</p>
                      <p className="text-sm font-black italic text-white uppercase italic">{a.recurrencePattern?.replace("_"," ")}</p>
                      {a.recurrenceEveryN && <p className="text-[10px] font-bold text-slate-400 mt-1">Cycle Frequency: Every {a.recurrenceEveryN} Days</p>}
                   </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400 font-medium italic relative z-10">
                   Standalone engagement. No recurring dependencies detected.
                </p>
              )}
           </Card>

           <div className="p-1 border border-gray-100 rounded-[2rem] bg-gray-50/50">
              <div className="p-6 bg-white rounded-[1.75rem] shadow-sm space-y-4">
                 <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 italic">Timeline</h4>
                 <div className="space-y-4">
                    <div className="flex gap-3">
                       <div className="relative">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1" />
                          <div className="absolute top-3 left-1 w-[1px] h-10 bg-gray-100" />
                       </div>
                       <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-tight">Record Seeded</p>
                          <p className="text-xs font-bold text-gray-800 italic">{format(new Date(a.createdAt), 'dd MMM, HH:mm')}</p>
                       </div>
                    </div>
                    <div className="flex gap-3">
                       <div className="w-2 h-2 rounded-full bg-blue-500 mt-1" />
                       <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-tight">Last Updated</p>
                          <p className="text-xs font-bold text-gray-800 italic">{format(new Date(a.updatedAt), 'dd MMM, HH:mm')}</p>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Status Update Modal */}
      <Modal
        isOpen={statusModal}
        onClose={() => setStatusModal(false)}
        title="Update Status"
        size="md"
      >
        <div className="space-y-8 my-4">
          <div className="grid grid-cols-2 gap-3">
            {STATUS_OPTIONS.map(({ value, label, icon: Icon }) => (
              <button key={value}
                onClick={() => setNewStatus(value)}
                className={`flex items-center gap-3 px-5 py-4 rounded-2xl border-2 transition-all text-left relative overflow-hidden group
                  ${newStatus === value
                    ? "border-blue-600 bg-blue-50 text-blue-900 shadow-lg shadow-blue-50"
                    : "border-gray-100 hover:border-gray-200 text-gray-500"}`}
              >
                <div className={`p-2 rounded-xl transition-colors ${newStatus === value ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-400 group-hover:bg-gray-100'}`}>
                   <Icon size={16} />
                </div>
                <div>
                   <span className="text-xs font-black italic tracking-tight block leading-none">{label}</span>
                </div>
                {newStatus === value && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                     <div className="w-2 h-2 bg-blue-600 rounded-full animate-ping" />
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Reschedule Logic */}
          {newStatus === "RESCHEDULED" && (
            <div className="p-6 bg-gray-50 rounded-3xl border border-dashed border-gray-200 animate-in fade-in slide-in-from-top-2 duration-500">
               <h5 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                  <Calendar size={12} /> Reschedule Details
               </h5>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                     <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">New Target Date</label>
                     <input 
                        type="date"
                        className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                        value={rescheduleDate}
                        onChange={(e) => setRescheduleDate(e.target.value)}
                     />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">New Time Slot</label>
                    <select
                      className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none"
                      value={rescheduleTime}
                      onChange={(e) => setRescheduleTime(e.target.value)}
                    >
                      {TIME_LABELS.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
               </div>
            </div>
          )}
        </div>

        <div className="flex gap-4 pt-4 border-t border-gray-50">
          <button
            onClick={() => setStatusModal(false)}
            className="flex-1 px-4 py-4 bg-gray-100 text-gray-500 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-gray-200 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={updateStatus}
            disabled={updating}
            className="flex-[2] py-4 bg-gray-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-gray-200 hover:translate-y-[-2px] active:translate-y-0 transition-all disabled:opacity-50"
          >
            {updating ? "Updating..." : "Update Appointment"}
          </button>
        </div>
      </Modal>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={hideToast} />
      )}
    </div>
  );
}
