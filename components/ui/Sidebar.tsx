"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  FileText,
  Users,
  LogOut,
  UserCircle,
} from "lucide-react";
import { Button } from "./button";

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export function Sidebar({ sidebarOpen, setSidebarOpen }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const isAdmin = user?.Role === "admin";

  const commonNavigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Profil Saya", href: "/dashboard/profile", icon: UserCircle },
  ];

  const staffNavigation = [
    { name: "Dokumen Saya", href: "/dashboard/my-documents", icon: FileText },
  ];

  const adminNavigation = [
    { name: "Kelola Pegawai", href: "/dashboard/admin/users", icon: Users },
    {
      name: "Semua Dokumen",
      href: "/dashboard/admin/documents",
      icon: FileText,
    },
  ];

  const NavItem = ({
    item,
  }: {
    item: {
      name: string;
      href: string;
      icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    };
  }) => {
    const isActive =
      pathname === item.href ||
      (item.href !== "/dashboard" && pathname.startsWith(item.href));
    const Icon = item.icon;

    return (
      <Link
        href={item.href}
        onClick={() => setSidebarOpen(false)}
        className={`
            group flex items-center gap-3 px-4 py-3 mx-3 rounded-full text-sm font-medium transition-all duration-200
            ${
              isActive
                ? "bg-primary/10 text-primary font-bold shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }
        `}
      >
        <Icon
          className={`h-5 w-5 ${
            isActive
              ? "text-primary"
              : "text-muted-foreground group-hover:text-foreground"
          }`}
        />
        <span>{item.name}</span>
      </Link>
    );
  };

  return (
    <aside
      className={`
        fixed lg:sticky top-16 left-0 z-50 h-[calc(100vh-4rem)] w-64 
        border-r border-border/60 bg-card transition-transform duration-300 ease-in-out flex flex-col shadow-[1px_0_10px_0_rgba(0,0,0,0.01)]
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
    >
      <div className="flex-1 overflow-y-auto py-6 space-y-6 scrollbar-hide">
        {/* Menu Utama */}
        <div className="space-y-1">
          {commonNavigation.map((item) => (
            <NavItem key={item.href} item={item} />
          ))}
        </div>

        {/* Menu Staff */}
        <div className="space-y-1">
          <div className="px-7 mb-2 mt-2">
            <p className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-widest">
              Area Staff
            </p>
          </div>
          {staffNavigation.map((item) => (
            <NavItem key={item.href} item={item} />
          ))}
        </div>

        {/* Menu Admin */}
        {isAdmin && (
          <div className="space-y-1">
            <div className="px-7 mb-2 mt-2 flex items-center gap-2">
              <p className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-widest">
                Administrator
              </p>
            </div>
            {adminNavigation.map((item) => (
              <NavItem key={item.href} item={item} />
            ))}
          </div>
        )}
      </div>

      {/* Footer Mobile Only */}
      <div className="p-4 border-t border-border bg-muted/10 lg:hidden">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 gap-2"
          onClick={logout}
        >
          <LogOut className="h-4 w-4" />
          Keluar Aplikasi
        </Button>
      </div>
    </aside>
  );
}
