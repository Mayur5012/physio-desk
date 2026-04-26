"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Spinner from "@/components/ui/Spinner";
import Modal from "@/components/ui/Modal";
import Toast, { useToast } from "@/components/ui/Toast";
import {
  CalendarDays, ChevronLeft, ChevronRight,
  Plus, Clock, User, RefreshCw, Target, Activity, Filter, Trash2, Calendar
} from "lucide-react";
import { format, addDays, subDays, startOfWeek,
         endOfWeek, isSameDay, parseISO } from "date-fns";
import Link from "next/link";

interface Appointment {
  _id: string;
  date: string;
  startTime: string;
  endTime: string;
  durationMins: number;
  type: string;
  status: string;
  isRecurring: boolean;
  clientId: {
    _id: string;
    name: string;
    phone: string;
    therapyType: string;
  };
}

const THERAPY_STYLE: Record<string, string> = {
  PHYSIOTHERAPY: "bg-blue-50/80 border-blue-100 text-blue-900 shadow-blue-100/50",
  ACUPRESSURE:   "bg-emerald-50/80 border-emerald-100 text-emerald-900 shadow-emerald-100/50",
  COMBINED:      "bg-purple-50/80 border-purple-100 text-purple-900 shadow-purple-100/50",
};

const THERAPY_DOT: Record<string, string> = {
  PHYSIOTHERAPY: "bg-blue-500",
  ACUPRESSURE:   "bg-emerald-500",
  COMBINED:      "bg-purple-500",
};

const TIME_LABELS = Array.from({ length: 29 }, (_, i) => {
  const mins = 7 * 60 + i * 30;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
});

type ViewMode = "day" | "week";

export default function AppointmentsPage() {
  const router = useRouter();
  const { toast, showToast, hideToast } = useToast();

  const [view,         setView]         = useState<ViewMode>("day");
  const [currentDate,  setCurrentDate]  = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [cancelTarget, setCancelTarget] = useState<Appointment | null>(null);
  const [cancelling,   setCancelling]   = useState(false);
  const [cancelScope,  setCancelScope]  = useState<"single"|"future"|"all">("single");

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      let dateFrom: string, dateTo: string;

      if (view === "day") {
        const d = new Date(currentDate);
        d.setHours(0, 0, 0, 0);
        dateFrom = d.toISOString();
        d.setHours(23, 59, 59, 999);
        dateTo = d.toISOString();
      } else {
        dateFrom = startOfWeek(currentDate, { weekStartsOn: 1 }).toISOString();
        dateTo   = endOfWeek(currentDate,   { weekStartsOn: 1 }).toISOString();
      }

      const { data } = await api.get("/appointments", {
        params: { dateFrom, dateTo, limit: 100 },
      });
      setAppointments(data.appointments);
    } catch {
      showToast("Failed to load appointments", "error");
    } finally {
      setLoading(false);
    }
  }, [currentDate, view]);

  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

  const handleCancel = async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      await api.delete(`/appointments/${cancelTarget._id}?scope=${cancelScope}`);
      showToast("Appointment cancelled", "success");
      setCancelTarget(null);
      fetchAppointments();
    } catch {
      showToast("Failed to cancel appointment", "error");
    } finally {
      setCancelling(false);
    }
  };

  const apptsByDate = (date: Date) =>
    appointments.filter((a) =>
      isSameDay(parseISO(a.date), date)
    ).sort((a, b) => a.startTime.localeCompare(b.startTime));

  // ── Day View ───────────────────────────────────────────
  const DayView = () => {
    const dayAppts = apptsByDate(currentDate);

    return (
      <div className="relative space-y-1">
        {TIME_LABELS.map((time, idx) => {
          const appt = dayAppts.find((a) => a.startTime === time);
          const isHour = time.endsWith(":00");

          return (
            <div key={time} className={`flex gap-6 group/row ${isHour ? "pt-2" : ""}`}>
              <div className="w-16 text-right shrink-0 py-3">
                <span className={`text-[10px] font-black tracking-widest uppercase transition-colors ${isHour ? "text-gray-900" : "text-gray-300"}`}>
                  {time}
                </span>
              </div>

              <div className="flex-1 py-1 min-h-[48px] relative">
                 <div className={`absolute top-0 left-0 w-full h-px bg-gray-100/50 ${isHour ? 'bg-gray-200' : ''}`} />
                {appt ? (
                  <div
                    onClick={() => router.push(`/appointments/${appt._id}`)}
                    className={`mt-1 border-l-4 rounded-2xl p-4 cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.01] hover:translate-x-1 shadow-lg
                                ${THERAPY_STYLE[appt.clientId?.therapyType] || "bg-white border-gray-200"} group`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-xl bg-white shadow-sm ring-1 ring-black/5`}>
                           <Activity size={14} className={THERAPY_DOT[appt.clientId?.therapyType]?.replace('bg-', 'text-')} />
                        </div>
                        <div>
                          <h4 className="text-sm font-black tracking-tight italic group-hover:text-current transition-colors">
                            {appt.clientId?.name || "Unknown Patient"}
                          </h4>
                          <p className="text-[10px] font-bold opacity-60 uppercase tracking-tighter">
                            {appt.startTime} – {appt.endTime} · {appt.durationMins} min
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Badge
                          variant={appt.status.toLowerCase() as any}
                          label={appt.status.replace("_", " ")}
                          className="px-3 py-1 text-[9px] font-black uppercase tracking-widest shadow-sm"
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setCancelTarget(appt);
                          }}
                          className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() =>
                      router.push(`/appointments/new?date=${format(currentDate, "yyyy-MM-dd")}&time=${time}`)
                    }
                    className="h-10 mt-1 rounded-2xl border border-dashed border-gray-100 hover:border-blue-400 hover:bg-blue-50/30 transition-all cursor-crosshair flex items-center px-4 group"
                  >
                    <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity italic">
                      + Add Appointment
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {!loading && dayAppts.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-20">
            <CalendarDays size={120} strokeWidth={0.5} className="text-gray-300 mb-4" />
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.5em] italic">No Appointments</p>
          </div>
        )}
      </div>
    );
  };

  // ── Week View ──────────────────────────────────────────
  const WeekView = () => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekDays  = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

    return (
      <div className="overflow-x-auto rounded-[2rem] border border-gray-100 bg-white shadow-2xl">
        <div className="grid grid-cols-7 min-w-[900px] divide-x divide-gray-100">
          {weekDays.map((day) => {
            const dayAppts = apptsByDate(day);
            const isToday  = isSameDay(day, new Date());

            return (
              <div key={day.toISOString()} className={`min-h-[500px] flex flex-col ${isToday ? 'bg-blue-50/10' : ''}`}>
                <div className={`p-6 text-center border-b border-gray-50 flex flex-col items-center gap-1 ${isToday ? 'bg-gray-900 text-white rounded-b-3xl shadow-xl' : ''}`}>
                  <p className={`text-[10px] font-black uppercase tracking-widest ${isToday ? 'text-blue-400' : 'text-gray-400'}`}>
                    {format(day, "EEE")}
                  </p>
                  <p className={`text-2xl font-black italic tracking-tighter ${isToday ? 'text-white' : 'text-gray-900'}`}>
                    {format(day, "dd")}
                  </p>
                  {isToday && <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse mt-1" />}
                </div>

                <div className="flex-1 p-3 space-y-3">
                  {dayAppts.map((appt) => (
                    <div
                      key={appt._id}
                      onClick={() => router.push(`/appointments/${appt._id}`)}
                      className={`group p-3 rounded-2xl border transition-all duration-300 hover:shadow-xl hover:translate-y-[-2px] cursor-pointer
                                  ${THERAPY_STYLE[appt.clientId?.therapyType] || "bg-white border-gray-200"}`}
                    >
                      <div className="flex flex-col gap-1.5">
                         <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black italic">{appt.startTime}</span>
                            {appt.isRecurring && <RefreshCw size={10} className="text-current opacity-40 animate-spin-slow" />}
                         </div>
                         <p className="text-[11px] font-black tracking-tight group-hover:text-current transition-colors uppercase truncate">
                           {appt.clientId?.name}
                         </p>
                         <Badge
                            variant={appt.status.toLowerCase() as any}
                            label={appt.status.charAt(0)}
                            className="w-5 h-5 rounded-md flex items-center justify-center p-0 text-[8px] font-black uppercase ring-1 ring-white"
                          />
                      </div>
                    </div>
                  ))}

                  {dayAppts.length === 0 && (
                    <button
                      onClick={() => router.push(`/appointments/new?date=${format(day, "yyyy-MM-dd")}`)}
                      className="w-full text-[10px] font-black text-gray-300 hover:text-blue-500 hover:bg-blue-50/50 py-4 rounded-2xl border border-dashed border-gray-100 transition-all uppercase tracking-widest"
                    >
                      + Free
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const navigate = (dir: "prev" | "next") => {
    if (view === "day") {
      setCurrentDate((d) => dir === "prev" ? subDays(d, 1) : addDays(d, 1));
    } else {
      setCurrentDate((d) => dir === "prev" ? subDays(d, 7) : addDays(d, 7));
    }
  };

  const dateLabel = view === "day"
    ? format(currentDate, "EEEE, dd MMMM yyyy")
    : `${format(startOfWeek(currentDate, { weekStartsOn: 1 }), "dd MMM")} – ${format(endOfWeek(currentDate, { weekStartsOn: 1 }), "dd MMM yyyy")}`;

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-20 px-2">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative">
         <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-100/30 rounded-full blur-3xl -z-10" />
         <div className="space-y-1">
            <div className="flex items-center gap-2 mb-2">
               <div className="px-2 py-0.5 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-md italic">Online</div>
               <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            </div>
            <h2 className="text-4xl font-black text-gray-900 tracking-tight italic flex items-center gap-4">
              Appointments<span className="text-blue-600">.</span>
            </h2>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Manage your clinic's schedule</p>
         </div>
         
         <button
            onClick={() => router.push("/appointments/new")}
            className="px-8 py-3.5 bg-gray-900 text-white text-xs font-black uppercase tracking-[0.2em] rounded-2xl hover:shadow-2xl hover:translate-y-[-2px] transition-all flex items-center gap-3 italic"
         >
            <Plus size={18} />
            + New Appointment
         </button>
      </div>

      {/* Controls */}
      <Card className="border-none shadow-[0_30px_70px_rgba(0,0,0,0.06)] rounded-[2.5rem] bg-white p-6 ring-1 ring-gray-100">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">

          {/* View Toggle */}
          <div className="flex bg-gray-100/50 p-1.5 rounded-2xl gap-1 ring-1 ring-gray-100">
            {(["day", "week"] as ViewMode[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest
                            transition-all duration-300 italic
                            ${view === v
                              ? "bg-gray-900 text-white shadow-xl translate-y-[-1px]"
                              : "text-gray-400 hover:text-gray-900"}`}
              >
                {v} Mode
              </button>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-6 bg-gray-50/50 px-4 py-2 rounded-2xl border border-gray-100">
            <button
              onClick={() => navigate("prev")}
              className="p-2 text-gray-400 hover:text-gray-900 hover:bg-white rounded-xl shadow-sm transition-all"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="text-xs font-black text-gray-900 uppercase tracking-[0.15em] min-w-[220px] text-center italic">
              {dateLabel}
            </span>
            <button
              onClick={() => navigate("next")}
              className="p-2 text-gray-400 hover:text-gray-900 hover:bg-white rounded-xl shadow-sm transition-all"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-6 py-2.5 bg-white border border-gray-100 text-gray-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all italic shadow-sm"
          >
            Today
          </button>
        </div>
      </Card>

      {/* Main View Area */}
      <div className="grid grid-cols-1 gap-8 relative">
         {/* Visual Indicators */}
         <div className="flex items-center gap-6 px-4">
            {[
              { label: "Physio",      color: "bg-blue-500" },
              { label: "Acupressure", color: "bg-emerald-500" },
              { label: "Combined",    color: "bg-purple-500" },
            ].map(({ label, color }) => (
               <div key={label} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${color} shadow-sm border-2 border-white`} />
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">{label}</p>
               </div>
            ))}
            <div className="flex items-center gap-2 ml-auto">
               <RefreshCw size={12} className="text-gray-300 animate-spin-slow" />
               <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest italic">Repeating Series</p>
            </div>
         </div>

         <div className={loading ? 'opacity-50 pointer-events-none' : ''}>
            {view === "day"  && <DayView />}
            {view === "week" && <WeekView />}
         </div>
         
         {loading && (
           <div className="absolute inset-0 flex items-center justify-center bg-white/20 backdrop-blur-[1px] rounded-[3rem] z-10 transition-opacity">
              <Spinner size="lg" color="blue" />
           </div>
         )}
      </div>

      {/* Cancel Appointment Modal */}
      <Modal
        isOpen={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        title="Cancel Appointment"
        size="md"
      >
        <div className="p-2 space-y-6">
           <div className="flex items-center gap-4 p-5 bg-red-50 rounded-3xl border border-red-100">
              <div className="p-3 bg-red-500 text-white rounded-2xl shadow-xl shadow-red-200">
                 <Activity size={24} />
              </div>
              <div>
                 <h5 className="text-sm font-black text-gray-900 tracking-tight italic uppercase">Cancel Appointment?</h5>
                 <p className="text-xs font-medium text-red-600">{cancelTarget?.clientId?.name} · {cancelTarget?.startTime}</p>
              </div>
           </div>

           {cancelTarget?.isRecurring && (
             <div className="bg-gray-50 p-5 rounded-[1.5rem] border border-gray-100 space-y-4">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Options for repeating appointments:</p>
                <div className="space-y-3">
                   {[
                     { value: "single", label: "This appointment only" },
                     { value: "future", label: "This and future appointments" },
                     { value: "all",    label: "All appointments in series" },
                   ].map(({ value, label }) => (
                     <label key={value} className="flex items-center gap-4 cursor-pointer group">
                        <div className="relative flex items-center">
                           <input
                             type="radio"
                             name="cancelScope"
                             value={value}
                             checked={cancelScope === value}
                             onChange={() => setCancelScope(value as any)}
                             className="w-5 h-5 appearance-none border-2 border-gray-200 rounded-full checked:border-red-500 checked:bg-red-500 transition-all cursor-pointer"
                           />
                           {cancelScope === value && <div className="absolute inset-x-0 mx-auto w-1.5 h-1.5 bg-white rounded-full" />}
                        </div>
                        <span className={`text-xs font-black italic tracking-tight transition-colors ${cancelScope === value ? 'text-gray-900' : 'text-gray-400 group-hover:text-gray-600'}`}>{label}</span>
                     </label>
                   ))}
                </div>
             </div>
           )}

           <div className="flex gap-4 pt-4">
              <button
                 onClick={() => setCancelTarget(null)}
                 className="flex-1 px-4 py-4 bg-gray-100 text-gray-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 transition-all"
              >
                 Keep Appointment
              </button>
              <button
                 onClick={handleCancel}
                 disabled={cancelling}
                 className="flex-[2] py-4 bg-red-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-red-200 hover:shadow-2xl hover:translate-y-[-2px] transition-all"
              >
                 {cancelling ? "Processing..." : "Cancel Appointment"}
              </button>
           </div>
        </div>
      </Modal>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={hideToast} />
      )}
    </div>
  );
}
