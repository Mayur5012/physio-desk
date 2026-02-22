"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import Card from "@/components/ui/Card";
import Spinner from "@/components/ui/Spinner";
import Pagination from "@/components/ui/Pagination";
import Toast, { useToast } from "@/components/ui/Toast";
import { ClipboardList, Plus } from "lucide-react";
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

  const PainBar = ({ score }: { score?: number }) => {
    if (score === undefined || score === null) {
      return <span className="text-gray-300 text-xs">—</span>;
    }
    const color = score <= 3
      ? "bg-green-500"
      : score <= 6
        ? "bg-yellow-500"
        : "bg-red-500";
    return (
      <div className="flex items-center gap-2">
        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${color}`}
            style={{ width: `${(score / 10) * 100}%` }}
          />
        </div>
        <span className="text-xs font-medium text-gray-600">{score}/10</span>
      </div>
    );
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Sessions</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {total} total sessions recorded
          </p>
        </div>
        <button
          onClick={() => router.push("/sessions/new")}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 
                     text-white text-sm font-medium px-4 py-2.5 rounded-lg 
                     transition"
        >
          <Plus size={16} />
          Record Session
        </button>
      </div>

      {/* Table */}
      <Card>
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <ClipboardList size={40} className="text-gray-200" />
            <p className="text-gray-500 text-sm">No sessions recorded yet</p>
            <button
              onClick={() => router.push("/sessions/new")}
              className="text-blue-600 text-sm hover:underline"
            >
              Record first session
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    {[
                      "#", "Client", "Session", "Date",
                      "Duration", "Pain Before", "Pain After",
                      "Techniques", "Actions",
                    ].map((h) => (
                      <th
                        key={h}
                        className="text-left px-5 py-3 text-xs font-semibold 
                                   text-gray-500 uppercase tracking-wide 
                                   whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {sessions.map((s, idx) => (
                    <tr
                      key={s._id}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      {/* # */}
                      <td className="px-5 py-3.5 text-xs text-gray-400">
                        {(page - 1) * 10 + idx + 1}
                      </td>

                      {/* Client */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-blue-100 
                                          text-blue-700 flex items-center 
                                          justify-center text-xs font-bold 
                                          shrink-0">
                            {s.clientId?.name?.charAt(0)?.toUpperCase() ?? "?"}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 
                                          whitespace-nowrap">
                              {s.clientId?.name ?? "—"}
                            </p>
                            <p className="text-xs text-gray-400">
                              {s.clientId?.phone ?? ""}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Session # */}
                      <td className="px-5 py-3.5">
                        <span className="text-sm font-semibold text-blue-600">
                          #{s.sessionNumber}
                        </span>
                      </td>

                      {/* Date — uses createdAt */}
                      <td className="px-5 py-3.5 text-sm text-gray-600 
                                     whitespace-nowrap">
                        {s.createdAt
                          ? format(parseISO(s.createdAt), "dd MMM yyyy")
                          : "—"}
                      </td>

                      {/* Duration */}
                      <td className="px-5 py-3.5 text-sm text-gray-600 
                                     whitespace-nowrap">
                        {s.durationMins} min
                      </td>

                      {/* Pain Before */}
                      <td className="px-5 py-3.5">
                        <PainBar score={s.painBefore} />
                      </td>

                      {/* Pain After */}
                      <td className="px-5 py-3.5">
                        <PainBar score={s.painAfter} />
                      </td>

                      {/* Techniques */}
                      <td className="px-5 py-3.5">
                        <div className="flex flex-wrap gap-1">
                          {s.techniquesUsed?.slice(0, 2).map((t: string) => (
                            <span
                              key={t}
                              className="text-xs bg-gray-100 text-gray-600 
                                         px-2 py-0.5 rounded-full"
                            >
                              {t}
                            </span>
                          ))}
                          {(s.techniquesUsed?.length ?? 0) > 2 && (
                            <span className="text-xs text-gray-400">
                              +{s.techniquesUsed.length - 2}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5">
                        <button
                          onClick={() => router.push(`/sessions/${s._id}`)}
                          className="text-xs text-blue-600 hover:underline 
                                     font-medium whitespace-nowrap"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-5 py-3 border-t border-gray-100">
              <Pagination
                page={page}
                totalPages={totalPages}
                total={total}
                limit={10}
                onPageChange={setPage}
              />
            </div>
          </>
        )}
      </Card>

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
