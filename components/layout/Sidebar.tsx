"use client";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard, Users, CalendarDays, ClipboardList,
  CreditCard, BarChart2, Settings, X, Activity,
  ChevronRight, LogOut, Sparkles
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import SubscriptionBadge from "@/components/subscription/SubscriptionBadge";


const NAV_ITEMS = [
  { href: "/dashboard",    label: "Dashboard",    icon: LayoutDashboard, color: "text-blue-500" },
  { href: "/clients",      label: "Patients",      icon: Users, color: "text-purple-500" },
  { href: "/appointments", label: "Appointments",      icon: CalendarDays, color: "text-emerald-500" },
  { href: "/sessions",     label: "Sessions",     icon: ClipboardList, color: "text-indigo-500" },
  { href: "/billing",      label: "Billing",      icon: CreditCard, color: "text-orange-500" },
  { href: "/reports",      label: "Reports",      icon: BarChart2, color: "text-pink-500" },
  { href: "/settings",     label: "Settings",     icon: Settings, color: "text-slate-500" },
];

interface SidebarProps {
  isOpen:   boolean;
  onClose:  () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const doctor = useAuthStore((state) => state.doctor);


  // Close sidebar on route change (mobile)
  useEffect(() => { onClose(); }, [pathname]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleLogout = () => {
    clearAuth();
    router.push("/login");
  };

  return (
    <>
      {/* ── Mobile Backdrop ───────────────────────────── */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-900/20 backdrop-blur-md 
                     lg:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* ── Sidebar Panel ─────────────────────────────── */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-72 bg-white/80 backdrop-blur-2xl
                    border-r border-gray-100 flex flex-col
                    transform transition-all duration-500 ease-in-out
                    lg:translate-x-0 lg:static lg:z-auto
                    ${isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full shadow-none"}`}
      >
        {/* Logo Section */}
        <div className="flex items-center justify-between px-7 pt-4 pb-6 shrink-0 border-b border-gray-50/50">
          <Link href="/dashboard" className="flex items-center gap-3.5 group">
            <div className="flex flex-col relative">
              <div className="absolute -inset-2 bg-blue-500/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <img 
                src="/logo.png" 
                alt="clindesk app" 
                className="h-9 w-auto object-contain object-left group-hover:scale-105 transition-all duration-500 relative z-10" 
              />
              <p className="text-[8px] font-black text-gray-400 mt-1 uppercase tracking-[0.25em] leading-none ml-0.5 relative z-10">
                Clinic Manager
              </p>
            </div>
          </Link>

          {/* Close button — mobile only */}
          <button
            onClick={onClose}
            className="lg:hidden p-2 text-gray-400 hover:text-gray-900 
                       bg-gray-50 rounded-xl transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Global Search Mockup or Status */}
        <div className="px-6 mb-6">
           <SubscriptionBadge doctor={doctor} />
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-4 py-2 space-y-1 custom-scrollbar">
          {NAV_ITEMS.map(({ href, label, icon: Icon, color }) => {
            const isActive = pathname === href ||
              (href !== "/dashboard" && pathname.startsWith(href));

            return (
              <Link
                key={href}
                href={href}
                id={`tour-${href.replace("/", "") || "dashboard"}`}
                className={`flex items-center gap-4 px-4 py-3.5 rounded-[1.25rem] 
                            text-sm transition-all duration-300 relative group
                            ${isActive
                              ? "bg-gray-900 text-white shadow-xl shadow-gray-200 translate-x-1"
                              : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                            }`}
              >
                <Icon
                  size={20}
                  className={`shrink-0 transition-transform duration-500
                    ${isActive ? "text-white scale-110" : `${color} opacity-70 group-hover:opacity-100 group-hover:scale-110`}
                  `}
                />
                <span className={`flex-1 font-black italic tracking-tight transition-all duration-300 ${isActive ? 'translate-x-1' : ''}`}>
                  {label}
                </span>
                {isActive && (
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                )}
                {!isActive && (
                   <ChevronRight size={14} className="text-gray-300 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="p-6 mt-auto">
          <div className="bg-blue-50/50 rounded-3xl p-5 border border-blue-100 mb-6 relative overflow-hidden group">
             <div className="absolute -right-4 -top-4 w-12 h-12 bg-blue-100 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
             <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1 italic">Support</p>
             <p className="text-xs text-gray-600 font-bold leading-relaxed">Please contact on support@clindesk.in for any platform related queries.</p>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-white border border-gray-100 text-red-500 hover:bg-red-50 hover:border-red-100 transition-all font-black text-xs uppercase tracking-[0.2em]"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
