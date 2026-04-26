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
      <div className="flex flex-col items-center justify-center h-[60vh] gap-6 text-center px-6">
        <div className="p-8 bg-gray-50 rounded-full text-red-300">
           <AlertCircle size={64} strokeWidth={1} />
        </div>
        <div>
           <h4 className="text-xl font-black text-gray-900 tracking-tight italic">Session Not Found</h4>
           <p className="text-sm text-gray-400 font-medium max-w-xs mt-2">The requested session record could not be located.</p>
        </div>
        <button
          onClick={() => router.push("/sessions")}
          className="px-8 py-3 bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-xl hover:shadow-2xl transition-all"
        >
          Return to Sessions
        </button>
      </div>
    );
  }

  const PainBar = ({
    score, label, icon: Icon
  }: {
    score?: number; label: string; icon: any;
  }) => {
    if (score === undefined || score === null) return null;
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-50 rounded-lg text-gray-400">
                 <Icon size={12} />
              </div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">{label}</p>
           </div>
           <span className="text-lg font-black text-gray-900 italic">{score}/10</span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden p-0.5 ring-1 ring-gray-100">
          <div
            className="h-full rounded-full bg-gray-900 transition-all duration-1000 shadow-[0_0_10px_rgba(0,0,0,0.1)]"
            style={{ width: `${(score / 10) * 100}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5">

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button
            onClick={() => router.push("/sessions")}
            className="p-4 bg-white shadow-xl shadow-gray-100 rounded-2xl hover:scale-110 transition-transform text-gray-400 hover:text-gray-900 border border-gray-50"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1">
               <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Session Details</span>
               <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            </div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight italic">
              Session #{session.sessionNumber}<span className="text-indigo-600">.</span>
            </h2>
          </div>
        </div>
        {session.clientId?._id && (
           <button
             onClick={() => router.push(`/clients/${session.clientId._id}`)}
             className="px-8 py-3.5 bg-white border border-gray-100 shadow-xl shadow-gray-100 text-gray-900 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:translate-y-[-2px] transition-all flex items-center gap-3 italic"
           >
             <User size={15} />
             View Patient
           </button>
        )}
      </div>

      {/* Patient + Stats */}
      <Card className="p-8 border-none shadow-2xl rounded-[2.5rem] bg-white ring-1 ring-gray-100">
        <div className="flex items-center gap-6 mb-10">
          <div className="w-16 h-16 rounded-[1.5rem] bg-gray-900 text-white flex items-center justify-center text-xl font-black italic shadow-2xl shadow-gray-200 rotate-2">
            {session.clientId?.name?.charAt(0)?.toUpperCase() ?? "?"}
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 italic">Treated Patient</p>
            <h3 className="text-2xl font-black text-gray-900 italic tracking-tight">
              {session.clientId?.name ?? "—"}
            </h3>
            <p className="text-xs font-bold text-gray-400 tracking-widest mt-1">
              CONTACT: {session.clientId?.phone ?? "N/A"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
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
              value: `${session.durationMins ?? 60} mins`,
            },
            {
              icon: ClipboardList,
              label: "Visit No",
              value: `#${session.sessionNumber}`,
            },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="bg-gray-50/50 p-6 rounded-[2rem] border border-gray-100 flex items-center gap-4 group hover:bg-white hover:shadow-xl transition-all">
               <div className="p-3 bg-white rounded-2xl text-gray-400 group-hover:text-indigo-600 transition-colors shadow-sm">
                  <Icon size={18} />
               </div>
               <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">{label}</p>
                  <p className="text-sm font-black text-gray-900 italic">{value}</p>
               </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Pain Progress */}
      {(session.painBefore !== undefined || session.painAfter !== undefined) && (
        <Card className="p-8 border-none shadow-2xl rounded-[2.5rem] bg-white ring-1 ring-gray-100 space-y-8">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                <Activity size={18} />
             </div>
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Pain Progress</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <PainBar score={session.painBefore} label="Pre-Treatment" icon={Activity} />
            <PainBar score={session.painAfter}  label="Post-Treatment" icon={Sparkles} />
          </div>
          {session.painBefore !== undefined && session.painAfter !== undefined && (
            <div className={`p-6 rounded-[2rem] flex items-center justify-between px-8 border ${
              session.painBefore > session.painAfter ? "bg-emerald-50/50 border-emerald-100 text-emerald-700" : "bg-gray-50 border-gray-100 text-gray-500"
            }`}>
               <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${session.painBefore > session.painAfter ? "bg-emerald-500 text-white" : "bg-gray-400 text-white"}`}>
                     {session.painBefore > session.painAfter ? <Activity size={14} /> : <AlertCircle size={14} />}
                  </div>
                  <p className="text-xs font-black uppercase tracking-widest italic">
                    {session.painBefore > session.painAfter 
                      ? `${session.painBefore - session.painAfter} pt reduction detected` 
                      : "No measurable delta"}
                  </p>
               </div>
               <p className="text-[10px] font-black uppercase tracking-widest italic opacity-50">Progress</p>
            </div>
          )}
        </Card>
      )}

      {/* SOAP Notes */}
      {(session.subjective || session.objective || session.assessment || session.plan) && (
        <Card className="p-8 border-none shadow-2xl rounded-[2.5rem] bg-white ring-1 ring-gray-100 space-y-10">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                <ClipboardList size={18} />
             </div>
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Clinical Observations</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
            {[
              { key: "subjective", label: "Patient Complaints" },
              { key: "objective",  label: "Clinical Findings"  },
              { key: "assessment", label: "Evaluation"  },
              { key: "plan",       label: "Future Plan"        },
            ].map(({ key, label }) =>
              session[key] ? (
                <div key={key} className="space-y-3">
                  <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] italic flex items-center gap-3">
                    <span className="w-8 h-[1px] bg-indigo-100" /> {label}
                  </p>
                  <p className="text-sm font-bold text-gray-600 leading-relaxed italic pl-11">
                    {session[key]}
                  </p>
                </div>
              ) : null
            )}
          </div>
        </Card>
      )}

      {/* Techniques Applied */}
      {(session.techniquesUsed?.length ?? 0) > 0 && (
        <Card className="p-8 border-none shadow-2xl rounded-[2.5rem] bg-gray-900 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500 opacity-5 rounded-bl-full" />
          <h3 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.25em] mb-6 italic">
            Applied Techniques
          </h3>
          <div className="flex flex-wrap gap-3">
            {session.techniquesUsed.map((t: string) => (
              <span
                key={t}
                className="px-4 py-2 bg-white/5 text-gray-300 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/5"
              >
                {t}
              </span>
            ))}
          </div>
        </Card>
      )}

      {/* Exercises + Observations */}
      {(session.exercises || session.privateNote) && (
        <Card className="p-8 border-none shadow-2xl rounded-[2.5rem] bg-white ring-1 ring-gray-100 space-y-8">
          {session.exercises && (
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 italic ml-2">
                Home Exercises
              </p>
              <div className="p-6 bg-emerald-50/30 rounded-[2rem] border border-emerald-50">
                 <p className="text-sm font-bold text-gray-700 leading-relaxed italic">
                   {session.exercises}
                 </p>
              </div>
            </div>
          )}
          {session.privateNote && (
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 italic ml-2">
                Additional Observations
              </p>
              <div className="p-6 bg-gray-50 rounded-[2rem] border border-gray-100">
                 <p className="text-sm font-bold text-gray-700 leading-relaxed italic">
                   {session.privateNote}
                 </p>
              </div>
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
