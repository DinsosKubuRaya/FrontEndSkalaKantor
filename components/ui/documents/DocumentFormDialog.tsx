"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { documentStaffAPI, getErrorMessage } from "@/lib/api";
import { DocumentStaff } from "@/types";
import { toast } from "sonner";

interface DocumentFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  documentToEdit?: DocumentStaff | null;
  isAdminMode?: boolean;
}

export default function DocumentFormDialog({
  isOpen,
  onClose,
  onSuccess,
  documentToEdit,
  isAdminMode = false,
}: DocumentFormDialogProps) {
  const [subject, setSubject] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (documentToEdit) {
      setSubject(documentToEdit.subject);
      setFile(null);
    } else {
      setSubject("");
      setFile(null);
    }
  }, [documentToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData();
    formData.append("subject", subject);
    if (file) {
      formData.append("file", file);
    }

    try {
      if (documentToEdit) {
        if (isAdminMode) {
          await documentStaffAPI.updateAdmin(documentToEdit.id, formData);
        } else {
          await documentStaffAPI.updateMyDocument(documentToEdit.id, formData);
        }
        toast.success("Dokumen berhasil diperbarui");
      } else {
        if (!file) {
          toast.error("File wajib diunggah");
          setIsLoading(false);
          return;
        }
        await documentStaffAPI.upload(formData);
        toast.success("Dokumen berhasil diunggah");
      }
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>
            {documentToEdit ? "Edit Dokumen" : "Upload Dokumen Baru"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Perihal / Subjek</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              placeholder="Contoh: Laporan Bulanan"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="file">
              File Dokumen {documentToEdit && "(Opsional)"}
            </Label>
            <Input
              id="file"
              type="file"
              onChange={(e) =>
                setFile(e.target.files ? e.target.files[0] : null)
              }
              required={!documentToEdit}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Memproses..." : "Simpan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
