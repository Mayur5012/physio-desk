"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import Card from "@/components/ui/Card";
import SubscriptionBadge from "@/components/subscription/SubscriptionBadge";
import Badge from "@/components/ui/Badge";
import Spinner from "@/components/ui/Spinner";
import Pagination from "@/components/ui/Pagination";
import Modal from "@/components/ui/Modal";
import Toast, { useToast } from "@/components/ui/Toast";
import {
  UserPlus, Search, Eye, Pencil, Trash2,
  Phone, User, ChevronUp, ChevronDown, Filter, Sparkles, LayoutGrid, List, Activity as ActivityIcon
} from "lucide-react";
import { PRACTICE_TYPE_CONFIG, PRACTICE_TYPES } from "@/lib/constants";

interface Client {
  _id: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  email?: string;
  chiefComplaint: string;
  practiceTypes?: string[];
  therapyType?: string;
  clientType: string;
  status: string;
  createdAt: string;
}

const STATUS_OPTIONS = [
  { value: "ALL",        label: "All Patients" },
  { value: "ACTIVE",     label: "Active" },
  { value: "INACTIVE",   label: "Inactive" },
  { value: "DISCHARGED", label: "Archived" },
];

const THERAPY_LABEL: Record<string, string> = {
  PHYSIOTHERAPY: "Physio",
  ACUPRESSURE:   "Acu",
  COMBINED:      "Mixed",
};

export default function ClientsPage() {
  const router = useRouter();
  const { doctor } = useAuthStore();
  const { toast, showToast, hideToast } = useToast();

  const [clients,     setClients]     = useState<Client[]>([]);
  const [total,       setTotal]       = useState(0);
  const [totalPages,  setTotalPages]  = useState(1);
  const [loading,     setLoading]     = useState(true);

  // Filters
  const [search,  setSearch]  = useState("");
  const [status,  setStatus]  = useState("ALL");
  const [sort,    setSort]    = useState("createdAt");
  const [order,   setOrder]   = useState("desc");
  const [page,    setPage]    = useState(1);

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState<Client | null>(null);
  const [deleting,     setDeleting]     = useState(false);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/clients", {
        params: { search, status, sort, order, page, limit: 10 },
      });
      setClients(data.clients);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch {
      showToast("Failed to load patients", "error");
    } finally {
      setLoading(false);
    }
  }, [search, status, sort, order, page]);

  useEffect(() => { fetchClients(); }, [fetchClients]);

  useEffect(() => {
    const t = setTimeout(() => { if (page !== 1) setPage(1); else fetchClients(); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const handleSort = (field: string) => {
    if (sort === field) setOrder(order === "asc" ? "desc" : "asc");
    else { setSort(field); setOrder("asc"); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/clients/${deleteTarget._id}`);
      showToast("Patient records archived successfully", "success");
      setDeleteTarget(null);
      fetchClients();
    } catch {
      showToast("Failed to archive patient records", "error");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-20">

      {/* Hero Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative">
         <div className="absolute -top-10 -left-10 w-40 h-40 bg-purple-100/30 rounded-full blur-3xl -z-10" />
         <div className="space-y-1">
            <div className="flex items-center gap-2 mb-2">
               <SubscriptionBadge doctor={doctor} />
               <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            </div>
            <h2 className="text-4xl font-black text-gray-900 tracking-tight italic flex items-center gap-4">
              Patients<span className="text-purple-600">.</span>
            </h2>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
              Total: {total} Patients
            </p>
         </div>
         
         <button
            onClick={() => router.push("/clients/new")}
            className="px-8 py-3.5 bg-gray-900 text-white text-xs font-black uppercase tracking-[0.2em] rounded-2xl hover:shadow-2xl hover:translate-y-[-2px] transition-all flex items-center gap-3 italic"
         >
            <UserPlus size={18} />
            + Add Patient
         </button>
      </div>

      {/* Search & Filter */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         <div className="md:col-span-3">
            <div className="relative group">
              <Search
                size={18}
                className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-600 transition-colors"
              />
              <input
                type="text"
                placeholder="Search by name, phone or ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-14 pr-6 py-5 bg-white border border-gray-100 rounded-[2rem] text-sm font-bold shadow-2xl shadow-slate-200/50 focus:outline-none focus:ring-2 focus:ring-purple-500/10 transition-all italic"
              />
            </div>
         </div>

         <div className="relative">
            <select
               value={status}
               onChange={(e) => { setStatus(e.target.value); setPage(1); }}
               className="w-full px-6 py-5 bg-white border border-gray-100 rounded-[2rem] text-[10px] font-black uppercase tracking-widest text-gray-600 shadow-2xl shadow-slate-200/50 appearance-none focus:outline-none focus:ring-2 focus:ring-purple-500/10"
            >
               {STATUS_OPTIONS.map((o) => (
               <option key={o.value} value={o.value}>{o.label}</option>
               ))}
            </select>
            <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none">
               <Filter size={14} className="text-gray-400" />
            </div>
         </div>
      </div>

      {/* Patient List */}
      <Card className="border-none shadow-[0_30px_70px_rgba(0,0,0,0.06)] rounded-[3rem] bg-white overflow-hidden ring-1 ring-gray-100">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
            <Spinner size="lg" color="purple" />
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic animate-pulse">Loading patient records...</p>
          </div>
        ) : clients.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-40 text-center px-10">
            <div className="p-8 bg-gray-50 rounded-full text-gray-300 mb-6">
               <User size={64} strokeWidth={1} />
            </div>
            <h4 className="text-xl font-black text-gray-900 tracking-tight italic">No Patients Found</h4>
            <p className="text-sm text-gray-400 font-medium max-w-xs mt-2">No patients match your search or filters.</p>
            {search && (
              <button
                onClick={() => setSearch("")}
                className="mt-6 text-[10px] font-black text-purple-600 uppercase tracking-widest hover:underline"
              >
                Clear Search Filter
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-8 py-6 text-left w-12">
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">No.</p>
                  </th>
                  <th className="px-8 py-6 text-left cursor-pointer group" onClick={() => handleSort("name")}>
                     <div className="flex items-center gap-2">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic group-hover:text-purple-600 transition-colors">Patient Name</p>
                        {sort === 'name' && (order === 'asc' ? <ChevronUp size={12} className="text-purple-600" /> : <ChevronDown size={12} className="text-purple-600" />)}
                     </div>
                  </th>
                  <th className="px-8 py-6 text-left">
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Age/Gender</p>
                  </th>
                  <th className="px-8 py-6 text-left">
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Service Type</p>
                  </th>
                  <th className="px-8 py-6 text-left">
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Status</p>
                  </th>
                  <th className="px-8 py-6 text-right">
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Actions</p>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {clients.map((client, idx) => (
                  <tr key={client._id} className="group hover:bg-slate-50/50 transition-all duration-300">
                    <td className="px-8 py-6">
                       <span className="text-[10px] font-black text-gray-300 italic">#{(page - 1) * 10 + idx + 1}</span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-2xl bg-gray-900 border-4 border-white shadow-xl flex items-center justify-center text-white text-sm font-black italic shadow-slate-200 group-hover:scale-110 transition-transform duration-500 overflow-hidden">
                           {client.name.charAt(0)}
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-black text-gray-900 hover:text-purple-600 transition-colors tracking-tight italic uppercase">
                            {client.name}
                          </p>
                          <div className="flex items-center gap-2">
                             <Phone size={10} className="text-gray-300" />
                             <p className="text-[10px] font-bold text-gray-400">{client.phone}</p>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                       <div className="space-y-1">
                          <p className="text-xs font-black text-gray-700">{client.age} Years</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{client.gender}</p>
                       </div>
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex flex-wrap gap-2 max-w-[150px]">
                          {(client.practiceTypes && client.practiceTypes.length > 0) ? (
                            client.practiceTypes.slice(0, 2).map((type) => {
                              const config = PRACTICE_TYPE_CONFIG[type as keyof typeof PRACTICE_TYPE_CONFIG];
                              return (
                                <div key={type} className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100 group/type transition-all hover:bg-white">
                                  <div className="w-1 h-1 rounded-full bg-blue-600" />
                                  <p className="text-[10px] font-black text-gray-600 uppercase tracking-tighter italic truncate max-w-[60px]">{config?.label || type}</p>
                                </div>
                              );
                            })
                          ) : (
                            <div className="flex items-center gap-2">
                               <div className="p-1 px-2.5 bg-gray-50 rounded-lg border border-gray-100 italic">
                                  <p className="text-[9px] font-black text-gray-300 uppercase">Legacy</p>
                               </div>
                               <p className="text-xs font-black text-gray-800 italic">{THERAPY_LABEL[client.therapyType || ''] || client.therapyType}</p>
                            </div>
                          )}
                          {client.practiceTypes && client.practiceTypes.length > 2 && (
                             <div className="bg-blue-50 text-blue-600 px-2 py-1 rounded-lg text-[10px] font-black italic">
                               +{client.practiceTypes.length - 2}
                             </div>
                          )}
                       </div>
                    </td>
                    <td className="px-8 py-6">
                       <Badge
                        variant={client.status.toLowerCase() as any}
                        label={client.status.replace("_", " ")}
                        className="px-3 py-1 text-[9px] font-black uppercase tracking-widest"
                      />
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center justify-end gap-1">
                        {[
                           { icon: Eye, title: "View", color: "text-blue-500 hover:bg-blue-50", action: () => router.push(`/clients/${client._id}`) },
                           { icon: Pencil, title: "Edit", color: "text-amber-500 hover:bg-amber-50", action: () => router.push(`/clients/${client._id}/edit`) },
                           { icon: Trash2, title: "Archive", color: "text-red-500 hover:bg-red-50", action: () => setDeleteTarget(client) },
                        ].map((btn, bidx) => (
                           <button
                             key={bidx}
                             onClick={btn.action}
                             className={`p-2.5 rounded-xl transition-all ${btn.color}`}
                             title={btn.title}
                           >
                             <btn.icon size={16} />
                           </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Pagination Console */}
        {!loading && clients.length > 0 && (
          <div className="flex items-center justify-between px-10 py-8 bg-gray-50/30 border-t border-gray-100">
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-500" />
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

      {/* Archive Patient Modal */}
        <Modal
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          title="Archive Patient"
          size="md"
        >
        <div className="p-2 space-y-6">
           <div className="flex items-center gap-4 p-5 bg-red-50 rounded-3xl border border-red-100">
              <div className="p-3 bg-red-500 text-white rounded-2xl shadow-xl shadow-red-200">
                 <Trash2 size={24} />
              </div>
              <div>
                 <h5 className="text-sm font-black text-gray-900 tracking-tight italic uppercase">Archive Patient?</h5>
                 <p className="text-xs font-medium text-red-600">Patient: {deleteTarget?.name}</p>
              </div>
           </div>
           
           <p className="text-xs text-gray-500 leading-relaxed font-medium italic border-l-2 border-gray-200 pl-4 py-2">
              Archiving a patient will set their status to "ARCHIVED". You can still view their history later.
           </p>

           <div className="flex gap-4 pt-4">
              <button
                 onClick={() => setDeleteTarget(null)}
                 className="flex-1 px-4 py-4 bg-gray-100 text-gray-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 transition-all"
              >
                 Cancel
              </button>
              <button
                 onClick={handleDelete}
                 disabled={deleting}
                 className="flex-[2] py-4 bg-red-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-red-200 hover:shadow-2xl hover:translate-y-[-2px] transition-all"
              >
                 {deleting ? "Archiving..." : "Archive Patient"}
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

