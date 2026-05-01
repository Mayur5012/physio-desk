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
  AlertCircle, Activity, Sparkles, Target, Zap, Clock, TrendingDown, ArrowRight, Pill, HeartPulse, ShieldCheck
} from "lucide-react";
import { format } from "date-fns";
import { PRACTICE_TYPE_COLORS, PRACTICE_TYPE_CONFIG } from "@/lib/constants";

const TABS = [
  { key: "overview",     label: "Overview"  },
  { key: "sessions",     label: "Sessions"   },
  { key: "appointments", label: "Schedule"  },
  { key: "documents",    label: "Documents" },
  { key: "billing",      label: "Billing"      },
];


const STATUS_STYLE: Record<string, string> = {
  PAID:    "bg-emerald-50 text-emerald-600 border-emerald-100 shadow-emerald-100",
  PENDING: "bg-red-50 text-red-600 border-red-100 shadow-red-100",
  PARTIAL: "bg-blue-50 text-blue-600 border-blue-100 shadow-blue-100",
};

export default function ClientProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { toast, showToast, hideToast } = useToast();

  const [data,      setData]      = useState<any>(null);
  const [sessions,  setSessions]  = useState<any[]>([]);
  const [appts,     setAppts]     = useState<any[]>([]);
  const [billing,   setBilling]   = useState<any[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    api.get(`/clients/${id}`)
      .then(({ data: res }) => setData(res))
      .catch(() => showToast("Could not load patient profile", "error"))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (activeTab === "sessions" && sessions.length === 0) {
      api.get(`/sessions?clientId=${id}&limit=50`)
        .then((r) => setSessions(r.data.sessions ?? []))
        .catch(() => {});
    }
    if (activeTab === "appointments" && appts.length === 0) {
      api.get(`/appointments?clientId=${id}&limit=50`)
        .then((r) => setAppts(r.data.appointments ?? []))
        .catch(() => {});
    }
    if (activeTab === "billing" && billing.length === 0) {
      api.get(`/billing?clientId=${id}&limit=50`)
        .then((r) => setBilling(r.data.bills ?? []))
        .catch(() => {});
    }
  }, [activeTab]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <Spinner size="lg" color="indigo" />
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic animate-pulse">Loading Patient Profile...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] gap-6 text-center">
        <div className="p-8 bg-gray-50 rounded-full text-red-300">
           <AlertCircle size={64} strokeWidth={1} />
        </div>
        <div>
           <h4 className="text-xl font-black text-gray-900 tracking-tight italic">Patient Not Found</h4>
           <p className="text-sm text-gray-400 font-medium max-w-xs mt-2">The requested patient record could not be found.</p>
        </div>
        <button
          onClick={() => router.push("/clients")}
          className="px-8 py-3 bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-xl hover:shadow-2xl transition-all"
        >
          Return to Patient List
        </button>
      </div>
    );
  }

  const { client, summary } = data;
  const progressPct = client.totalSessionsPlanned
    ? Math.round((summary.sessionsCompleted / client.totalSessionsPlanned) * 100)
    : null;

  return (
    <div className="max-w-6xl mx-auto space-y-6 sm:space-y-10 pb-20 px-1 sm:px-2 animate-in fade-in duration-700">

      {/* Profile Navigation */}
      <div className="flex items-center justify-between gap-3 sm:gap-6">
        <div className="flex items-center gap-3 sm:gap-6 min-w-0">
          <button
            onClick={() => router.push("/clients")}
            className="p-3 sm:p-4 bg-white shadow-xl shadow-gray-100 rounded-xl sm:rounded-2xl hover:scale-110 transition-transform text-gray-400 hover:text-gray-900 border border-gray-50 shrink-0"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
               <span className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Patient Profile</span>
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-900 tracking-tight italic truncate">
              {client.name}<span className="text-indigo-600">.</span>
            </h2>
          </div>
        </div>
        <button
          onClick={() => router.push(`/clients/${id}/edit`)}
          className="px-4 sm:px-8 py-2.5 sm:py-3.5 bg-white border border-gray-100 shadow-xl shadow-gray-100 text-gray-900 text-[9px] sm:text-[10px] font-black uppercase tracking-widest rounded-xl sm:rounded-2xl hover:translate-y-[-2px] transition-all flex items-center gap-2 sm:gap-3 italic shrink-0"
        >
          <Pencil size={14} />
          <span className="hidden sm:inline">Update Details</span>
          <span className="sm:hidden">Edit</span>
        </button>
      </div>

      {/* Patient Profile Header */}
      <div className="space-y-6 sm:space-y-8">
         {/* Main Identification Card */}
         <Card className="p-5 sm:p-8 lg:p-10 border-none shadow-[0_40px_100px_rgba(0,0,0,0.06)] bg-white rounded-2xl sm:rounded-[3rem] ring-1 ring-gray-100 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-40 sm:w-64 h-40 sm:h-64 bg-indigo-50/50 rounded-bl-full -z-0" />
            <div className="relative z-10">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8 lg:gap-12">
                   <div className="relative shrink-0">
                      <div className="w-20 h-20 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-2xl sm:rounded-[2.5rem] bg-gray-900 flex items-center justify-center text-white text-2xl sm:text-3xl lg:text-4xl font-black italic shadow-2xl rotate-3 group-hover:rotate-0 transition-transform duration-700">
                         {client.name.charAt(0)}
                      </div>
                      <div className="absolute -bottom-1.5 -right-1.5 sm:-bottom-2 sm:-right-2 p-2 sm:p-3 bg-emerald-500 text-white rounded-xl sm:rounded-2xl shadow-xl shadow-emerald-100 ring-2 sm:ring-4 ring-white">
                         <ShieldCheck size={16} />
                      </div>
                   </div>
                   
                   <div className="flex-1 space-y-6 sm:space-y-8 lg:space-y-10 w-full text-center sm:text-left">
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3">
                        <Badge
                          variant={client.status?.toLowerCase() as any}
                          label={client.status || "ACTIVE"}
                          className="px-4 sm:px-6 py-1.5 sm:py-2 text-[9px] sm:text-[10px] font-black uppercase tracking-widest shadow-lg"
                        />
                        {/* Service Type badges */}
                        <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-center sm:justify-start">
                          {(client.practiceTypes && client.practiceTypes.length > 0) ? (
                            client.practiceTypes.map((type: string) => {
                              const config = PRACTICE_TYPE_CONFIG[type as keyof typeof PRACTICE_TYPE_CONFIG];
                              return (
                                <div key={type} className={`px-3 sm:px-5 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-wider sm:tracking-widest border shadow-lg sm:shadow-xl transition-all hover:scale-105 cursor-default ${PRACTICE_TYPE_COLORS[type as keyof typeof PRACTICE_TYPE_COLORS] ?? "bg-gray-50 text-gray-500 border-gray-100"}`}>
                                   {config?.label || type}
                                </div>
                              );
                            })
                          ) : (
                            <div className={`px-3 sm:px-5 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-wider sm:tracking-widest border shadow-lg sm:shadow-xl ${PRACTICE_TYPE_COLORS[client.practiceType as keyof typeof PRACTICE_TYPE_COLORS] ?? "bg-gray-50 text-gray-500 border-gray-100"}`}>
                               {client.practiceType || "GENERAL_PRACTICE"}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 sm:gap-y-6 lg:gap-y-8 gap-x-8 lg:gap-x-12 text-sm">
                         <div className="flex items-center justify-center sm:justify-start gap-4 sm:gap-5 text-gray-900 font-extrabold italic">
                           <div className="p-2.5 sm:p-3 bg-gray-50 rounded-xl sm:rounded-2xl text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors shrink-0"><User size={16} /></div>
                           <span className="text-sm sm:text-base">{client.age} Years / {client.gender}</span>
                         </div>
                         <div className="flex items-center justify-center sm:justify-start gap-4 sm:gap-5 text-gray-900 font-extrabold italic">
                           <div className="p-2.5 sm:p-3 bg-gray-50 rounded-xl sm:rounded-2xl text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors shrink-0"><Phone size={16} /></div>
                           <span className="text-sm sm:text-base tracking-wider sm:tracking-widest">{client.phone}</span>
                         </div>
                         {client.email && (
                           <div className="flex items-center justify-center sm:justify-start gap-4 sm:gap-5 text-gray-900 font-extrabold italic sm:col-span-2">
                             <div className="p-2.5 sm:p-3 bg-gray-50 rounded-xl sm:rounded-2xl text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors shrink-0"><Mail size={16} /></div>
                             <span className="text-sm sm:text-base break-all">{client.email}</span>
                           </div>
                         )}
                         {client.address && (
                           <div className="flex items-center justify-center sm:justify-start gap-4 sm:gap-5 text-gray-900 font-extrabold italic sm:col-span-2">
                             <div className="p-2.5 sm:p-3 bg-gray-50 rounded-xl sm:rounded-2xl text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors shrink-0"><MapPin size={16} /></div>
                             <span className="text-sm sm:text-base leading-relaxed">{client.address}</span>
                           </div>
                         )}
                      </div>
                   </div>
                </div>
               
               {/* Progress Tracking */}
               {progressPct !== null && (
                 <div className="mt-8 sm:mt-12 p-5 sm:p-8 lg:p-10 bg-gray-50/50 rounded-2xl sm:rounded-[3rem] border border-gray-100">
                   <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0 text-[10px] sm:text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3 sm:mb-5 italic">
                     <span>Treatment Progress</span>
                     <span className="text-blue-600">
                       {summary.sessionsCompleted} / {client.totalSessionsPlanned} done ({progressPct}%)
                     </span>
                   </div>
                   <div className="w-full bg-white rounded-full h-3 sm:h-4 ring-1 ring-gray-100 overflow-hidden p-0.5 sm:p-1 shadow-inner">
                     <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 shadow-xl shadow-blue-200 transition-all duration-1000"
                        style={{ width: `${Math.min(progressPct, 100)}%` }}
                     />
                   </div>
                 </div>
               )}
            </div>
         </Card>

         {/* Patient Stats Row */}
         <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {[
              { label: "Visits Done", value: summary.sessionsCompleted ?? 0, sub: `of ${client.totalSessionsPlanned || '∞'} planned`, icon: ClipboardList, color: "text-purple-600", bg: "bg-purple-50" },
              { label: "Total Paid", value: `₹${(summary.totalPaid ?? 0).toLocaleString("en-IN")}`, sub: "collected", icon: IndianRupee, color: "text-emerald-600", bg: "bg-emerald-50" },
              { label: "Pending Dues", value: `₹${(summary.totalPending ?? 0).toLocaleString("en-IN")}`, sub: "outstanding", icon: Activity, color: summary.totalPending > 0 ? "text-red-600" : "text-gray-300", bg: summary.totalPending > 0 ? "bg-red-50" : "bg-gray-50" },
            ].map((stat, sidx) => (
               <Card key={sidx} className="p-5 sm:p-6 lg:p-8 border-none shadow-[0_20px_50px_rgba(0,0,0,0.03)] bg-white rounded-2xl sm:rounded-[2.5rem] ring-1 ring-gray-100 flex items-center gap-5 sm:gap-6 lg:gap-8 group hover:translate-y-[-4px] transition-all duration-500">
                  <div className={`p-3 sm:p-4 lg:p-5 rounded-2xl sm:rounded-3xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform duration-500 shrink-0`}>
                     <stat.icon size={22} />
                  </div>
                  <div className="min-w-0">
                     <p className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest italic leading-none mb-1 sm:mb-2">{stat.label}</p>
                     <h4 className={`text-xl sm:text-2xl lg:text-3xl font-black tracking-tighter italic ${stat.color}`}>{stat.value}</h4>
                     <p className="text-[8px] sm:text-[9px] font-bold text-gray-300 uppercase tracking-tighter mt-0.5 sm:mt-1">{stat.sub}</p>
                  </div>
               </Card>
            ))}
         </div>
      </div>

      {/* Patient Activities */}
      <Card className="border-none shadow-[0_30px_70px_rgba(0,0,0,0.06)] rounded-[3rem] bg-white overflow-hidden ring-1 ring-gray-100">
        <div className="px-10 pt-8 flex items-center justify-between border-b border-gray-50 pb-2">
          <div className="flex bg-gray-100/50 p-1.5 rounded-2xl gap-1 ring-1 ring-gray-100">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest
                            transition-all duration-300 italic
                            ${activeTab === t.key
                              ? "bg-gray-900 text-white shadow-xl translate-y-[-1px]"
                              : "text-gray-400 hover:text-gray-900"}`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-indigo-500" />
             <span className="text-[9px] font-black text-gray-300 uppercase tracking-[0.2em] italic">Record Active</span>
          </div>
        </div>

        <div className="p-10 min-h-[400px]">

          {/* ── Overview ── */}
          {activeTab === "overview" && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                <InfoRow label="Chief Complaint" value={client.chiefComplaint} icon={Activity} />
                <InfoRow label="Affected Area" value={`${client.bodyPart} (${client.bodySide})`} icon={Target} />
                <InfoRow label="Session Fee" value={`₹${client.sessionFee}`} icon={IndianRupee} />
                <InfoRow label="Registered On" value={format(new Date(client.createdAt), "dd MMM yyyy")} icon={Calendar} />
                <InfoRow label="Referral Source" value={client.referralSource?.replace("_", " ")} icon={Sparkles} />
                <InfoRow label="Patient Type" value={client.clientType?.replace("_", " ")} icon={User} />
                
                {client.diagnosis && <InfoRow label="Diagnosis" value={client.diagnosis} icon={HeartPulse} className="md:col-span-2" />}
                {client.medicalHistory && <InfoRow label="Medical History" value={client.medicalHistory} icon={Clock} className="md:col-span-2" />}
                {client.emergencyContact && <InfoRow label="Emergency Contact" value={client.emergencyContact} icon={Zap} />}
              </div>

              {summary.nextAppointment && (
                <div className="mt-8 p-10 bg-indigo-900 rounded-[2.5rem] shadow-2xl shadow-indigo-100 flex flex-col md:flex-row items-center justify-between gap-10 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl" />
                  <div className="space-y-2 relative z-10">
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] italic">Next Appointment</p>
                    <h5 className="text-3xl font-black text-white italic tracking-tight">
                      {format(new Date(summary.nextAppointment.date), "EEEE, dd MMMM")}
                    </h5>
                    <p className="text-sm font-bold text-indigo-200 uppercase tracking-widest">Time: {summary.nextAppointment.startTime}</p>
                  </div>
                  <button onClick={() => router.push(`/appointments/${summary.nextAppointment._id}`)} className="bg-white text-indigo-900 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all italic flex items-center gap-3 relative z-10">
                    View Appointment <ArrowRight size={14} />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── Treatment History (Sessions) ── */}
          {activeTab === "sessions" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-center bg-gray-50 p-6 rounded-3xl border border-gray-100">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Total Sessions: {sessions.length} recorded</p>
                <button
                  onClick={() => router.push(`/sessions/new?clientId=${id}`)}
                  className="bg-gray-900 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest italic hover:shadow-xl transition-all"
                >
                  + New Session
                </button>
              </div>
              
              {sessions.length === 0 ? (
                <div className="py-20 text-center space-y-4">
                   <div className="p-6 bg-gray-50 rounded-full w-fit mx-auto text-gray-300"><ClipboardList size={40} /></div>
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">No sessions recorded yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-50">
                        {["No.", "Date", "Duration", "Pain Progress", "Actions"].map((h, i) => (
                           <th key={i} className="py-4 px-6 text-left text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] italic">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {sessions.map((s: any) => (
                        <tr key={s._id} className="group hover:bg-gray-50/50 transition-colors">
                          <td className="py-6 px-6">
                            <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100 italic">#{s.sessionNumber.toString().padStart(3, '0')}</span>
                          </td>
                          <td className="py-6 px-6 text-xs font-black text-gray-900 italic">
                            {format(new Date(s.createdAt), "dd MMM yyyy")}
                          </td>
                          <td className="py-6 px-6 text-[10px] font-black text-gray-500 uppercase tracking-widest italic">
                            {s.durationMins} min
                          </td>
                          <td className="py-6 px-6">
                             <div className="flex items-center gap-3">
                                <span className="text-[10px] font-black text-gray-400">{s.painBefore ?? '?'}</span>
                                <ArrowRight size={10} className="text-gray-300" />
                                <span className="text-[10px] font-black text-gray-900">{s.painAfter ?? '?'}</span>
                                {s.painBefore && s.painAfter && (
                                   <div className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase italic ${s.painBefore - s.painAfter > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-50 text-gray-400'}`}>
                                      {s.painBefore - s.painAfter > 0 ? `+${s.painBefore - s.painAfter} Improvement` : 'Static'}
                                   </div>
                                )}
                             </div>
                          </td>
                          <td className="py-6 px-6">
                            <button onClick={() => router.push(`/sessions/${s._id}`)} className="text-[10px] font-black text-gray-900 uppercase tracking-widest hover:underline italic opacity-0 group-hover:opacity-100 transition-opacity">
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── EHR / Documents ── */}
          {activeTab === "documents" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="flex justify-between items-center bg-gray-50 p-6 rounded-3xl border border-gray-100">
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Clinical Records: {(client.documents?.length || 0)} files</p>
                 <button
                   className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest italic shadow-lg shadow-indigo-100 hover:shadow-xl transition-all"
                 >
                   + Upload Document
                 </button>
               </div>

               {(!client.documents || client.documents.length === 0) ? (
                 <div className="py-20 text-center space-y-4">
                    <div className="p-6 bg-gray-50 rounded-full w-fit mx-auto text-gray-300"><ShieldCheck size={40} /></div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">No documents uploaded yet</p>
                 </div>
               ) : (
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {client.documents.map((doc: any, idx: number) => (
                      <div key={idx} className="p-6 bg-white rounded-3xl border border-gray-100 hover:border-indigo-200 hover:shadow-xl transition-all group relative overflow-hidden">
                         <div className="flex items-start justify-between mb-4">
                            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                               <ClipboardList size={20} />
                            </div>
                            <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest italic">{format(new Date(doc.uploadedAt), "dd MMM yyyy")}</span>
                         </div>
                         <h5 className="text-sm font-black text-gray-900 italic mb-1 truncate pr-4">{doc.name}</h5>
                         <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mb-6">Patient Report</p>
                         <a 
                            href={doc.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="w-full py-2.5 bg-gray-50 text-gray-900 text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center gap-2"
                         >
                            View Document <ArrowRight size={12} />
                         </a>
                      </div>
                    ))}
                 </div>
               )}
            </div>
          )}


          {/* ── Schedule (Appointments) ── */}
          {activeTab === "appointments" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

               <div className="flex justify-between items-center bg-gray-50 p-6 rounded-3xl border border-gray-100">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Total Appointments: {appts.length}</p>
                <button
                  onClick={() => router.push(`/appointments/new?clientId=${id}`)}
                  className="bg-gray-900 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest italic hover:shadow-xl transition-all"
                >
                  + Book Slot
                </button>
              </div>

              {appts.length === 0 ? (
                <div className="py-20 text-center space-y-4">
                   <div className="p-6 bg-gray-50 rounded-full w-fit mx-auto text-gray-300"><Calendar size={40} /></div>
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">No upcoming appointments</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {appts.map((a: any) => (
                    <div
                      key={a._id}
                      onClick={() => router.push(`/appointments/${a._id}`)}
                      className="group flex items-center justify-between p-6 bg-white rounded-3xl border border-gray-100 hover:border-indigo-200 hover:shadow-xl transition-all cursor-pointer relative overflow-hidden"
                    >
                      <div className="space-y-1 relative z-10">
                        <p className="text-[11px] font-black text-gray-900 italic tracking-tight uppercase">
                          {format(new Date(a.date), "EEEE, dd MMMM")}
                        </p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          {a.startTime} – {a.endTime} 
                        </p>
                      </div>
                      <Badge
                        variant={a.status.toLowerCase() as any}
                        label={a.status.replace("_", " ")}
                        className="px-3 py-1 text-[8px] font-black uppercase tracking-widest relative z-10 shadow-sm"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Billing History ── */}
          {activeTab === "billing" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="flex justify-between items-center bg-gray-50 p-6 rounded-3xl border border-gray-100">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Balance: ₹{(summary.totalPending ?? 0).toLocaleString("en-IN")}</p>
                <button
                  onClick={() => router.push(`/billing/new?clientId=${id}`)}
                  className="bg-orange-600 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest italic shadow-lg shadow-orange-100 hover:shadow-xl transition-all"
                >
                  + New Invoice
                </button>
              </div>

              {billing.length === 0 ? (
                <div className="py-20 text-center space-y-4">
                   <div className="p-6 bg-gray-50 rounded-full w-fit mx-auto text-gray-300"><IndianRupee size={40} /></div>
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">No billing records found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-50">
                        {["Date", "Total", "Paid", "Balance", "Mode", "Status"].map((h, i) => (
                           <th key={i} className="py-4 px-6 text-left text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] italic">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {billing.map((b: any) => {
                        const balance = b.totalFee - b.amountPaid;
                        return (
                          <tr key={b._id} className="group hover:bg-gray-50/50 transition-colors">
                            <td className="py-6 px-6 text-xs font-black text-gray-900 italic">
                               {b.date ? format(new Date(b.date), "dd MMM yyyy") : "—"}
                            </td>
                            <td className="py-6 px-6 text-sm font-black text-gray-900 italic">
                               ₹{b.totalFee.toLocaleString("en-IN")}
                            </td>
                            <td className="py-6 px-6 text-sm font-black text-emerald-600 italic">
                               ₹{b.amountPaid.toLocaleString("en-IN")}
                            </td>
                            <td className={`py-6 px-6 text-sm font-black italic ${balance > 0 ? "text-red-600" : "text-gray-300"}`}>
                               {balance > 0 ? `₹${balance.toLocaleString("en-IN")}` : "00.00"}
                            </td>
                            <td className="py-6 px-6 text-[10px] font-black text-gray-500 uppercase tracking-widest italic">
                               {b.paymentMode}
                            </td>
                            <td className="py-6 px-6">
                              <Badge
                                variant={b.status.toLowerCase() as any}
                                label={b.status}
                                className={`px-3 py-1 text-[8px] font-black uppercase tracking-widest shadow-sm ${STATUS_STYLE[b.status]}`}
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
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

function InfoRow({ label, value, icon: Icon, className = "" }: { label: string; value: any; icon: any; className?: string }) {
  return (
    <div className={`p-8 bg-gray-50/30 rounded-[2.5rem] border border-gray-50 hover:border-indigo-100 hover:bg-white hover:shadow-xl group transition-all duration-500 ${className}`}>
      <div className="flex items-center gap-4 mb-4">
         <div className="p-3 bg-white shadow-lg rounded-xl text-indigo-500 group-hover:scale-110 transition-transform">
            <Icon size={18} />
         </div>
         <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] italic">
            {label}
         </p>
      </div>
      <p className="text-sm font-black text-gray-900 uppercase tracking-tight italic group-hover:text-indigo-600 transition-colors">
         {value || "NOT_SPECIFIED"}
      </p>
    </div>
  );
}
