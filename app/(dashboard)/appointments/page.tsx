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
  Plus, Clock, User, RefreshCw,
} from "lucide-react";
import { format, addDays, subDays, startOfWeek,
         endOfWeek, isSameDay, parseISO } from "date-fns";

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
  PHYSIOTHERAPY: "bg-blue-50 border-blue-200 text-blue-800",
  ACUPRESSURE:   "bg-green-50 border-green-200 text-green-800",
  COMBINED:      "bg-purple-50 border-purple-200 text-purple-800",
};

const THERAPY_DOT: Record<string, string> = {
  PHYSIOTHERAPY: "bg-blue-500",
  ACUPRESSURE:   "bg-green-500",
  COMBINED:      "bg-purple-500",
};

// Generate 30-min time labels 7AM–9PM
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
        dateFrom = startOfWeek(currentDate, { weekStartsOn: 1 })
          .toISOString();
        dateTo   = endOfWeek(currentDate,   { weekStartsOn: 1 })
          .toISOString();
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
      await api.delete(
        `/appointments/${cancelTarget._id}?scope=${cancelScope}`
      );
      showToast("Appointment cancelled", "success");
      setCancelTarget(null);
      fetchAppointments();
    } catch {
      showToast("Failed to cancel", "error");
    } finally {
      setCancelling(false);
    }
  };

  // Filter appointments for a specific date
  const apptsByDate = (date: Date) =>
    appointments.filter((a) =>
      isSameDay(parseISO(a.date), date)
    ).sort((a, b) => a.startTime.localeCompare(b.startTime));

  // ── Day View ───────────────────────────────────────────
  const DayView = () => {
    const dayAppts = apptsByDate(currentDate);

    return (
      <div className="relative">
        {/* Time grid */}
        {TIME_LABELS.map((time, idx) => {
          const appt = dayAppts.find((a) => a.startTime === time);
          const isHour = time.endsWith(":00");

          return (
            <div key={time}
              className={`flex gap-4 ${isHour ? "border-t border-gray-100" : ""}`}
            >
              {/* Time label */}
              <div className="w-14 text-right shrink-0 py-2">
                {isHour && (
                  <span className="text-xs text-gray-400 font-mono">
                    {time}
                  </span>
                )}
              </div>

              {/* Slot content */}
              <div className="flex-1 py-1 min-h-[32px]">
                {appt ? (
                  <div
                    className={`border rounded-lg px-3 py-2 cursor-pointer 
                                hover:shadow-sm transition-shadow
                                ${THERAPY_STYLE[appt.clientId?.therapyType] 
                                  || "bg-gray-50 border-gray-200"}`}
                    onClick={() => router.push(`/appointments/${appt._id}`)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full shrink-0
                          ${THERAPY_DOT[appt.clientId?.therapyType] 
                            || "bg-gray-400"}`}
                        />
                        <span className="text-sm font-semibold">
                          {appt.clientId?.name || "Unknown"}
                        </span>
                        {appt.isRecurring && (
                          <RefreshCw size={11}
                            className="text-gray-400" />
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={appt.status.toLowerCase() as any}
                          label={appt.status.charAt(0) +
                                 appt.status.slice(1)
                                   .replace("_"," ").toLowerCase()}
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setCancelTarget(appt);
                          }}
                          className="text-xs text-gray-400 
                                     hover:text-red-500 transition px-1"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 ml-4">
                      {appt.startTime} – {appt.endTime} ·{" "}
                      {appt.durationMins} min ·{" "}
                      {appt.clientId?.phone}
                    </p>
                  </div>
                ) : (
                  <div
                    onClick={() =>
                      router.push(
                        `/appointments/new?date=${
                          format(currentDate, "yyyy-MM-dd")
                        }&time=${time}`
                      )
                    }
                    className="h-7 rounded border border-dashed 
                               border-transparent hover:border-blue-200 
                               hover:bg-blue-50/50 transition cursor-pointer 
                               flex items-center px-2 group"
                  >
                    <span className="text-xs text-blue-400 opacity-0 
                                     group-hover:opacity-100 transition">
                      + Book
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* No appointments */}
        {!loading && dayAppts.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center 
                          justify-center pointer-events-none">
            <CalendarDays size={36} className="text-gray-200 mb-2" />
            <p className="text-sm text-gray-400">No appointments today</p>
          </div>
        )}
      </div>
    );
  };

  // ── Week View ──────────────────────────────────────────
  const WeekView = () => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekDays  = Array.from({ length: 7 }, (_, i) =>
      addDays(weekStart, i)
    );

    return (
      <div className="overflow-x-auto">
        <div className="grid grid-cols-7 gap-px bg-gray-200 min-w-[700px]">
          {weekDays.map((day) => {
            const dayAppts = apptsByDate(day);
            const isToday  = isSameDay(day, new Date());

            return (
              <div key={day.toISOString()}
                className="bg-white p-2 min-h-[200px]">
                {/* Day header */}
                <div className={`text-center mb-2 py-1 rounded-lg
                                 ${isToday
                                   ? "bg-blue-600 text-white"
                                   : ""}`}
                >
                  <p className={`text-xs font-medium 
                                 ${isToday
                                   ? "text-blue-100"
                                   : "text-gray-500"}`}>
                    {format(day, "EEE")}
                  </p>
                  <p className={`text-sm font-bold 
                                 ${isToday
                                   ? "text-white"
                                   : "text-gray-800"}`}>
                    {format(day, "dd")}
                  </p>
                </div>

                {/* Appointments */}
                <div className="space-y-1">
                  {dayAppts.map((appt) => (
                    <div
                      key={appt._id}
                      onClick={() =>
                        router.push(`/appointments/${appt._id}`)
                      }
                      className={`text-xs px-2 py-1.5 rounded cursor-pointer
                                  truncate border
                                  ${THERAPY_STYLE[
                                    appt.clientId?.therapyType
                                  ] || "bg-gray-50 border-gray-200"}`}
                    >
                      <span className="font-medium">
                        {appt.startTime}
                      </span>{" "}
                      {appt.clientId?.name}
                    </div>
                  ))}

                  {dayAppts.length === 0 && (
                    <button
                      onClick={() =>
                        router.push(
                          `/appointments/new?date=${
                            format(day, "yyyy-MM-dd")
                          }`
                        )
                      }
                      className="w-full text-xs text-gray-300 
                                 hover:text-blue-400 text-center py-2 
                                 transition"
                    >
                      + Add
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

  // ── Navigation ──────────────────────────────────────────
  const navigate = (dir: "prev" | "next") => {
    if (view === "day") {
      setCurrentDate((d) =>
        dir === "prev" ? subDays(d, 1) : addDays(d, 1)
      );
    } else {
      setCurrentDate((d) =>
        dir === "prev" ? subDays(d, 7) : addDays(d, 7)
      );
    }
  };

  const dateLabel = view === "day"
    ? format(currentDate, "EEEE, dd MMMM yyyy")
    : `${format(startOfWeek(currentDate, { weekStartsOn: 1 }), "dd MMM")} –
       ${format(endOfWeek(currentDate,   { weekStartsOn: 1 }), "dd MMM yyyy")}`;

  return (
    <div className="space-y-5 max-w-5xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Appointments</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {appointments.length} appointment
            {appointments.length !== 1 ? "s" : ""} in view
          </p>
        </div>
        <button
          onClick={() => router.push("/appointments/new")}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 
                     text-white text-sm font-medium px-4 py-2.5 rounded-lg 
                     transition"
        >
          <Plus size={16} />
          Book Appointment
        </button>
      </div>

      {/* Calendar Controls */}
      <Card className="p-4">
        <div className="flex items-center justify-between flex-wrap gap-3">

          {/* View Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
            {(["day", "week"] as ViewMode[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium 
                            transition capitalize
                            ${view === v
                              ? "bg-white text-gray-900 shadow-sm"
                              : "text-gray-500 hover:text-gray-700"}`}
              >
                {v}
              </button>
            ))}
          </div>

          {/* Date Navigation */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("prev")}
              className="p-2 hover:bg-gray-100 rounded-lg transition 
                         text-gray-500"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="text-sm font-medium text-gray-800 
                             min-w-[200px] text-center">
              {dateLabel}
            </span>
            <button
              onClick={() => navigate("next")}
              className="p-2 hover:bg-gray-100 rounded-lg transition 
                         text-gray-500"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Today Button */}
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-1.5 border border-gray-300 rounded-lg 
                       text-sm text-gray-600 hover:bg-gray-50 transition"
          >
            Today
          </button>
        </div>
      </Card>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-gray-500">
        {[
          { label: "Physio",      color: "bg-blue-500" },
          { label: "Acupressure", color: "bg-green-500" },
          { label: "Combined",    color: "bg-purple-500" },
        ].map(({ label, color }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
            {label}
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <RefreshCw size={11} className="text-gray-400" />
          Recurring
        </div>
      </div>

      {/* Calendar */}
      <Card>
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : (
          <div className="p-4">
            {view === "day"  && <DayView />}
            {view === "week" && <WeekView />}
          </div>
        )}
      </Card>

      {/* Cancel Modal */}
      <Modal
        isOpen={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        title="Cancel Appointment"
        size="sm"
      >
        <p className="text-sm text-gray-700 mb-1">
          Cancel appointment for{" "}
          <span className="font-semibold">
            {cancelTarget?.clientId?.name}
          </span>{" "}
          on{" "}
          <span className="font-semibold">
            {cancelTarget &&
              format(parseISO(cancelTarget.date), "dd MMM yyyy")}
          </span>{" "}
          at{" "}
          <span className="font-semibold">{cancelTarget?.startTime}</span>?
        </p>

        {cancelTarget?.isRecurring && (
          <div className="mt-3 mb-4 space-y-2">
            <p className="text-xs font-medium text-gray-600">
              This is a recurring appointment. Cancel:
            </p>
            {[
              { value: "single", label: "Only this appointment" },
              { value: "future", label: "This and all future appointments" },
              { value: "all",    label: "All appointments in this series" },
            ].map(({ value, label }) => (
              <label
                key={value}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="radio"
                  name="cancelScope"
                  value={value}
                  checked={cancelScope === value}
                  onChange={() =>
                    setCancelScope(value as typeof cancelScope)
                  }
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm text-gray-700">{label}</span>
              </label>
            ))}
          </div>
        )}

        <div className="flex gap-3 mt-4">
          <button
            onClick={() => setCancelTarget(null)}
            className="flex-1 px-4 py-2.5 border border-gray-300 
                       rounded-lg text-sm font-medium text-gray-700 
                       hover:bg-gray-50 transition"
          >
            Keep
          </button>
          <button
            onClick={handleCancel}
            disabled={cancelling}
            className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 
                       disabled:bg-red-400 text-white rounded-lg text-sm 
                       font-medium transition"
          >
            {cancelling ? "Cancelling..." : "Cancel Appointment"}
          </button>
        </div>
      </Modal>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={hideToast} />
      )}
    </div>
  );
}
