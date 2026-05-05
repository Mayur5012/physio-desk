import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Doctor {
  id: string;
  name: string;
  email: string;
  clinicName: string;
  subscriptionStatus?: string;
  subscriptionExpiry?: string | null;
  createdAt?: string | null;
  hasSeenTour?: boolean;
}

interface AuthState {
  doctor: Doctor | null;
  accessToken: string | null;
  setAuth: (doctor: Doctor, token: string) => void;
  setToken: (token: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      doctor: null,
      accessToken: null,
      setAuth: (doctor, accessToken) => set({ doctor, accessToken }),
      setToken: (accessToken) => set({ accessToken }),
      clearAuth: () => set({ doctor: null, accessToken: null }),
    }),
    {
      name: "physio-auth",
      // Persist doctor info and access token
      partialize: (state) => ({ 
        doctor: state.doctor, 
        accessToken: state.accessToken 
      }),
    }
  )
);
