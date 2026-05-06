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
  const [windowSize, setWindowSize] = useState({ w: 0, h: 0 });

  const updatePosition = useCallback(() => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    setWindowSize({ w, h });
    const mobile = w < 1024;
    setIsMobile(mobile);
    
    const step = TOUR_STEPS[currentStep];
    
    if (step.targetId.startsWith("tour-") && setSidebarOpen && !mobile) {
      setSidebarOpen(true);
      setTimeout(() => {
        const element = document.getElementById(step.targetId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
          setTimeout(() => {
            const rect = element.getBoundingClientRect();
            setCoords({ top: rect.top, left: rect.left, width: rect.width, height: rect.height });
            setIsVisible(true);
          }, 400);
        }
      }, 400);
    } else {
      const element = document.getElementById(step.targetId);
      if (element && step.targetId !== "center") {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        setTimeout(() => {
          const rect = element.getBoundingClientRect();
          setCoords({ top: rect.top, left: rect.left, width: rect.width, height: rect.height });
          setIsVisible(true);
        }, 400);
      } else {
        setIsVisible(true);
      }
    }
  }, [currentStep, setSidebarOpen]);

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
  const isCentered = step.targetId === "center" || isMobile;

  // Calculate card position to avoid overflow
  const getCardStyle = () => {
    if (isCentered) return {};
    
    let top = coords.top + coords.height / 2;
    let left = coords.left + coords.width + 40;

    // Boundary checks
    if (top + 400 > windowSize.h) top = windowSize.h - 450;
    if (top < 20) top = 20;

    return { top, left };
  };

  return (
    <div className={`fixed inset-0 z-[9999] pointer-events-none overflow-hidden ${isCentered ? "flex items-center justify-center p-4" : ""}`}>
      {/* Precision Mask Overlay - Excludes the spotlight area from blur/dimming */}
      <div 
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-[3px] pointer-events-auto transition-all duration-500 ease-in-out"
        style={!isCentered ? {
          clipPath: `polygon(
            0% 0%, 0% 100%, 100% 100%, 100% 0%, 
            0% 0%, 
            ${coords.left - 8}px ${coords.top - 8}px, 
            ${coords.left + coords.width + 8}px ${coords.top - 8}px, 
            ${coords.left + coords.width + 8}px ${coords.top + coords.height + 8}px, 
            ${coords.left - 8}px ${coords.top + coords.height + 8}px, 
            ${coords.left - 8}px ${coords.top - 8}px
          )`
        } : {}}
      />

      {/* Visual Spotlight Border (Desktop Only) */}
      {!isCentered && (
        <div 
          className="absolute z-[1000] border-2 border-blue-400 rounded-2xl transition-all duration-500 ease-in-out shadow-[0_0_20px_rgba(96,165,250,0.3)]"
          style={{
            top: coords.top - 8,
            left: coords.left - 8,
            width: coords.width + 16,
            height: coords.height + 16,
          }}
        >
          <div className="absolute inset-0 rounded-2xl animate-pulse bg-blue-400/5" />
        </div>
      )}

      {/* Tour Card */}
      <div
        className={`z-[1001] w-full max-w-[380px] bg-white rounded-[2.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.4)] border border-gray-100 p-8 sm:p-10 pointer-events-auto transition-all duration-700 ease-out flex flex-col
          ${isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"}
          ${isCentered ? "relative" : "absolute -translate-y-1/2"}`}
        style={getCardStyle()}
      >
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

        <div className="space-y-3 mb-8">
          <h4 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight leading-tight">
            {step.title}
          </h4>
          <p className="text-sm sm:text-base text-gray-500 leading-relaxed font-medium">
            {step.content}
          </p>
        </div>

        <div className="flex items-center justify-between pt-6 border-t border-gray-50">
          <button
            onClick={handleComplete}
            className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-900 transition-colors px-2"
          >
            Skip
          </button>

          <div className="flex items-center gap-3">
            {currentStep > 0 && (
              <button
                onClick={handlePrev}
                className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-gray-50 text-gray-400 rounded-2xl hover:bg-gray-100 transition-all border border-gray-100"
              >
                <ChevronLeft size={18} />
              </button>
            )}
            <button
              onClick={handleNext}
              className="group flex items-center gap-3 sm:gap-4 px-6 sm:px-8 py-3 sm:py-4 bg-gray-900 text-white rounded-[1.5rem] text-xs sm:text-sm font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-blue-100"
            >
              {currentStep === TOUR_STEPS.length - 1 ? "Start" : "Next"}
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

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
