"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { documentAPI, getErrorMessage } from "@/lib/api";
import { toast } from "sonner";

interface Props {
  document: {
    id: string;
    subject: string;
  };
  isOpen?: boolean;
  onClose?: () => void;
  onSuccess: () => void;
  variant?: "admin" | "staff";
}

export function DeleteDocumentDialog({
  document,
  isOpen = false,
  onClose,
  onSuccess,
  variant = "staff",
}: Props) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await documentAPI.delete(document.id);
      toast.success("Dokumen berhasil dihapus");
      onSuccess();
      if (onClose) onClose();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && onClose) onClose();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus Dokumen?</AlertDialogTitle>
          <AlertDialogDescription>
            {variant === "admin" ? (
              <>
                Tindakan ini bersifat permanen. Dokumen{" "}
                <span className="font-bold text-foreground">
                  &quot;{document.subject}&quot;
                </span>{" "}
                akan dihapus dari sistem dan tidak dapat dipulihkan.
              </>
            ) : (
              <>
                Apakah Anda yakin ingin menghapus dokumen{" "}
                <span className="font-bold text-foreground">
                  &quot;{document.subject}&quot;
                </span>
                ?
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Batal</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            disabled={loading}
          >
            {loading ? "Menghapus..." : "Ya, Hapus"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
