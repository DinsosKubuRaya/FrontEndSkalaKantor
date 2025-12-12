"use client";

import { useEffect, useState } from "react";
import { documentStaffAPI, getErrorMessage } from "@/lib/api";
import { DocumentStaff } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Pencil, Trash2, FileText } from "lucide-react";
import DocumentFormDialog from "@/components/ui/documents/DocumentFormDialog";
import { useAuth } from "@/context/AuthContext";

export default function AdminDocumentsPage() {
  const [documents, setDocuments] = useState<DocumentStaff[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<DocumentStaff | null>(null);
  const { user } = useAuth();

  const fetchDocuments = async () => {
    try {
      const data = await documentStaffAPI.getAllAdmin();
      setDocuments(data);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "admin") {
      fetchDocuments();
    }
  }, [user]);

  const handleDelete = async (id: string) => {
    if (!confirm("Admin: Yakin hapus dokumen ini?")) return;
    try {
      await documentStaffAPI.delete(id);
      toast.success("Dokumen dihapus");
      fetchDocuments();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const openEdit = (doc: DocumentStaff) => {
    setSelectedDoc(doc);
    setIsDialogOpen(true);
  };

  if (user?.role !== "admin") return <div className="p-8">Akses ditolak.</div>;

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold tracking-tight">
        Manajemen Semua Dokumen
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>Daftar Dokumen Staff</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pemilik (Employee ID)</TableHead>
                <TableHead>Perihal</TableHead>
                <TableHead>File</TableHead>
                <TableHead>Tgl Upload</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : (
                documents.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell>
                      {doc.employee_id ?? doc.user_id ?? "-"}
                    </TableCell>
                    <TableCell>{doc.subject}</TableCell>
                    <TableCell>
                      <a
                        href={doc.file_url}
                        target="_blank"
                        className="flex items-center hover:underline text-blue-600"
                      >
                        <FileText className="mr-2 h-4 w-4" /> Buka
                      </a>
                    </TableCell>
                    <TableCell>
                      {new Date(doc.created_at).toLocaleDateString("id-ID")}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(doc)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500"
                        onClick={() => handleDelete(doc.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <DocumentFormDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSuccess={fetchDocuments}
        documentToEdit={selectedDoc}
        isAdminMode={true}
      />
    </div>
  );
}
