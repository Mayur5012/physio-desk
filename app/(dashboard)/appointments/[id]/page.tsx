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

  useEffect(() => {
    api.get(`/appointments/${id}`)
      .then(({ data }) => {
        setAppointment(data.appointment);
        setNewStatus(data.appointment.status);
      })
      .catch(() => showToast("Failed to load appointment", "error"))
      .finally(() => setLoading(false));
  }, [id]);

  const updateStatus = async () => {
    setUpdating(true);
    try {
      await api.put(`/appointments/${id}`, {
        status: newStatus,
        scope: "single",
      });
      setAppointment((prev: any) => ({ ...prev, status: newStatus }));
      showToast("Status updated", "success");
      setStatusModal(false);
    } catch {
      showToast("Failed to update status", "error");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="flex flex-col items-center justify-center 
                      h-full gap-3">
        <AlertCircle size={40} className="text-red-400" />
        <p className="text-gray-600">Appointment not found</p>
        <button
          onClick={() => router.push("/appointments")}
          className="text-blue-600 text-sm hover:underline"
        >
          ← Back
        </button>
      </div>
    );
  }

  const a = appointment;

  return (
    <div className="max-w-2xl mx-auto space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/appointments")}
            className="p-2 hover:bg-gray-100 rounded-lg transition 
                       text-gray-500"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Appointment Detail
            </h2>
            <p className="text-sm text-gray-500">
              {format(parseISO(a.date), "EEEE, dd MMMM yyyy")}
            </p>
          </div>
        </div>
        <button
          onClick={() => setStatusModal(true)}
          className="px-4 py-2 border border-gray-300 rounded-lg 
                     text-sm font-medium text-gray-700 
                     hover:bg-gray-50 transition"
        >
          Update Status
        </button>
      </div>

      {/* Main Card */}
      <Card className="p-6">
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 
                            text-blue-700 flex items-center justify-center 
                            text-lg font-bold">
              {a.clientId?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">
                {a.clientId?.name}
              </p>
              <p className="text-sm text-gray-500">{a.clientId?.phone}</p>
            </div>
          </div>
          <Badge
            variant={a.status.toLowerCase() as any}
            label={a.status.charAt(0) +
                   a.status.slice(1).replace("_"," ").toLowerCase()}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[
            {
              icon: Calendar,
              label: "Date",
              value: format(parseISO(a.date), "dd MMM yyyy"),
            },
            {
              icon: Clock,
              label: "Time",
              value: `${a.startTime} – ${a.endTime} (${a.durationMins} min)`,
            },
            {
              icon: ClipboardList,
              label: "Type",
              value: a.type.replace("_"," ").charAt(0) +
                     a.type.replace("_"," ").slice(1).toLowerCase(),
            },
            {
              icon: RefreshCw,
              label: "Recurring",
              value: a.isRecurring ? "Yes" : "No",
            },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-start gap-3">
              <div className="p-2 bg-gray-50 rounded-lg">
                <Icon size={16} className="text-gray-500" />
              </div>
              <div>
                <p className="text-xs text-gray-400">{label}</p>
                <p className="text-sm font-medium text-gray-800">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {a.notes && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400 mb-1">Notes</p>
            <p className="text-sm text-gray-700">{a.notes}</p>
          </div>
        )}

        {/* Recurrence info */}
        {a.isRecurring && (
          <div className="mt-4 pt-4 border-t border-gray-100 
                          flex items-center gap-2 text-xs text-blue-600">
            <RefreshCw size={13} />
            <span>
              Recurring · Pattern:{" "}
              {a.recurrencePattern?.replace("_"," ").toLowerCase()}
              {a.recurrenceEveryN && ` · Every ${a.recurrenceEveryN} days`}
            </span>
          </div>
        )}
      </Card>

      {/* Quick Actions */}
      <Card className="p-4">
        <p className="text-xs font-semibold text-gray-400 uppercase 
                      tracking-wider mb-3">
          Quick Actions
        </p>
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() =>
              router.push(`/sessions/new?appointmentId=${id}
                          &clientId=${a.clientId?._id}`)
            }
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 
                       hover:bg-blue-700 text-white rounded-lg text-sm 
                       font-medium transition"
          >
            <ClipboardList size={15} />
            Add Session Record
          </button>
          <button
            onClick={() =>
              router.push(`/clients/${a.clientId?._id}`)
            }
            className="flex items-center gap-2 px-4 py-2 border 
                       border-gray-300 rounded-lg text-sm font-medium 
                       text-gray-700 hover:bg-gray-50 transition"
          >
            <User size={15} />
            View Client
          </button>
        </div>
      </Card>

      {/* Status Update Modal */}
      <Modal
        isOpen={statusModal}
        onClose={() => setStatusModal(false)}
        title="Update Appointment Status"
        size="sm"
      >
        <div className="space-y-2 mb-5">
          {STATUS_OPTIONS.map(({ value, label, icon: Icon }) => (
            <label key={value}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl 
                          border cursor-pointer transition
                          ${newStatus === value
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"}`}
            >
              <input
                type="radio"
                value={value}
                checked={newStatus === value}
                onChange={() => setNewStatus(value)}
                className="w-4 h-4 text-blue-600"
              />
              <Icon size={16} className="text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                {label}
              </span>
            </label>
          ))}
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setStatusModal(false)}
            className="flex-1 px-4 py-2.5 border border-gray-300 
                       rounded-lg text-sm font-medium text-gray-700 
                       hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={updateStatus}
            disabled={updating}
            className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 
                       disabled:bg-blue-400 text-white rounded-lg text-sm 
                       font-medium transition"
          >
            {updating ? "Saving..." : "Update"}
          </button>
        </div>
      </Modal>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={hideToast} />
      )}
    </div>
  );
}
