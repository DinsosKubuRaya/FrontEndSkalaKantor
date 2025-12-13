"use client";

import { useEffect, useState } from "react";
import { employeeAPI, getErrorMessage } from "@/lib/api";
import { Employee } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Pencil } from "lucide-react";

interface Props {
  children?: React.ReactNode;
  onSuccess: () => void;
  userToEdit?: Employee;
}

export function EmployeeFormDialog({ children, onSuccess, userToEdit }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("staff");

  useEffect(() => {
    if (open) {
      if (userToEdit) {
        setName(userToEdit.Name);
        setUsername(userToEdit.Username);
        setRole(userToEdit.Role);
        setPassword("");
      } else {
        setName("");
        setUsername("");
        setPassword("");
        setRole("staff");
      }
    }
  }, [open, userToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (userToEdit) {
        await employeeAPI.update(userToEdit.ID, {
          name,
          username,
          role,
        });
        toast.success("Pegawai berhasil diperbarui");
      } else {
        if (!password) {
          toast.error("Password wajib diisi untuk pegawai baru");
          setLoading(false);
          return;
        }
        await employeeAPI.create({
          name,
          username,
          password,
          role,
        });
        toast.success("Pegawai berhasil dibuat");
      }
      setOpen(false);
      onSuccess();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children ? (
          children
        ) : (
          <Button variant="ghost" size="icon">
            <Pencil className="h-4 w-4 text-blue-500" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>
            {userToEdit ? "Edit Pegawai" : "Tambah Pegawai"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Nama Lengkap</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nama Pegawai"
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Username</Label>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username login"
              required
            />
          </div>

          {/* Password hanya required Create */}
          {!userToEdit && (
            <div className="space-y-2">
              <Label>Password</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="******"
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>Role</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="staff">Staff</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="supervisor">Supervisor</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Menyimpan..." : "Simpan"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
