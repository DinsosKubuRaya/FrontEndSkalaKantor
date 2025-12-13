"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface RoleGuardProps {
  children: React.ReactNode;
  requiredRole: string;
  fallbackRoute?: string;
}

export function RoleGuard({
  children,
  requiredRole,
  fallbackRoute = "/dashboard",
}: RoleGuardProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      if (user.Role !== requiredRole) {
        console.warn(
          `Access denied: User role '${user.Role}' does not match required role '${requiredRole}'`
        );
        router.replace(fallbackRoute);
      }
    }
  }, [isLoading, user, requiredRole, fallbackRoute, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="text-sm text-gray-600">Memverifikasi akses...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (user.Role !== requiredRole) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="text-sm text-gray-600">Mengalihkan...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
