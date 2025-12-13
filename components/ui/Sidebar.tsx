"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  Users,
  FileText,
  FolderOpen,
  LogOut,
  Settings,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const isActive = (path: string) => pathname === path;
  const renderRoleBadge = () => {
    if (!user) return null;
    const colors = {
      superadmin: "bg-red-500",
      admin: "bg-blue-500",
      staff: "bg-green-500",
    };
    return (
      <span
        className={`text-xs px-2 py-0.5 rounded-full ${
          colors[user.Role] || "bg-gray-500"
        } text-white capitalize`}
      >
        {user.Role}
      </span>
    );
  };

  return (
    <div className="flex h-screen w-64 flex-col bg-slate-900 text-white border-r border-slate-800">
      {/* Header Sidebar */}
      <div className="flex h-20 items-center gap-3 px-6 border-b border-slate-800">
        <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <FileText className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold leading-none">Arsip Digital</h1>
          <span className="text-xs text-slate-400">Kantor Dinsos</span>
        </div>
      </div>

      {/* User Info  */}
      <div className="px-6 py-4 bg-slate-800/50 mb-2">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center text-lg font-bold">
            {user?.Name?.charAt(0) || "U"}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium truncate">{user?.Name}</p>
            {renderRoleBadge()}
          </div>
        </div>
      </div>

      {/* Navigasi */}
      <nav className="flex-1 space-y-1 px-3 py-2 overflow-y-auto">
        <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 mt-2">
          Menu Utama
        </p>

        <Link
          href="/dashboard"
          className={`group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
            isActive("/dashboard")
              ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
              : "text-slate-300 hover:bg-slate-800 hover:text-white"
          }`}
        >
          <LayoutDashboard className="mr-3 h-5 w-5" />
          Dashboard
        </Link>

        {/* Menu Admin / Superadmin */}
        {(user?.Role === "admin" || user?.Role === "superadmin") && (
          <>
            <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 mt-6">
              Administrator
            </p>
            <Link
              href="/dashboard/admin/employees"
              className={`group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                isActive("/dashboard/admin/employees")
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Users className="mr-3 h-5 w-5" />
              Manajemen Staff
            </Link>
            <Link
              href="/dashboard/admin/documents"
              className={`group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                isActive("/dashboard/admin/documents")
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Shield className="mr-3 h-5 w-5" />
              Semua Dokumen
            </Link>
          </>
        )}

        <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 mt-6">
          Pribadi
        </p>

        <Link
          href="/dashboard/my-documents"
          className={`group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
            isActive("/dashboard/my-documents")
              ? "bg-blue-600 text-white"
              : "text-slate-300 hover:bg-slate-800 hover:text-white"
          }`}
        >
          <FolderOpen className="mr-3 h-5 w-5" />
          Dokumen Saya
        </Link>

        <Link
          href="/dashboard/profile"
          className={`group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
            isActive("/dashboard/profile")
              ? "bg-blue-600 text-white"
              : "text-slate-300 hover:bg-slate-800 hover:text-white"
          }`}
        >
          <Settings className="mr-3 h-5 w-5" />
          Pengaturan Profil
        </Link>
      </nav>

      {/* Logout */}
      <div className="border-t border-slate-800 p-4">
        <Button
          onClick={logout}
          variant="destructive"
          className="w-full flex items-center justify-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          Keluar
        </Button>
      </div>
    </div>
  );
}
