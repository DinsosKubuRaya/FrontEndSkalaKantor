"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Edit,
  Trash2,
  ShieldCheck,
  User as UserIcon,
  MoreHorizontal,
} from "lucide-react";
import { Employee } from "@/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UserTableProps {
  users: Employee[];
  onEdit: (user: Employee) => void;
  onDelete: (user: Employee) => void;
}

export function UserTable({ users, onEdit, onDelete }: UserTableProps) {
  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
      case "superadmin":
        return (
          <Badge className="bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 shadow-none px-2 py-0.5 rounded-full">
            <ShieldCheck className="mr-1.5 h-3 w-3" />
            {role === "superadmin" ? "Super Admin" : "Admin"}
          </Badge>
        );
      default:
        return (
          <Badge
            variant="outline"
            className="bg-slate-50 text-slate-600 border-slate-200 shadow-none px-2 py-0.5 rounded-full"
          >
            <UserIcon className="mr-1.5 h-3 w-3" />
            Staff
          </Badge>
        );
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="rounded-2xl border border-border/50 bg-card shadow-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/40">
          <TableRow className="hover:bg-transparent border-b border-border/50">
            <TableHead className="pl-6 w-75 font-semibold">
              Nama Pegawai
            </TableHead>
            <TableHead className="font-semibold">Role</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="text-right pr-6 font-semibold">
              Aksi
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={4}
                className="h-32 text-center text-muted-foreground"
              >
                Tidak ada data pegawai.
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow
                key={user.ID}
                className="group hover:bg-muted/30 transition-colors border-b border-border/40 last:border-0"
              >
                <TableCell className="pl-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold border border-primary/20">
                      {getInitials(user.Name)}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-foreground">
                        {user.Name}
                      </span>
                      <span className="text-xs text-muted-foreground font-mono">
                        @{user.Username}
                      </span>
                    </div>
                  </div>
                </TableCell>

                <TableCell>{getRoleBadge(user.Role)}</TableCell>

                <TableCell>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
                    Aktif
                  </span>
                </TableCell>

                <TableCell className="text-right pr-6">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="rounded-xl border-border/60 shadow-lg"
                    >
                      <DropdownMenuLabel className="text-xs text-muted-foreground">
                        Opsi Akun
                      </DropdownMenuLabel>
                      <DropdownMenuItem
                        onClick={() => onEdit(user)}
                        className="cursor-pointer gap-2 rounded-lg"
                      >
                        <Edit className="h-4 w-4" /> Edit Data
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onDelete(user)}
                        className="cursor-pointer gap-2 rounded-lg text-destructive focus:text-destructive focus:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" /> Hapus Akun
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
