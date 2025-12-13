"use client";

import { RoleGuard } from "./RoleGuard";

interface AdminGuardProps {
  children: React.ReactNode;
  fallbackRoute?: string;
}

export function AdminGuard({
  children,
  fallbackRoute = "/dashboard",
}: AdminGuardProps) {
  return (
    <RoleGuard requiredRole="admin" fallbackRoute={fallbackRoute}>
      {children}
    </RoleGuard>
  );
}
