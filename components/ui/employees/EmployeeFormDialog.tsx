"use client";

import { useState, useEffect } from "react";
import { employeeAPI } from "@/lib/api";
import { Employee, EmployeeInput, Role } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  employee?: Employee | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function EmployeeFormDialog({
  employee,
  onSuccess,
  onCancel,
}: Props) {
  const [formData, setFormData] = useState<EmployeeInput>({
    name: "",
    username: "",
    password: "",
    role: "staff",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (employee) {
      setFormData({
        name: employee.Name,
        username: employee.Username,
        role: employee.Role,
        password: "",
      });
    } else {
      setFormData({ name: "", username: "", password: "", role: "staff" });
    }
  }, [employee]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (employee) {
        await employeeAPI.update(employee.ID, formData);
        toast.success("Data pegawai berhasil diperbarui");
      } else {
        if (!formData.password) {
          toast.error("Password wajib diisi untuk pegawai baru");
          setLoading(false);
          return;
        }
        await employeeAPI.create(formData);
        toast.success("Pegawai baru berhasil ditambahkan");
      }
      onSuccess();
    } catch (error) {
      toast.error("Terjadi kesalahan saat menyimpan data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nama Lengkap</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          value={formData.username}
          onChange={(e) =>
            setFormData({ ...formData, username: e.target.value })
          }
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Role / Jabatan</Label>
        <Select
          value={formData.role}
          onValueChange={(val) =>
            setFormData({ ...formData, role: val as Role })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Pilih Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="staff">Staff</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="superadmin">Super Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">
          {employee ? "Password Baru (Opsional)" : "Password"}
        </Label>
        <Input
          id="password"
          type="password"
          placeholder={employee ? "Biarkan kosong jika tidak diubah" : "******"}
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
          required={!employee}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Batal
        </Button>
        <Button type="submit" disabled={loading}>
          {loading
            ? "Menyimpan..."
            : employee
            ? "Simpan Perubahan"
            : "Tambah Pegawai"}
        </Button>
      </div>
    </form>
  );
}
