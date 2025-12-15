"use client";

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
import { employeeAPI, getErrorMessage } from "@/lib/api";
import { toast } from "sonner";
import { Employee } from "@/types";

interface Props {
  user: Employee | null;
  onSuccess: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function DeleteUserDialog({ user, onSuccess, open, onOpenChange }: Props) {
  const handleDelete = async () => {
    if (!user) return;
    
    try {
      await employeeAPI.delete(user.ID);
      toast.success(`Pegawai ${user.Name} berhasil dihapus`);
      onSuccess();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  if (!user) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus Pegawai?</AlertDialogTitle>
          <AlertDialogDescription>
            Tindakan ini tidak dapat dibatalkan. Pegawai <b>{user.Name}</b> akan
            dihapus permanen dari sistem.
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
