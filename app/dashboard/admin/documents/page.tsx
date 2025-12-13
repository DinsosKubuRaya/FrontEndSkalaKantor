"use client";

import { useEffect, useState } from "react";
import { documentAPI, getErrorMessage } from "@/lib/api";
import { DocumentStaff } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { FileText, Search, Trash2, UploadCloud } from "lucide-react";
import { DocumentUploadForm } from "@/components/ui/documents/DocumentUploadForm";
import { DocumentEditDialog } from "@/components/ui/documents/DocumentEditDialog";

export default function AdminDocumentsPage() {
  const [documents, setDocuments] = useState<DocumentStaff[]>([]);
  const [filteredDocs, setFilteredDocs] = useState<DocumentStaff[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const response = await documentAPI.getAllAdmin();
      const data = response.data?.documents || [];
      setDocuments(data);
      setFilteredDocs(data);
    } catch (error) {
      toast.error("Gagal memuat dokumen");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    const lower = searchQuery.toLowerCase();
    const filtered = documents.filter(
      (doc) =>
        doc.Subject.toLowerCase().includes(lower) ||
        doc.user?.name?.toLowerCase().includes(lower)
    );
    setFilteredDocs(filtered);
  }, [searchQuery, documents]);

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus dokumen ini secara permanen?")) return;
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
        <h2 className="text-3xl font-bold tracking-tight">
          Semua Dokumen (Admin)
        </h2>
        <DocumentUploadForm onSuccess={fetchDocuments} isAdmin={true}>
          <Button>
            <UploadCloud className="mr-2 h-4 w-4" /> Upload untuk Pegawai
          </Button>
        </DocumentUploadForm>
      </div>

      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Cari berdasarkan judul..."
          className="pl-9"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="text-center py-8">Memuat data...</div>
      ) : filteredDocs.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          Tidak ada dokumen ditemukan.
        </div>
      ) : (
        <>
          {/* DESKTOP VIEW */}
          <div className="hidden md:block border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subjek</TableHead>
                  <TableHead>Pemilik (ID User)</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>File</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDocs.map((doc) => (
                  <TableRow key={doc.ID}>
                    <TableCell className="font-medium">{doc.Subject}</TableCell>
                    <TableCell className="text-xs font-mono">
                      {doc.UserID}
                    </TableCell>
                    <TableCell>
                      {new Date(doc.CreatedAt).toLocaleDateString("id-ID")}
                    </TableCell>
                    <TableCell>
                      <a
                        href={doc.FileUrl}
                        target="_blank"
                        className="text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <FileText className="h-4 w-4" /> Lihat
                      </a>
                    </TableCell>
                    <TableCell className="text-right flex justify-end gap-1">
                      <DocumentEditDialog
                        document={doc}
                        onSuccess={fetchDocuments}
                        isAdmin={true}
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
            {filteredDocs.map((doc) => (
              <Card key={doc.ID}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{doc.Subject}</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    User ID: {doc.UserID.substring(0, 8)}...
                  </p>
                </CardHeader>
                <CardContent className="flex justify-between items-center pt-2 border-t">
                  <a
                    href={doc.FileUrl}
                    target="_blank"
                    className="text-sm text-blue-600"
                  >
                    Download File
                  </a>
                  <div className="flex gap-1">
                    <DocumentEditDialog
                      document={doc}
                      onSuccess={fetchDocuments}
                      isAdmin={true}
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
