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
import { Plus, Pencil, Trash2, FileText } from "lucide-react";
import DocumentFormDialog from "@/components/ui/documents/DocumentFormDialog";

export default function MyDocumentsPage() {
  const [documents, setDocuments] = useState<DocumentStaff[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<DocumentStaff | null>(null);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const data = await documentStaffAPI.getMyDocuments();
      setDocuments(data);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus dokumen ini?")) return;
    try {
      await documentStaffAPI.delete(id);
      toast.success("Dokumen dihapus");
      fetchDocuments();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const openCreate = () => {
    setSelectedDoc(null);
    setIsDialogOpen(true);
  };

  const openEdit = (doc: DocumentStaff) => {
    setSelectedDoc(doc);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Dokumen Saya</h1>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" /> Upload Dokumen
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Arsip Pribadi</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Perihal</TableHead>
                <TableHead>Nama File</TableHead>
                <TableHead>Tanggal Upload</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : documents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    Belum ada dokumen.
                  </TableCell>
                </TableRow>
              ) : (
                documents.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium">{doc.subject}</TableCell>
                    <TableCell>
                      <a
                        href={doc.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center hover:underline text-blue-600"
                      >
                        <FileText className="mr-2 h-4 w-4" /> {doc.file_name}
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
                        <Pencil className="h-4 w-4 text-amber-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(doc.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
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
        isAdminMode={false}
      />
    </div>
  );
}
