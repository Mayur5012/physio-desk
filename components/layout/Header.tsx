"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import api from "@/lib/api";
import {
  Menu, Bell, User, LogOut,
  Settings, ChevronDown,
} from "lucide-react";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard":    "Dashboard",
  "/clients":      "Clients",
  "/appointments": "Appointments",
  "/sessions":     "Sessions",
  "/billing":      "Billing",
  "/reports":      "Reports",
  "/settings":     "Settings",
};

interface HeaderProps {
  onMenuClick: () => void;
  doctor?: { name: string; clinicName: string; email: string };
}

export default function Header({ onMenuClick, doctor }: HeaderProps) {
  const router   = useRouter();
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get current page title
  const pageTitle = Object.entries(PAGE_TITLES).find(([path]) =>
    pathname === path ||
    (path !== "/dashboard" && pathname.startsWith(path))
  )?.[1] || "PhysioDesk";

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {}
    window.location.href = "/login";
  };

  const initials = doctor?.name
    ? doctor.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "DR";

  return (
    <header className="h-16 bg-white border-b border-gray-100 
                       flex items-center justify-between 
                       px-4 sm:px-6 shrink-0 sticky top-0 z-30">

      {/* Left — Hamburger + Title */}
      <div className="flex items-center gap-3">
        {/* Hamburger — visible on mobile only */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-gray-500 hover:text-gray-700 
                     hover:bg-gray-100 rounded-lg transition"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>

        <div>
          <h1 className="text-base sm:text-lg font-bold text-gray-900 
                         leading-tight">
            {pageTitle}
          </h1>
          {doctor?.clinicName && (
            <p className="text-xs text-gray-400 leading-tight hidden sm:block">
              {doctor.clinicName}
            </p>
          )}
        </div>
      </div>

      {/* Right — Actions */}
      <div className="flex items-center gap-1 sm:gap-2">

        {/* Notifications */}
        <button
          className="relative p-2 text-gray-500 hover:text-gray-700 
                     hover:bg-gray-100 rounded-lg transition"
        >
          <Bell size={18} />
          {/* Notification dot */}
          <span className="absolute top-1.5 right-1.5 w-2 h-2 
                           bg-red-500 rounded-full" />
        </button>

        {/* Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 
                       hover:bg-gray-100 rounded-xl transition"
          >
            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-blue-600 
                            text-white flex items-center justify-center 
                            text-xs font-bold shrink-0">
              {initials}
            </div>
            {/* Name — hidden on small screens */}
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-gray-800 
                            leading-tight max-w-[120px] truncate">
                {doctor?.name || "Doctor"}
              </p>
              <p className="text-xs text-gray-400 leading-tight">
                Physiotherapist
              </p>
            </div>
            <ChevronDown
              size={14}
              className={`text-gray-400 transition-transform hidden sm:block
                          ${dropdownOpen ? "rotate-180" : ""}`}
            />
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-white 
                            border border-gray-100 rounded-xl shadow-lg 
                            shadow-black/5 py-1.5 z-50">

              {/* Doctor info */}
              <div className="px-4 py-2.5 border-b border-gray-100">
                <p className="text-xs font-semibold text-gray-800 truncate">
                  {doctor?.name}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {doctor?.email}
                </p>
              </div>

              <button
                onClick={() => {
                  setDropdownOpen(false);
                  router.push("/settings");
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 
                           text-sm text-gray-700 hover:bg-gray-50 transition"
              >
                <Settings size={15} className="text-gray-400" />
                Settings
              </button>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 
                           text-sm text-red-600 hover:bg-red-50 transition"
              >
                <LogOut size={15} className="text-red-500" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
