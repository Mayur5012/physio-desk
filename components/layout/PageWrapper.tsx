"use client";
import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

interface PageWrapperProps {
  children: React.ReactNode;
  doctor?:  { name: string; clinicName: string; email: string };
}

export default function PageWrapper({ children, doctor }: PageWrapperProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">

      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

        {/* Header */}
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          doctor={doctor}
        />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
