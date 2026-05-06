"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { X, ChevronRight, ChevronLeft, Sparkles, CheckCircle2, ArrowRight } from "lucide-react";
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
    title: "Welcome to Clindesk",
    content: "Transform your practice with Clindesk. You're starting with a 3-day full-access trial to explore everything we offer.",
    position: "center",
  },
  {
    targetId: "tour-clients",
    title: "Patient Management",
    content: "Keep all patient records, medical histories, and progress notes in one secure place. Try adding your first patient today!",
    position: "right",
  },
  {
    targetId: "tour-appointments",
    title: "Smart Calendar",
    content: "Schedule appointments with a single click. We handle the reminders so you can focus on your patients.",
    position: "right",
  },
  {
    targetId: "tour-sessions",
    title: "Clinical Sessions",
    content: "Document every session with precision. Create clinical notes, track outcomes, and monitor patient recovery journeys.",
    position: "right",
  },
  {
    targetId: "tour-billing",
    title: "Effortless Billing",
    content: "From session tracking to final invoices—automate your entire financial workflow in seconds.",
    position: "right",
  },
  {
    targetId: "tour-reports",
    title: "Deep Insights",
    content: "Visualize your practice's growth. Detailed analytics help you understand your patient demographics and revenue trends.",
    position: "right",
  },
  {
    targetId: "tour-settings",
    title: "Your Workspace",
    content: "Customize your clinic profile, manage team access, and handle your subscription settings right here.",
    position: "right",
  },
];

export default function OnboardingTour({ 
  onComplete, 
  setSidebarOpen 
}: { 
  onComplete: () => void;
  setSidebarOpen?: (open: boolean) => void;
}) {
  const [currentStep, setCurrentStep] = useState(0);

  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0, height: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const tourRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback(() => {
    const mobile = window.innerWidth < 1024;
    setIsMobile(mobile);
    
    const step = TOUR_STEPS[currentStep];
    
    // Automatically open sidebar if the step points to it
    if (step.targetId.startsWith("tour-") && setSidebarOpen && !mobile) {
      setSidebarOpen(true);
      // Wait a bit for sidebar transition
      setTimeout(() => {
        const element = document.getElementById(step.targetId);
        if (element) {
          const rect = element.getBoundingClientRect();
          setCoords({
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height
          });
          setIsVisible(true);
        }
      }, 350);
    } else {
      const element = document.getElementById(step.targetId);
      if (element) {
        const rect = element.getBoundingClientRect();
        setCoords({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height
        });
        setIsVisible(true);
      } else {
        // Fallback for missing elements or center position
        setIsVisible(true);
      }
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
      onComplete();
    }
  };

  const step = TOUR_STEPS[currentStep];
  const isCentered = step.position === "center" || isMobile;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center pointer-events-none">
      {/* Dynamic Background Overlay */}
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-[3px] pointer-events-auto transition-all duration-700" />

      {/* Spotlight Effect (Desktop Only) */}
      {!isCentered && (
        <div 
          className="absolute z-[1000] border-2 border-blue-400/50 rounded-2xl shadow-[0_0_0_9999px_rgba(15,23,42,0.6)] transition-all duration-500 ease-in-out"
          style={{
            top: coords.top - 8,
            left: coords.left - 8,
            width: coords.width + 16,
            height: coords.height + 16,
          }}
        >
          <div className="absolute inset-0 rounded-2xl animate-pulse bg-blue-400/10" />
        </div>
      )}

      {/* Tour Card */}
      <div
        ref={tourRef}
        className={`absolute z-[1001] w-[90%] max-w-[400px] bg-white rounded-[2.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] border border-gray-100 p-10 pointer-events-auto transition-all duration-700 ease-out flex flex-col
          ${isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"}
          ${isCentered 
            ? "relative" 
            : "transform"
          }`}
        style={!isCentered ? { 
          top: Math.min(coords.top + coords.height / 2, window.innerHeight - 300), 
          left: coords.left + coords.width + 40 
        } : {}}
      >
        {/* Progress & Icon */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex gap-1.5 flex-1 max-w-[120px]">
            {TOUR_STEPS.map((_, i) => (
              <div 
                key={i} 
                className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${i <= currentStep ? "bg-blue-600 w-4" : "bg-gray-100"}`} 
              />
            ))}
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
            {currentStep === 0 ? <Sparkles size={22} className="animate-spin-slow" /> : <CheckCircle2 size={22} />}
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4 mb-10">
          <h4 className="text-2xl font-black text-gray-900 tracking-tight leading-tight">
            {step.title}
          </h4>
          <p className="text-gray-500 leading-relaxed font-medium">
            {step.content}
          </p>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-50">
          <button
            onClick={handleComplete}
            className="text-xs font-black text-gray-400 uppercase tracking-widest hover:text-gray-900 transition-colors px-2"
          >
            Skip
          </button>

          <div className="flex items-center gap-3">
            {currentStep > 0 && (
              <button
                onClick={handlePrev}
                className="w-12 h-12 flex items-center justify-center bg-gray-50 text-gray-400 rounded-2xl hover:bg-gray-100 transition-all border border-gray-100"
              >
                <ChevronLeft size={20} />
              </button>
            )}
            <button
              onClick={handleNext}
              className="group flex items-center gap-4 px-8 py-4 bg-gray-900 text-white rounded-[1.5rem] text-sm font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-2xl shadow-blue-200/50"
            >
              {currentStep === TOUR_STEPS.length - 1 ? "Finish" : "Continue"}
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Close */}
        <button 
          onClick={handleComplete}
          className="absolute top-6 right-6 p-2 text-gray-300 hover:text-gray-900 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <style jsx global>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </div>
  );
}
