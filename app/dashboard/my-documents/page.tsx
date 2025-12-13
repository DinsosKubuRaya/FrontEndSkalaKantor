"use client";

import { useEffect, useState } from "react";
import { documentAPI, getErrorMessage } from "@/lib/api";
import { DocumentStaff } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { FileText, Download, Trash2, UploadCloud } from "lucide-react";
import { DocumentUploadForm } from "@/components/ui/documents/DocumentUploadForm";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DocumentEditDialog } from "@/components/ui/documents/DocumentEditDialog";

export default function MyDocumentsPage() {
  const [documents, setDocuments] = useState<DocumentStaff[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const response = await documentAPI.getMyDocuments();
      setDocuments(response.data?.documents || []);
    } catch (error) {
      toast.error("Gagal memuat dokumen");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus dokumen ini?")) return;
    try {
      await documentAPI.delete(id);
      toast.success("Dokumen dihapus");
      fetchDocuments();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dokumen Saya</h2>
        <DocumentUploadForm onSuccess={fetchDocuments} isAdmin={false}>
          <Button>
            <UploadCloud className="mr-2 h-4 w-4" /> Upload Dokumen
          </Button>
        </DocumentUploadForm>
      </div>

      {loading ? (
        <div className="text-center py-8">Memuat dokumen...</div>
      ) : documents.length === 0 ? (
        <Card className="bg-muted/50 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-10">
            <FileText className="h-10 w-10 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Belum ada dokumen yang diupload.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* DESKTOP VIEW */}
          <div className="hidden md:block border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subjek</TableHead>
                  <TableHead>Tanggal Upload</TableHead>
                  <TableHead>File</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((doc) => (
                  <TableRow key={doc.ID}>
                    <TableCell className="font-medium">{doc.Subject}</TableCell>
                    <TableCell>
                      {new Date(doc.CreatedAt).toLocaleDateString("id-ID")}
                    </TableCell>
                    <TableCell>
                      <a
                        href={doc.FileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <FileText className="h-4 w-4" /> Lihat File
                      </a>
                    </TableCell>
                    <TableCell className="text-right flex justify-end gap-2">
                      <DocumentEditDialog
                        document={doc}
                        onSuccess={fetchDocuments}
                        isAdmin={false}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(doc.ID)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* MOBILE VIEW */}
          <div className="grid gap-4 md:hidden">
            {documents.map((doc) => (
              <Card key={doc.ID}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold">
                    {doc.Subject}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {new Date(doc.CreatedAt).toLocaleDateString("id-ID", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </CardHeader>
                <CardContent className="flex justify-between items-center pt-2 border-t">
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={doc.FileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Download className="mr-2 h-4 w-4" /> Download
                    </a>
                  </Button>
                  <div className="flex gap-1">
                    <DocumentEditDialog
                      document={doc}
                      onSuccess={fetchDocuments}
                      isAdmin={false}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(doc.ID)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
