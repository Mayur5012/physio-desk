"use client";
import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useAuthStore } from "@/store/authStore";
import OnboardingTour from "../onboarding/OnboardingTour";



interface PageWrapperProps {
  children: React.ReactNode;
  doctor?:  { 
    id: string;
    name: string; 
    clinicName: string; 
    email: string;
    subscriptionStatus?: string;
    subscriptionExpiry?: string | null;
    createdAt?: string | null;
    hasSeenTour?: boolean;
  };
}



export default function PageWrapper({ children, doctor }: PageWrapperProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);
  const currentToken = useAuthStore((s) => s.accessToken);

  useEffect(() => {
    if (doctor) {
      // Always trust the server-side doctor data
      setAuth(doctor as any, currentToken || "");
      
      // Trigger tour if never seen before
      if (!doctor.hasSeenTour) {
        setShowTour(true);
      }
    }
  }, [doctor, setAuth]); 



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
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 relative">
          {children}
          {showTour && (
            <OnboardingTour onComplete={() => setShowTour(false)} />
          )}
        </main>
      </div>
    </div>

  );
}
