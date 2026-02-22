import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Doctor {
  id: string;
  name: string;
  email: string;
  clinicName: string;
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
      // Only persist doctor info, not the access token
      partialize: (state) => ({ doctor: state.doctor }),
    }
  )
);
