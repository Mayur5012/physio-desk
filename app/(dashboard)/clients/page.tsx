"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Spinner from "@/components/ui/Spinner";
import Pagination from "@/components/ui/Pagination";
import Modal from "@/components/ui/Modal";
import Toast, { useToast, ToastType } from "@/components/ui/Toast";
import {
  UserPlus, Search, Eye, Pencil, Trash2,
  Phone, User, ChevronUp, ChevronDown,
} from "lucide-react";

interface Client {
  _id: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  email?: string;
  chiefComplaint: string;
  therapyType: string;
  clientType: string;
  status: string;
  createdAt: string;
}

const STATUS_OPTIONS = [
  { value: "ALL",        label: "All Clients" },
  { value: "ACTIVE",     label: "Active" },
  { value: "INACTIVE",   label: "Inactive" },
  { value: "DISCHARGED", label: "Discharged" },
];

const THERAPY_LABEL: Record<string, string> = {
  PHYSIOTHERAPY: "Physio",
  ACUPRESSURE:   "Acupressure",
  COMBINED:      "Combined",
};

const GENDER_LABEL: Record<string, string> = {
  MALE: "M", FEMALE: "F", OTHER: "O",
};

export default function ClientsPage() {
  const router = useRouter();
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
      showToast("Failed to load clients", "error");
    } finally {
      setLoading(false);
    }
  }, [search, status, sort, order, page]);

  useEffect(() => { fetchClients(); }, [fetchClients]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => { setPage(1); fetchClients(); }, 400);
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
      showToast("Client discharged successfully", "success");
      setDeleteTarget(null);
      fetchClients();
    } catch {
      showToast("Failed to discharge client", "error");
    } finally {
      setDeleting(false);
    }
  };

  const SortIcon = ({ field }: { field: string }) =>
    sort === field
      ? order === "asc"
        ? <ChevronUp size={14} className="text-blue-600" />
        : <ChevronDown size={14} className="text-blue-600" />
      : <ChevronDown size={14} className="text-gray-300" />;

  return (
    <div className="space-y-5 max-w-7xl mx-auto">

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Clients</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {total} total clients
          </p>
        </div>
        <button
          onClick={() => router.push("/clients/new")}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 
                     text-white text-sm font-medium px-4 py-2.5 rounded-lg 
                     transition-colors"
        >
          <UserPlus size={16} />
          Add New Client
        </button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 
                         text-gray-400"
            />
            <input
              type="text"
              placeholder="Search by name, phone, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-300 
                         rounded-lg text-sm focus:outline-none focus:ring-2 
                         focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="px-4 py-2.5 border border-gray-300 rounded-lg 
                       text-sm focus:outline-none focus:ring-2 
                       focus:ring-blue-500 bg-white"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </Card>

      {/* Table */}
      <Card>
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : clients.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <User size={40} className="text-gray-200 mb-3" />
            <p className="text-gray-500 text-sm">No clients found</p>
            {search && (
              <button
                onClick={() => setSearch("")}
                className="text-blue-600 text-xs hover:underline mt-1"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left px-5 py-3 text-xs font-semibold 
                                   text-gray-500 uppercase tracking-wide w-8">
                      #
                    </th>
                    <th
                      className="text-left px-5 py-3 text-xs font-semibold 
                                 text-gray-500 uppercase tracking-wide 
                                 cursor-pointer hover:text-gray-700"
                      onClick={() => handleSort("name")}
                    >
                      <div className="flex items-center gap-1">
                        Name <SortIcon field="name" />
                      </div>
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-semibold 
                                   text-gray-500 uppercase tracking-wide">
                      Age / Gender
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-semibold 
                                   text-gray-500 uppercase tracking-wide">
                      Phone
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-semibold 
                                   text-gray-500 uppercase tracking-wide">
                      Complaint
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-semibold 
                                   text-gray-500 uppercase tracking-wide">
                      Therapy
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-semibold 
                                   text-gray-500 uppercase tracking-wide">
                      Status
                    </th>
                    <th
                      className="text-left px-5 py-3 text-xs font-semibold 
                                 text-gray-500 uppercase tracking-wide 
                                 cursor-pointer hover:text-gray-700"
                      onClick={() => handleSort("createdAt")}
                    >
                      <div className="flex items-center gap-1">
                        Added <SortIcon field="createdAt" />
                      </div>
                    </th>
                    <th className="text-right px-5 py-3 text-xs font-semibold 
                                   text-gray-500 uppercase tracking-wide">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {clients.map((client, idx) => (
                    <tr
                      key={client._id}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-5 py-3.5 text-xs text-gray-400">
                        {(page - 1) * 10 + idx + 1}
                      </td>

                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 
                                          text-blue-700 flex items-center 
                                          justify-center text-xs font-bold 
                                          shrink-0">
                            {client.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {client.name}
                            </p>
                            {client.email && (
                              <p className="text-xs text-gray-400">
                                {client.email}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-3.5 text-sm text-gray-600">
                        {client.age}y /{" "}
                        {GENDER_LABEL[client.gender] || client.gender}
                      </td>

                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5 text-sm 
                                        text-gray-600">
                          <Phone size={13} className="text-gray-400" />
                          {client.phone}
                        </div>
                      </td>

                      <td className="px-5 py-3.5 text-sm text-gray-600 
                                     max-w-[160px]">
                        <p className="truncate">{client.chiefComplaint}</p>
                      </td>

                      <td className="px-5 py-3.5">
                        <span className="text-xs text-gray-600">
                          {THERAPY_LABEL[client.therapyType] ||
                           client.therapyType}
                        </span>
                      </td>

                      <td className="px-5 py-3.5">
                        <Badge
                          variant={client.status.toLowerCase() as any}
                          label={client.status.charAt(0) +
                                 client.status.slice(1).toLowerCase()}
                        />
                      </td>

                      <td className="px-5 py-3.5 text-xs text-gray-400">
                        {new Date(client.createdAt).toLocaleDateString("en-IN")}
                      </td>

                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() =>
                              router.push(`/clients/${client._id}`)
                            }
                            className="p-1.5 text-gray-400 hover:text-blue-600 
                                       hover:bg-blue-50 rounded-lg transition"
                            title="View"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() =>
                              router.push(`/clients/${client._id}/edit`)
                            }
                            className="p-1.5 text-gray-400 hover:text-green-600 
                                       hover:bg-green-50 rounded-lg transition"
                            title="Edit"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(client)}
                            className="p-1.5 text-gray-400 hover:text-red-600 
                                       hover:bg-red-50 rounded-lg transition"
                            title="Discharge"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
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

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Discharge Client"
        size="sm"
      >
        <p className="text-sm text-gray-600 mb-1">
          Are you sure you want to discharge{" "}
          <span className="font-semibold text-gray-900">
            {deleteTarget?.name}
          </span>
          ?
        </p>
        <p className="text-xs text-gray-400 mb-6">
          This will mark the client as discharged. All history is preserved.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => setDeleteTarget(null)}
            className="flex-1 px-4 py-2.5 border border-gray-300 
                       rounded-lg text-sm font-medium text-gray-700 
                       hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 
                       disabled:bg-red-400 text-white rounded-lg text-sm 
                       font-medium transition"
          >
            {deleting ? "Discharging..." : "Yes, Discharge"}
          </button>
        </div>
      </Modal>

      {/* Toast */}
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
