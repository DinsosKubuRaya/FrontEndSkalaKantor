"use client";

import { useEffect, useState } from "react";
import { documentAPI } from "@/lib/api";
import { DocumentStaff, DocumentAdminInput } from "@/types";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Search,
  Trash2,
  Pencil,
  FileText,
  User as UserIcon,
} from "lucide-react";
import { Label } from "@/components/ui/label";

export default function AdminDocumentsPage() {
  const [documents, setDocuments] = useState<DocumentStaff[]>([]);
  const [filteredDocs, setFilteredDocs] = useState<DocumentStaff[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<DocumentStaff | null>(null);
  const [editSubject, setEditSubject] = useState("");

  const fetchDocs = async () => {
    setLoading(true);
    try {
      const res = await documentAPI.getAllAdmin();
      if (res.status) {
        setDocuments(res.data);
        setFilteredDocs(res.data);
      }
    } catch (error) {
      toast.error("Gagal memuat semua dokumen");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);
  useEffect(() => {
    const lowerSearch = search.toLowerCase();
    const filtered = documents.filter(
      (doc) =>
        doc.Subject.toLowerCase().includes(lowerSearch) ||
        doc.User?.Name?.toLowerCase().includes(lowerSearch) ||
        doc.Employee?.Name?.toLowerCase().includes(lowerSearch)
    );
    setFilteredDocs(filtered);
  }, [search, documents]);

  const handleDelete = async (id: string) => {
    if (!confirm("Admin: Yakin hapus dokumen ini permanen?")) return;
    try {
      await documentAPI.delete(id);
      toast.success("Dokumen berhasil dihapus");
      fetchDocs();
    } catch {
      toast.error("Gagal menghapus dokumen");
    }
  };

  const openEdit = (doc: DocumentStaff) => {
    setEditingDoc(doc);
    setEditSubject(doc.Subject);
    setIsEditOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDoc) return;

    try {
      const payload: DocumentAdminInput = { subject: editSubject };
      await documentAPI.updateAdmin(editingDoc.ID, payload);
      toast.success("Dokumen diperbarui");
      setIsEditOpen(false);
      fetchDocs();
    } catch {
      toast.error("Gagal update dokumen");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">
          Semua Dokumen Arsip
        </h2>
        <p className="text-gray-500">
          Monitoring seluruh dokumen yang masuk ke sistem.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="relative max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Cari Judul atau Nama Pengupload..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pengupload</TableHead>
                <TableHead>Judul Dokumen</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>File</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : filteredDocs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24">
                    Tidak ada data.
                  </TableCell>
                </TableRow>
              ) : (
                filteredDocs.map((doc) => (
                  <TableRow key={doc.ID}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center">
                          <UserIcon className="h-4 w-4 text-slate-500" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">
                            {doc.User?.Name || doc.Employee?.Name || "Unknown"}
                          </span>
                          <span className="text-xs text-gray-500">
                            {doc.User?.Role || doc.Employee?.Role || "-"}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{doc.Subject}</TableCell>
                    <TableCell>
                      {new Date(doc.CreatedAt).toLocaleDateString("id-ID")}
                    </TableCell>
                    <TableCell>
                      <a
                        href={doc.FileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center text-blue-600 hover:underline text-sm"
                      >
                        <FileText className="mr-1 h-3 w-3" /> Buka
                      </a>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(doc)}
                        >
                          <Pencil className="h-4 w-4 text-orange-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(doc.ID)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Admin */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Dokumen (Admin Mode)</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label>Judul Dokumen</Label>
              <Input
                value={editSubject}
                onChange={(e) => setEditSubject(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditOpen(false)}
              >
                Batal
              </Button>
              <Button type="submit">Simpan Perubahan</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
