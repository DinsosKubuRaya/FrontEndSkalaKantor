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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { documentAPI, getErrorMessage } from "@/lib/api";
import { toast } from "sonner";

interface Props {
  document: {
    id: string;
    subject: string;
  };
  onSuccess: () => void;
  variant?: "admin" | "staff";
}

export function DeleteDocumentDialog({
  document,
  onSuccess,
  variant = "staff",
}: Props) {
  const [open, setOpen] = useState(false);

  const handleDelete = async () => {
    try {
      await documentAPI.delete(document.id);
      toast.success("Dokumen berhasil dihapus");
      setOpen(false);
      onSuccess();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus Dokumen?</AlertDialogTitle>
          <AlertDialogDescription>
            {variant === "admin" ? (
              <>
                Tindakan ini tidak dapat dibatalkan. Dokumen{" "}
                <b>&quot;{document.subject}&quot;</b> akan dihapus permanen dari
                sistem.
              </>
            ) : (
              <>
                Apakah Anda yakin ingin menghapus dokumen{" "}
                <b>&quot;{document.subject}&quot;</b>?
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700"
          >
            Hapus
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
