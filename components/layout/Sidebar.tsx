"use client";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard, Users, CalendarDays, ClipboardList,
  CreditCard, BarChart2, Settings, X, Stethoscope,
  ChevronRight,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard",    label: "Dashboard",    icon: LayoutDashboard },
  { href: "/clients",      label: "Clients",      icon: Users },
  { href: "/appointments", label: "Appointments", icon: CalendarDays },
  { href: "/sessions",     label: "Sessions",     icon: ClipboardList },
  { href: "/billing",      label: "Billing",      icon: CreditCard },
  { href: "/reports",      label: "Reports",      icon: BarChart2 },
  { href: "/settings",     label: "Settings",     icon: Settings },
];

interface SidebarProps {
  isOpen:   boolean;
  onClose:  () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

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

  return (
    <>
      {/* ── Mobile Backdrop ───────────────────────────── */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm 
                     lg:hidden"
          onClick={onClose}
        />
      )}

      {/* ── Sidebar Panel ─────────────────────────────── */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white 
                    border-r border-gray-100 flex flex-col
                    transform transition-transform duration-300 ease-in-out
                    lg:translate-x-0 lg:static lg:z-auto
                    ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 
                        border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center 
                            justify-center shrink-0">
              <Stethoscope size={18} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 leading-tight">
                PhysioDesk
              </p>
              <p className="text-xs text-gray-400 leading-tight">
                Clinic Management
              </p>
            </div>
          </div>

          {/* Close button — mobile only */}
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 text-gray-400 hover:text-gray-600 
                       hover:bg-gray-100 rounded-lg transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href ||
              (href !== "/dashboard" && pathname.startsWith(href));

            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl 
                            text-sm font-medium transition-all group
                            ${isActive
                              ? "bg-blue-600 text-white shadow-sm shadow-blue-200"
                              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            }`}
              >
                <Icon
                  size={18}
                  className={`shrink-0 transition
                    ${isActive
                      ? "text-white"
                      : "text-gray-400 group-hover:text-gray-600"
                    }`}
                />
                <span className="flex-1">{label}</span>
                {isActive && (
                  <ChevronRight size={14} className="text-blue-200" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom — version */}
        <div className="px-5 py-4 border-t border-gray-100 shrink-0">
          <p className="text-xs text-gray-400 text-center">
            PhysioDesk v1.0.0
          </p>
        </div>
      </aside>
    </>
  );
}
