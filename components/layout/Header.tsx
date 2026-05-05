"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import {
  Bell as BellIcon, Menu as MenuIcon, User as UserIcon, LogOut as LogOutIcon, 
  Settings as SettingsIcon, ChevronDown as ChevronDownIcon, Sparkles
} from "lucide-react";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard":    "Overview",
  "/clients":      "Patients",
  "/appointments": "Appointments",
  "/sessions":     "Sessions",
  "/billing":      "Billing",
  "/reports":      "Reports",
  "/settings":     "Settings",
};

interface HeaderProps {
  onMenuClick: () => void;
  doctor?: { name: string; clinicName: string; email: string; logoUrl?: string };
}

export default function Header({ onMenuClick, doctor }: HeaderProps) {
  const router   = useRouter();
  const pathname = usePathname();
  const setIsTourOpen = useAuthStore((s) => s.setIsTourOpen);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get current page title
  const pageTitle = Object.entries(PAGE_TITLES).find(([path]) =>
    pathname === path ||
    (path !== "/dashboard" && pathname.startsWith(path))
  )?.[1] || "Clindesk Core";

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
    <header className="h-20 bg-white/70 backdrop-blur-md border-b border-gray-100/50 
                       flex items-center justify-between 
                       px-6 sm:px-10 shrink-0 sticky top-0 z-40">

      {/* Left — Hamburger + Title */}
      <div className="flex items-center gap-6">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2.5 text-gray-500 hover:text-gray-900 
                     bg-gray-100/50 rounded-xl transition-all"
          aria-label="Open menu"
        >
          <MenuIcon size={20} />
        </button>

        <div className="space-y-0.5 min-w-0">
          <h1 className="text-lg sm:text-xl font-black text-gray-900 tracking-tight italic truncate">
            {pageTitle}<span className="text-blue-600">.</span>
          </h1>
          {doctor?.clinicName && (
            <div className="flex items-center gap-2">
               <div className="w-1 h-1 rounded-full bg-blue-500 shrink-0" />
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest hidden md:block truncate">
                 {doctor.clinicName}
               </p>
            </div>
          )}
        </div>
      </div>

      {/* Right — Actions */}
      <div className="flex items-center gap-2 sm:gap-4">
        
        {/* Global Notifications Bridge */}
        <button
          className="group relative p-2.5 text-gray-400 hover:text-gray-900 
                     bg-gray-50/50 hover:bg-gray-100 rounded-xl sm:rounded-2xl transition-all duration-300"
        >
          <BellIcon size={18} className="group-hover:rotate-12 transition-transform" />
          <span className="absolute top-2 right-2 w-2 h-2 
                           bg-blue-600 rounded-full ring-2 ring-white animate-pulse" />
        </button>

        {/* User Profile Matrix */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
          >
            <p className="text-sm font-black tracking-tight italic hidden sm:block">
              {doctor?.name || "Provider"}
            </p>
            
            <div className="sm:hidden w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center text-white text-[10px] font-black italic shadow-lg">
               {initials}
            </div>

            <ChevronDownIcon
              size={14}
              className={`transition-transform duration-300 text-gray-400 hidden sm:block
                          ${dropdownOpen ? "rotate-180" : ""}`}
            />
          </button>

          {/* Expanded Dropdown Panel */}
          {dropdownOpen && (
            <div className="absolute right-0 top-[calc(100%+12px)] w-64 bg-white/90 backdrop-blur-xl
                            border border-gray-100 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] 
                            py-3 p-2 z-50 animate-in fade-in zoom-in-95 duration-200">
              
              <div className="px-5 py-4 mb-2 bg-gray-50 rounded-[1.5rem] border border-gray-100">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-black text-white">
                      {initials}
                   </div>
                   <div className="overflow-hidden">
                      <p className="text-[11px] font-black text-gray-900 truncate tracking-tight">{doctor?.name}</p>
                      <p className="text-[9px] font-bold text-gray-400 truncate tracking-tight">{doctor?.email}</p>
                   </div>
                </div>
              </div>

              <div className="space-y-1">
                <button
                  onClick={() => {
                    setIsTourOpen(true);
                    setDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 
                             text-[11px] font-black uppercase tracking-widest text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                >
                  <Sparkles size={14} />
                  Take Tour
                </button>

                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    router.push("/settings");
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 
                             text-[11px] font-black uppercase tracking-widest text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all"
                >
                  <SettingsIcon size={14} />
                  Settings
                </button>

                <div className="h-px bg-gray-100 my-2 mx-4" />

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 
                             text-[11px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 rounded-xl transition-all"
                >
                  <LogOutIcon size={14} />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
