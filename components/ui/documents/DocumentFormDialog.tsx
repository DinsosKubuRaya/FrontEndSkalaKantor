"use client";

import { useState, useEffect } from "react";
import { documentAPI, getErrorMessage } from "@/lib/api";
import { DocumentStaff } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface Props {
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
}: Props) {
  const [subject, setSubject] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (documentToEdit) {
      setSubject(documentToEdit.Subject);
      setFile(null);
    } else {
      setSubject("");
      setFile(null);
    }
  }, [documentToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (documentToEdit) {
        await documentAPI.updateSelf(documentToEdit.ID, { subject, file });
        toast.success("Dokumen berhasil diupdate");
      } else {
        await documentAPI.uploadSelf({ subject, file });
        toast.success("Dokumen berhasil diupload");
      }
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {documentToEdit ? "Edit Dokumen" : "Upload Dokumen Baru"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Judul Dokumen</Label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Contoh: Laporan Bulanan..."
              required
            />
          </div>
          <div className="space-y-2">
            <Label>File (PDF/Gambar)</Label>
            <Input
              type="file"
              onChange={(e) =>
                setFile(e.target.files ? e.target.files[0] : null)
              }
              required={!documentToEdit}
            />
            {documentToEdit && (
              <p className="text-xs text-gray-500">
                Kosongkan jika tidak ingin mengubah file
              </p>
            )}
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Memproses..." : documentToEdit ? "Update" : "Upload"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
