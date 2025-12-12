"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Employee } from "@/types";
import { employeeAPI, authAPI } from "@/lib/api";
import { useRouter, usePathname } from "next/navigation";
import Cookies from "js-cookie";

interface AuthContextType {
  user: Employee | null;
  loading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const refreshProfile = async () => {
    try {
      const userData = await employeeAPI.me();
      setUser(userData);
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      setUser(null);
      if (pathname !== "/login") {
        router.push("/login");
      }
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const token = Cookies.get("access_token");
      if (!token) {
        setLoading(false);
        if (pathname !== "/login") router.push("/login");
        return;
      }
      await refreshProfile();
      setLoading(false);
    };

    initAuth();
    // Hanya run sekali saat component mount, bukan setiap pathname berubah
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (accessToken: string) => {
    // Token sudah disimpan oleh authAPI.login() di lib/api.ts
    // Tunggu profile loaded sebelum redirect
    await refreshProfile();
    router.push("/dashboard");
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (err) {
      console.error(err);
    }
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, logout, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
