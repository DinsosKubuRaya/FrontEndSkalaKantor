"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  User, 
  LogOut,
  Files,
  BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const menuItems = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      roles: ["admin", "staff"]
    },
    {
      label: "Dokumen Saya",
      href: "/dashboard/my-documents",
      icon: FileText,
      roles: ["admin", "staff"]
    },
    {
      label: "Semua Dokumen",
      href: "/dashboard/admin/documents",
      icon: Files,
      roles: ["admin"]
    },
    {
      label: "Kelola Pegawai",
      href: "/dashboard/admin/employees",
      icon: Users,
      roles: ["admin"]
    },
    {
      label: "Laporan",
      href: "/dashboard/reports",
      icon: BarChart3,
      roles: ["admin"]
    },
    {
      label: "Profil",
      href: "/dashboard/profile",
      icon: User,
      roles: ["admin", "staff"]
    }
  ];

  const filteredMenu = menuItems.filter(item => 
    item.roles.includes(user?.role || "staff")
  );

  return (
    <aside className="w-64 bg-white shadow-md flex flex-col">
      {/* Header */}
      <div className="p-6 border-b">
        <h1 className="text-xl font-bold text-gray-800">Arsip Digital</h1>
        <p className="text-sm text-gray-500 mt-1">
          {user?.name || "User"}
        </p>
        <span className="inline-block mt-1 px-2 py-1 text-xs rounded bg-blue-100 text-blue-700">
          {user?.role === "admin" ? "Administrator" : "Staff"}
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {filteredMenu.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? "bg-blue-50 text-blue-700 font-medium"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t">
        <Button
          onClick={logout}
          variant="outline"
          className="w-full justify-start gap-3"
        >
          <LogOut className="h-5 w-5" />
          Keluar
        </Button>
      </div>
    </aside>
  );
}
