"use client";

import { useState, useEffect } from "react";
import { documentAPI, getErrorMessage } from "@/lib/api";
import { DocumentStaff } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface Props {
  document: DocumentStaff;
  isOpen?: boolean;
  onClose?: () => void;
  onSuccess: () => void;
  isAdmin?: boolean;
}

export function DocumentEditDialog({
  document,
  isOpen = false,
  onClose,
  onSuccess,
  isAdmin = false,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [subject, setSubject] = useState(document.subject);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    setSubject(document.subject);
    setFile(null);
  }, [document]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isAdmin) {
        await documentAPI.updateAdmin(document.id, {
          subject,
          employee_id: document.employee_id,
          file: file || null,
        });
      } else {
        await documentAPI.updateSelf(document.id, {
          subject,
          file: file || null,
        });
      }
      toast.success("Dokumen berhasil diperbarui");
      onSuccess();
      if (onClose) onClose();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && onClose) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>Edit Dokumen</DialogTitle>
          <DialogDescription>
            Ubah judul atau unggah file baru untuk menggantikan yang lama.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Judul / Subjek</Label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              placeholder="Masukkan judul dokumen"
            />
          </div>

          <div className="space-y-2">
            <Label>File Baru (Opsional)</Label>
            <Input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.webp"
            />
            <p className="text-xs text-muted-foreground">
              Biarkan kosong jika tidak ingin mengubah file saat ini.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
