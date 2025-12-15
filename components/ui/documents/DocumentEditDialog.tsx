"use client";

import { useState } from "react";
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
import { Pencil } from "lucide-react";

interface Props {
  document: DocumentStaff;
  onSuccess: () => void;
  isAdmin?: boolean;
}

export function DocumentEditDialog({
  document,
  onSuccess,
  isAdmin = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [subject, setSubject] = useState(document.subject);
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isAdmin) {
        await documentAPI.updateAdmin(document.id, {
          subject,
          file: file || null,
        });
      } else {
        await documentAPI.updateSelf(document.id, {
          subject,
          file: file || null,
        });
      }
      toast.success("Dokumen berhasil diupdate");
      setOpen(false);
      onSuccess();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button variant="ghost" size="icon" onClick={() => setOpen(true)}>
        <Pencil className="h-4 w-4 text-blue-500" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-106.25">
          <DialogHeader>
            <DialogTitle>Edit Dokumen</DialogTitle>
            <DialogDescription>
              Ubah judul atau file dokumen. Biarkan file kosong jika tidak ingin
              mengubah file yang sudah ada.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Judul / Subjek</Label>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
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
                Biarkan kosong jika tidak ingin mengubah file.
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
