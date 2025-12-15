"use client";

import { useAuth } from "@/context/AuthContext";
import { Menu, LogOut, ChevronDown, User as UserIcon } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import Link from "next/link";

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export function Header({ sidebarOpen, setSidebarOpen }: HeaderProps) {
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-40 w-full h-16 border-b border-border/50 bg-background/80 backdrop-blur-xl transition-all">
      <div className="flex h-full items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-muted-foreground"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu className="h-6 w-6" />
          </Button>

          <div className="flex items-center gap-3">
            <Image
              src="/logodinsos.png"
              alt="Logo"
              width={150}
              height={40}
              className="h-10 w-auto object-contain"
              priority
            />
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <div className="h-6 w-px bg-border/50 hidden md:block mx-1" />

          {/* User Profile Dropdown */}
          <div className="relative">
            <Button
              variant="ghost"
              className="pl-1 pr-2 gap-2 h-10 rounded-full hover:bg-muted/50 border border-transparent hover:border-border/50 transition-all"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold border border-border">
                {user?.Name ? getInitials(user.Name) : "U"}
              </div>
              <div className="hidden md:flex flex-col items-start text-left mr-1">
                <span className="text-xs font-semibold leading-none">
                  {user?.Name?.split(" ")[0]}
                </span>
                <span className="text-[10px] text-muted-foreground capitalize leading-none mt-0.5">
                  {user?.Role}
                </span>
              </div>
              <ChevronDown className="h-3 w-3 text-muted-foreground opacity-50 hidden md:block" />
            </Button>

            {isDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-56 rounded-2xl shadow-xl bg-card border border-border/60 p-1 z-50 animate-in fade-in zoom-in-95 duration-200">
                  <div className="p-3 bg-muted/30 rounded-xl mb-1">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-semibold leading-none text-foreground">
                        {user?.Name}
                      </p>
                      <p className="text-xs text-muted-foreground break-all">
                        @{user?.Username}
                      </p>
                    </div>
                  </div>

                  <Link
                    href="/dashboard/profile"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center w-full cursor-pointer rounded-xl py-2.5 px-3 font-medium text-sm transition-colors hover:bg-muted text-foreground"
                  >
                    <UserIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                    Profil Saya
                  </Link>

                  <div className="my-1 h-px bg-border/50" />

                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      logout();
                    }}
                    className="flex items-center w-full text-destructive hover:bg-destructive/10 cursor-pointer rounded-xl py-2.5 px-3 font-medium text-sm transition-colors"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Keluar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
