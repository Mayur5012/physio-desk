"use client";
import { useState, useEffect, useCallback } from "react";
import { X, ChevronRight, ChevronLeft, Sparkles, CheckCircle2 } from "lucide-react";
import api from "@/lib/api";

interface TourStep {
  targetId: string;
  title: string;
  content: string;
  position: "right" | "left" | "top" | "bottom" | "center";
}

const TOUR_STEPS: TourStep[] = [
  {
    targetId: "center",
    title: "Welcome to Clindesk!",
    content: "We're excited to have you here. You are currently on a 3-day Free Trial with full access to all premium features.",
    position: "center",
  },
  {
    targetId: "tour-clients",
    title: "Manage Patients",
    content: "Start by adding your patients here. You can record their medical history, contact info, and track their progress over time.",
    position: "right",
  },
  {
    targetId: "tour-appointments",
    title: "Smart Scheduling",
    content: "Book appointments and manage your clinic hours easily. We'll help you send automated reminders to reduce no-shows.",
    position: "right",
  },
  {
    targetId: "tour-dashboard",
    title: "Live Analytics",
    content: "Track your daily sessions, upcoming appointments, and clinic revenue at a glance from your main dashboard.",
    position: "right",
  },
  {
    targetId: "tour-sessions",
    title: "Clinical Notes",
    content: "After every appointment, record detailed session notes, exercise plans, and patient outcomes here.",
    position: "right",
  },
  {
    targetId: "tour-billing",
    title: "Instant Invoicing",
    content: "Generate professional invoices and track payments for your sessions effortlessly. No more manual billing!",
    position: "right",
  },
  {
    targetId: "tour-reports",
    title: "Clinic Growth",
    content: "View detailed reports on your clinic's performance, patient retention, and financial health.",
    position: "right",
  },
  {
    targetId: "tour-settings",
    title: "Practice Settings",
    content: "Configure your clinic details, email notifications, and manage your premium subscription in the Billing tab.",
    position: "right",
  },
];

export default function OnboardingTour({ onComplete }: { onComplete: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const [isVisible, setIsVisible] = useState(false);

  const updatePosition = useCallback(() => {
    const step = TOUR_STEPS[currentStep];
    if (step.targetId === "center") {
      setIsVisible(true);
      return;
    }

    const element = document.getElementById(step.targetId);
    if (element) {
      const rect = element.getBoundingClientRect();
      setCoords({
        top: rect.top + rect.height / 2,
        left: rect.right + 20,
      });
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [currentStep]);

  useEffect(() => {
    updatePosition();
    window.addEventListener("resize", updatePosition);
    return () => window.removeEventListener("resize", updatePosition);
  }, [updatePosition]);

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = async () => {
    try {
      await api.post("/auth/tour-complete");
      onComplete();
    } catch (error) {
      console.error("Failed to mark tour as complete", error);
      onComplete();
    }
  };

  const step = TOUR_STEPS[currentStep];

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none overflow-hidden">
      {/* Dim Overlay */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px] pointer-events-auto transition-opacity duration-500" />

      {/* Tour Bubble */}
      <div
        className={`absolute z-[101] w-80 bg-white rounded-[2rem] shadow-[0_40px_100px_rgba(0,0,0,0.2)] border border-white p-8 pointer-events-auto transition-all duration-500 ease-out ${
          step.position === "center" 
            ? "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" 
            : "transform -translate-y-1/2"
        }`}
        style={step.position !== "center" ? { top: coords.top, left: coords.left } : {}}
      >
        {/* Progress Bar */}
        <div className="flex gap-1 mb-6">
          {TOUR_STEPS.map((_, i) => (
            <div 
              key={i} 
              className={`h-1 flex-1 rounded-full transition-all duration-500 ${i <= currentStep ? "bg-blue-600" : "bg-gray-100"}`} 
            />
          ))}
        </div>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
            {currentStep === 0 ? <Sparkles size={20} className="animate-pulse" /> : <CheckCircle2 size={20} />}
          </div>
          <h4 className="text-lg font-black text-gray-900 italic tracking-tight">{step.title}</h4>
        </div>

        <p className="text-sm text-gray-500 leading-relaxed mb-8 font-medium">
          {step.content}
        </p>

        <div className="flex items-center justify-between gap-4">
          <button
            onClick={handleComplete}
            className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-900 transition-colors"
          >
            Skip Tour
          </button>

          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <button
                onClick={handlePrev}
                className="p-3 bg-gray-50 text-gray-400 rounded-2xl hover:bg-gray-100 transition-all"
              >
                <ChevronLeft size={18} />
              </button>
            )}
            <button
              onClick={handleNext}
              className="flex items-center gap-3 px-6 py-3 bg-gray-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-gray-200"
            >
              {currentStep === TOUR_STEPS.length - 1 ? "Get Started" : "Next"}
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Close Button */}
        <button 
          onClick={handleComplete}
          className="absolute top-4 right-4 p-2 text-gray-300 hover:text-gray-900 transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      {/* Spotlight Effect for Sidebar Items */}
      {step.position !== "center" && (
        <div 
          className="absolute border-[4px] border-blue-500 rounded-2xl shadow-[0_0_0_9999px_rgba(0,0,0,0.3)] transition-all duration-500 ease-out z-[100]"
          style={{
            top: coords.top - 25,
            left: coords.left - 305, // Adjust based on sidebar width + padding
            width: 280,
            height: 50,
          }}
        />
      )}
    </div>
  );
}
