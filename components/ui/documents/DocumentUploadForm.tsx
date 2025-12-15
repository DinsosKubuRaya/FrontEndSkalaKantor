"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { documentAPI, employeeAPI, getErrorMessage } from "@/lib/api";
import { Employee, EmployeeBackendData, EmployeeApiResponse } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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

function normalizeEmployee(item: EmployeeApiResponse): Employee {
  if ("ID" in item && item.ID) {
    return item as Employee;
  }

  const backendData = item as EmployeeBackendData;
  return {
    ID: backendData.id,
    Name: backendData.name,
    Username: backendData.username,
    Role: backendData.role,
    CreatedAt: backendData.created_at,
    UpdatedAt: backendData.updated_at,
  };
}
interface Props {
  children: React.ReactNode;
  onSuccess: () => void;
  isAdmin?: boolean;
}

export function DocumentUploadForm({
  children,
  onSuccess,
  isAdmin = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);

  const [subject, setSubject] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (isAdmin && open) {
      employeeAPI
        .getAll()
        .then((res) => {
          const rawData = res.data || [];
          const mappedEmployees: Employee[] = Array.isArray(rawData)
            ? rawData.map((item: EmployeeApiResponse) =>
                normalizeEmployee(item)
              )
            : [];

          setEmployees(mappedEmployees);
        })
        .catch((error) => {
          console.error("Failed to load employees:", error);
          toast.error("Gagal memuat daftar pegawai");
          setEmployees([]);
        });
    }
  }, [isAdmin, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error("File wajib dipilih");
      return;
    }
    if (isAdmin && !selectedUser) {
      toast.error("User wajib dipilih");
      return;
    }

    setLoading(true);
    try {
      if (isAdmin) {
        await documentAPI.createAdmin({
          subject,
          employee_id: selectedUser,
          file: file,
        });
      } else {
        await documentAPI.uploadSelf({
          subject,
          file: file,
        });
      }
      toast.success("Dokumen berhasil diupload");
      setOpen(false);
      setSubject("");
      setFile(null);
      onSuccess();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>Upload Dokumen</DialogTitle>
          <DialogDescription>
            {isAdmin
              ? "Upload dokumen untuk pegawai tertentu. Pilih pemilik dokumen dan file yang akan diupload."
              : "Upload dokumen pribadi Anda. Isi judul dan pilih file yang akan diupload."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Judul / Subjek</Label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Contoh: SK Kenaikan Pangkat"
              required
            />
          </div>

          {isAdmin && (
            <div className="space-y-2">
              <Label>Pemilik Dokumen</Label>
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Pegawai" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((emp) => (
                    <SelectItem key={emp.ID} value={emp.ID}>
                      {emp.Name} ({emp.Username})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label>File (PDF/Dokumen/Gambar)</Label>
            <Input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.webp"
              required
            />
            <p className="text-xs text-muted-foreground">
              Format: PDF, Word, Excel, PowerPoint, atau Gambar
            </p>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Mengupload..." : "Upload"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
