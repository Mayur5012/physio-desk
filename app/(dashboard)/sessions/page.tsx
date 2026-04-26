"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Spinner from "@/components/ui/Spinner";
import Pagination from "@/components/ui/Pagination";
import Toast, { useToast } from "@/components/ui/Toast";
import { ClipboardList, Plus, Target, Activity, Sparkles, Eye, TrendingDown, ArrowRight } from "lucide-react";
import { format, parseISO } from "date-fns";

interface Session {
  _id: string;
  sessionNumber: number;
  createdAt: string;
  durationMins: number;
  painBefore?: number;
  painAfter?: number;
  techniquesUsed: string[];
  clientId: {
    _id: string;
    name: string;
    phone: string;
    therapyType: string;
  };
}

export default function SessionsPage() {
  const router = useRouter();
  const { toast, showToast, hideToast } = useToast();

  const [sessions,   setSessions]   = useState<Session[]>([]);
  const [total,      setTotal]      = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading,    setLoading]    = useState(true);
  const [page,       setPage]       = useState(1);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/sessions", {
        params: { page, limit: 10 },
      });
      setSessions(data.sessions);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch {
      showToast("Failed to load sessions", "error");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchSessions(); }, [fetchSessions]);

  const PainDelta = ({ before, after }: { before?: number, after?: number }) => {
    if (before === undefined || after === undefined) return <span className="text-gray-300 text-[10px] font-black italic">N/A</span>;
    
    const diff = (before || 0) - (after || 0);
    const color = diff > 0 ? "text-emerald-500" : diff < 0 ? "text-red-500" : "text-gray-400";
    
    return (
      <div className="flex items-center gap-2">
         <div className="flex flex-col items-center">
            <span className="text-[10px] font-black text-gray-400 leading-none">{before}</span>
            <div className="w-[1px] h-2 bg-gray-200 my-0.5" />
            <span className="text-[10px] font-black text-gray-900 leading-none">{after}</span>
         </div>
         <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-gray-50 border border-gray-100 ${color}`}>
            <TrendingDown size={10} className={diff > 0 ? "" : "rotate-180"} />
            <span className="text-[10px] font-black italic">{Math.abs(diff)}pts</span>
         </div>
      </div>
    );
  };

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-20 px-2">

      {/* Hero Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative">
         <div className="absolute -top-10 -left-10 w-40 h-40 bg-indigo-100/30 rounded-full blur-3xl -z-10" />
         <div className="space-y-1">
            <div className="flex items-center gap-2 mb-2">
               <div className="px-2 py-0.5 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded-md italic">Clinical Progress</div>
               <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            </div>
            <h2 className="text-4xl font-black text-gray-900 tracking-tight italic flex items-center gap-4">
              Patient Sessions<span className="text-emerald-600">.</span>
            </h2>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Outcome Tracking & Progress Logs</p>
         </div>
         
         <button
            onClick={() => router.push("/sessions/new")}
            className="px-8 py-3.5 bg-gray-900 text-white text-xs font-black uppercase tracking-[0.2em] rounded-2xl hover:shadow-2xl hover:translate-y-[-2px] transition-all flex items-center gap-3 italic"
         >
            <Plus size={18} />
            + Add Session
         </button>
      </div>

      {/* Summary Logic Bar */}
      <div className="flex items-center justify-between px-4">
         <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-xl shadow-lg ring-1 ring-gray-100">
               <Sparkles size={16} className="text-indigo-500 animate-pulse" />
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] italic">Total Sessions: {total}</p>
         </div>
         
         <div className="flex items-center gap-4">
            <button className="p-2 text-gray-400 hover:text-gray-900 transition-colors">
               <Target size={18} />
            </button>
         </div>
      </div>

      {/* Recent Sessions */}
      <Card className="border-none shadow-[0_30px_70px_rgba(0,0,0,0.06)] rounded-[3rem] bg-white overflow-hidden ring-1 ring-gray-100">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
            <Spinner size="lg" color="indigo" />
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic animate-pulse">Loading data...</p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-40 text-center px-10">
            <div className="p-8 bg-gray-50 rounded-full text-gray-300 mb-6">
               <ClipboardList size={64} strokeWidth={1} />
            </div>
            <h4 className="text-xl font-black text-gray-900 tracking-tight italic">No Sessions Found</h4>
            <p className="text-sm text-gray-400 font-medium max-w-xs mt-2">No session data is currently available.</p>
            <button onClick={() => router.push("/sessions/new")} className="mt-6 text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline">+ Add New Session</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  {["#", "Patient", "Session", "Date", "Duration", "Pain (B/A)", "Techniques", "Actions"].map((h, i) => (
                    <th key={i} className="px-8 py-6 text-left whitespace-nowrap">
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">{h}</p>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {sessions.map((s, idx) => (
                  <tr key={s._id} className="group hover:bg-slate-50/50 transition-all duration-300">
                    <td className="px-8 py-6 text-[10px] font-black text-gray-300 italic">
                      #{(page - 1) * 10 + idx + 1}
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center text-white text-xs font-black italic shadow-lg group-hover:rotate-12 transition-transform">
                           {s.clientId?.name?.charAt(0) ?? "?"}
                        </div>
                        <div>
                          <p className="text-sm font-black text-gray-900 uppercase tracking-tight italic">
                            {s.clientId?.name ?? "—"}
                          </p>
                          <p className="text-[9px] font-bold text-gray-400 tracking-widest uppercase">
                            TYPE: {s.clientId?.therapyType || "GEN"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex items-center gap-2">
                          <div className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black italic border border-indigo-100">
                             #{s.sessionNumber}
                          </div>
                       </div>
                    </td>
                    <td className="px-8 py-6 text-xs font-bold text-gray-500 italic">
                      {s.createdAt ? format(parseISO(s.createdAt), "dd MMM yyyy") : "—"}
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex items-center gap-2">
                          <div className="w-1 h-1 rounded-full bg-blue-500" />
                          <span className="text-xs font-black text-gray-700 italic">{s.durationMins} min</span>
                       </div>
                    </td>
                    <td className="px-8 py-6">
                       <PainDelta before={s.painBefore} after={s.painAfter} />
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                          {s.techniquesUsed?.slice(0, 2).map((t, ti) => (
                             <span key={ti} className="text-[9px] font-black text-gray-500 bg-white border border-gray-100 px-2 py-0.5 rounded-md uppercase italic group-hover:border-indigo-200 transition-colors">
                                {t}
                             </span>
                          ))}
                          {(s.techniquesUsed?.length || 0) > 2 && (
                             <span className="text-[9px] font-black text-indigo-400">+{s.techniquesUsed.length - 2}</span>
                          )}
                       </div>
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex items-center justify-end opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                           <button onClick={() => router.push(`/sessions/${s._id}`)} className="p-3 bg-gray-900 text-white rounded-xl shadow-xl shadow-gray-200 hover:translate-y-[-2px] transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest italic">
                             View Details <ArrowRight size={12} />
                           </button>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Navigation */}
        {!loading && sessions.length > 0 && (
          <div className="flex items-center justify-between px-10 py-8 bg-gray-50/30 border-t border-gray-100">
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-indigo-500" />
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Page {page} of {totalPages}</p>
             </div>
             <Pagination
                page={page}
                totalPages={totalPages}
                total={total}
                limit={10}
                onPageChange={setPage}
              />
          </div>
        )}
      </Card>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={hideToast} />
      )}
    </div>
  );
}
