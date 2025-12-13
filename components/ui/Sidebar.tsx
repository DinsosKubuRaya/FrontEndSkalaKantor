"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileText,
  Users,
  LogOut,
  UserCircle,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { Button } from "./button";

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const isAdmin = user?.Role === "admin";

  const links = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      show: true,
    },
    {
      href: "/dashboard/profile",
      label: "Profil Saya",
      icon: UserCircle,
      show: true,
    },
    {
      href: "/dashboard/my-documents",
      label: "Dokumen Saya",
      icon: FileText,
      show: true,
    },
    {
      href: "/dashboard/admin/users",
      label: "Kelola Pegawai",
      icon: Users,
      show: isAdmin,
    },
    {
      href: "/dashboard/admin/documents",
      label: "Semua Dokumen",
      icon: FileText,
      show: isAdmin,
    },
  ];

  const sidebarContent = (
    <div className="flex h-full flex-col gap-4 py-4">
      <div className="px-6 py-2">
        <h1 className="text-xl font-bold tracking-tight text-primary">
          Skala Kantor
        </h1>
        <p className="text-xs text-muted-foreground">
          {user?.Name} ({user?.Role})
        </p>
      </div>
      <nav className="flex-1 space-y-1 px-4">
        {links
          .filter((link) => link.show)
          .map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all hover:text-primary",
                  isActive
                    ? "bg-secondary text-primary shadow-sm"
                    : "text-muted-foreground hover:bg-secondary/50"
                )}
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
      </nav>
      <div className="px-4 mt-auto">
        <Button
          variant="destructive"
          className="w-full justify-start gap-3"
          onClick={logout}
        >
          <LogOut className="h-4 w-4" />
          Keluar
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between bg-white border-b p-4 shadow-sm">
        <span className="font-bold">Menu</span>
        <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X /> : <Menu />}
        </Button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-40 bg-background md:hidden pt-16">
          {sidebarContent}
        </div>
      )}

      <aside className="hidden md:flex h-screen w-64 flex-col border-r bg-background fixed left-0 top-0 overflow-y-auto">
        {sidebarContent}
      </aside>
    </>
  );
}
