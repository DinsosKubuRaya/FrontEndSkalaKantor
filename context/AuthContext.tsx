"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authAPI, employeeAPI } from "@/lib/api";
import { UserProfile } from "@/types";

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserProfile | null;
  login: (accessToken: string, refreshToken: string) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem("refresh_token");
      if (refreshToken) {
        await authAPI.logout(refreshToken);
      }
    } catch (error) {
      console.error("Logout error (server side):", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("refresh_token");
      document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";

      setUser(null);
      setIsAuthenticated(false);
      router.push("/login");
    }
  };

  const refreshProfile = async (token?: string) => {
    try {
      console.log(
        "🔄 refreshProfile called with token:",
        token ? "PASSED ✅" : "will use localStorage"
      );
      const response = await employeeAPI.getMe(token);
      if (response && response.data) {
        const backendData = response.data;
        setUser({
          ID: backendData.id,
          Name: backendData.name,
          Username: backendData.username,
          Role: backendData.role,
        });
        setIsAuthenticated(true);
        console.log("✅ Profile loaded successfully:", backendData.name);
      }
    } catch (error) {
      console.error("❌ Gagal load profile", error);
      logout();
    }
  };

  const login = async (accessToken: string, refreshToken: string) => {
    console.log("🔐 Login called - Saving tokens to localStorage...");
    localStorage.setItem("token", accessToken);
    localStorage.setItem("refresh_token", refreshToken);
    document.cookie = `token=${accessToken}; path=/; max-age=86400; SameSite=Strict`;
    console.log(
      "💾 Tokens saved. Now calling refreshProfile with direct token..."
    );

    setIsAuthenticated(true);
    await refreshProfile(accessToken); // ✅ Pass token directly!
    console.log("🚀 Redirecting to dashboard...");
    router.push("/dashboard");
  };

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        await refreshProfile();
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        login,
        logout,
        refreshProfile,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
