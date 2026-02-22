"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import Card from "@/components/ui/Card";
import Spinner from "@/components/ui/Spinner";
import Toast, { useToast } from "@/components/ui/Toast";
import {
  ArrowLeft, User, Clock, Calendar,
  Activity, ClipboardList, AlertCircle,
} from "lucide-react";
import { format, parseISO } from "date-fns";

export default function SessionDetailPage() {
  const { id }  = useParams<{ id: string }>();
  const router  = useRouter();
  const { toast, showToast, hideToast } = useToast();

  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/sessions/${id}`)
      .then(({ data }) => setSession(data.session))
      .catch(() => showToast("Failed to load session", "error"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <AlertCircle size={40} className="text-red-400" />
        <p className="text-gray-600">Session not found</p>
        <button
          onClick={() => router.push("/sessions")}
          className="text-blue-600 text-sm hover:underline"
        >
          ← Back to Sessions
        </button>
      </div>
    );
  }

  const PainBar = ({
    score, label,
  }: {
    score?: number; label: string;
  }) => {
    if (score === undefined || score === null) return null;
    const color = score <= 3
      ? "bg-green-500"
      : score <= 6
        ? "bg-yellow-500"
        : "bg-red-500";
    return (
      <div>
        <div className="flex justify-between mb-1">
          <span className="text-xs text-gray-500">{label}</span>
          <span className="text-xs font-bold text-gray-700">{score}/10</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${color} transition-all`}
            style={{ width: `${(score / 10) * 100}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/sessions")}
            className="p-2 hover:bg-gray-100 rounded-lg transition 
                       text-gray-500"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Session #{session.sessionNumber}
            </h2>
            <p className="text-sm text-gray-500">
              {session.createdAt
                ? format(parseISO(session.createdAt), "EEEE, dd MMMM yyyy")
                : "—"}
            </p>
          </div>
        </div>
        {session.clientId?._id && (
          <button
            onClick={() => router.push(`/clients/${session.clientId._id}`)}
            className="flex items-center gap-2 px-4 py-2 border 
                       border-gray-300 rounded-lg text-sm text-gray-700 
                       hover:bg-gray-50 transition"
          >
            <User size={15} />
            View Client
          </button>
        )}
      </div>

      {/* Client + Meta */}
      <Card className="p-6">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 
                          flex items-center justify-center text-lg font-bold 
                          shrink-0">
            {session.clientId?.name?.charAt(0)?.toUpperCase() ?? "?"}
          </div>
          <div>
            <p className="font-bold text-gray-900">
              {session.clientId?.name ?? "—"}
            </p>
            <p className="text-sm text-gray-500">
              {session.clientId?.phone ?? ""}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            {
              icon: Calendar,
              label: "Date",
              value: session.createdAt
                ? format(parseISO(session.createdAt), "dd MMM yyyy")
                : "—",
            },
            {
              icon: Clock,
              label: "Duration",
              value: `${session.durationMins ?? 60} minutes`,
            },
            {
              icon: ClipboardList,
              label: "Session",
              value: `#${session.sessionNumber}`,
            },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-start gap-3">
              <div className="p-2 bg-gray-50 rounded-lg shrink-0">
                <Icon size={15} className="text-gray-500" />
              </div>
              <div>
                <p className="text-xs text-gray-400">{label}</p>
                <p className="text-sm font-medium text-gray-800">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Pain Assessment */}
      {(session.painBefore !== undefined ||
        session.painAfter  !== undefined) && (
        <Card className="p-6 space-y-3">
          <h3 className="text-xs font-semibold text-gray-400 uppercase 
                         tracking-wider flex items-center gap-2">
            <Activity size={14} />
            Pain Assessment
          </h3>
          <PainBar score={session.painBefore} label="Before Treatment" />
          <PainBar score={session.painAfter}  label="After Treatment"  />
          {session.painBefore !== undefined &&
           session.painAfter  !== undefined && (
            <div
              className={`text-xs font-medium px-3 py-2 rounded-lg
                ${session.painBefore > session.painAfter
                  ? "bg-green-50 text-green-700"
                  : "bg-yellow-50 text-yellow-700"
                }`}
            >
              {session.painBefore > session.painAfter
                ? `✓ Pain reduced by ${session.painBefore - session.painAfter} points`
                : "⚠ Pain unchanged or increased"}
            </div>
          )}
        </Card>
      )}

      {/* SOAP Notes */}
      {(session.subjective || session.objective ||
        session.assessment || session.plan) && (
        <Card className="p-6 space-y-4">
          <h3 className="text-xs font-semibold text-gray-400 uppercase 
                         tracking-wider">
            SOAP Notes
          </h3>
          {[
            { key: "subjective", label: "S — Subjective" },
            { key: "objective",  label: "O — Objective"  },
            { key: "assessment", label: "A — Assessment"  },
            { key: "plan",       label: "P — Plan"        },
          ].map(({ key, label }) =>
            session[key] ? (
              <div key={key}>
                <p className="text-xs font-semibold text-blue-600 mb-1">
                  {label}
                </p>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {session[key]}
                </p>
              </div>
            ) : null
          )}
        </Card>
      )}

      {/* Techniques */}
      {(session.techniquesUsed?.length ?? 0) > 0 && (
        <Card className="p-6">
          <h3 className="text-xs font-semibold text-gray-400 uppercase 
                         tracking-wider mb-3">
            Techniques Used
          </h3>
          <div className="flex flex-wrap gap-2">
            {session.techniquesUsed.map((t: string) => (
              <span
                key={t}
                className="px-3 py-1.5 bg-blue-50 text-blue-700 
                           rounded-full text-xs font-medium 
                           border border-blue-100"
              >
                {t}
              </span>
            ))}
          </div>
        </Card>
      )}

      {/* Exercises + Private Note */}
      {(session.exercises || session.privateNote) && (
        <Card className="p-6 space-y-4">
          {session.exercises && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase 
                            tracking-wider mb-1">
                Home Exercises
              </p>
              <p className="text-sm text-gray-700 leading-relaxed">
                {session.exercises}
              </p>
            </div>
          )}
          {session.privateNote && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase 
                            tracking-wider mb-1">
                Notes
              </p>
              <p className="text-sm text-gray-700 leading-relaxed">
                {session.privateNote}
              </p>
            </div>
          )}
        </Card>
      )}

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
