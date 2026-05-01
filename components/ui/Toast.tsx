"use client";
import { useEffect, useState, useCallback } from "react";
import { CheckCircle, XCircle, X } from "lucide-react";

export type ToastType = "success" | "error";

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
}

export default function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div
      className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 
                  px-4 py-3 rounded-xl shadow-lg border text-sm font-medium
                  animate-in slide-in-from-bottom-2 duration-300
                  ${type === "success"
                    ? "bg-green-50 border-green-200 text-green-800"
                    : "bg-red-50 border-red-200 text-red-800"
                  }`}
    >
      {type === "success"
        ? <CheckCircle size={18} className="text-green-600 shrink-0" />
        : <XCircle    size={18} className="text-red-600 shrink-0" />
      }
      <span>{message}</span>
      <button
        onClick={onClose}
        className="ml-1 text-gray-400 hover:text-gray-600"
      >
        <X size={14} />
      </button>
    </div>
  );
}

// ── useToast Hook ──────────────────────────────────────────
export function useToast() {
  const [toast, setToast] = useState<{
    message: string;
    type: ToastType;
  } | null>(null);

  const showToast = useCallback((message: string, type: ToastType = "success") => {
    setToast({ message, type });
  }, []);

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  return { toast, showToast, hideToast };
}
