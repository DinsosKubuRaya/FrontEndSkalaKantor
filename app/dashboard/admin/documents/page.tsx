"use client";

import { useEffect, useState } from "react";
import { documentAPI, getErrorMessage } from "@/lib/api";
import { DocumentFilterParams, DocumentStaff } from "@/types";
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
import {
  Search,
  Filter,
  X,
  Trash2,
  UploadCloud,
  Eye,
  ChevronLeft,
  ChevronRight,
  Download,
  Pencil,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DocumentUploadForm } from "@/components/ui/documents/DocumentUploadForm";
import { DocumentEditDialog } from "@/components/ui/documents/DocumentEditDialog";
import { SkeletonTable } from "@/components/ui/skeleton-table";
import { EmptyState } from "@/components/ui/empty-state";
import { FileIcon } from "@/components/ui/file-icon";
import { DocumentPreviewDialog } from "@/components/ui/documents/DocumentPreviewDialog";
import { DeleteDocumentDialog } from "@/components/ui/documents/DeleteDocumentDialog";

export default function AdminDocumentsPage() {
  const [documents, setDocuments] = useState<DocumentStaff[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [ownerFilter, setOwnerFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(20);

  const [showFilters, setShowFilters] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<DocumentStaff | null>(null);
  const [editDoc, setEditDoc] = useState<DocumentStaff | null>(null);
  const [deleteDoc, setDeleteDoc] = useState<{ id: string; subject: string } | null>(null);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const params: DocumentFilterParams = {
        page: currentPage,
        limit: itemsPerPage,
      };

      if (searchQuery) params.subject = searchQuery;
      if (ownerFilter) params.employee_id = ownerFilter;
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      const response = await documentAPI.getAllAdmin(params);
      const data = response.data?.documents || [];
      setDocuments(data);

      if (response.data?.pagination) {
        setTotalPages(response.data.pagination.total_pages);
        setTotalItems(response.data.pagination.total_items);
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [currentPage]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchDocuments();
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setOwnerFilter("");
    setStartDate("");
    setEndDate("");
    setCurrentPage(1);
  };

  const activeFiltersCount = [
    searchQuery,
    ownerFilter,
    startDate,
    endDate,
  ].filter(Boolean).length;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Semua Dokumen (Admin)
          </h2>
          {totalItems > 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              Menampilkan {startItem}-{endItem} dari {totalItems} dokumen
            </p>
          )}
        </div>
        <DocumentUploadForm onSuccess={fetchDocuments} isAdmin={true}>
          <Button>
            <UploadCloud className="mr-2 h-4 w-4" /> Upload untuk Pegawai
          </Button>
        </DocumentUploadForm>
      </div>

      {/* Search and Filter Bar */}
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari berdasarkan judul dokumen..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button type="submit" variant="secondary">
                <Search className="mr-2 h-4 w-4" />
                Cari
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="mr-2 h-4 w-4" />
                Filter
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </div>

            {showFilters && (
              <div className="grid gap-4 md:grid-cols-3 pt-4 border-t">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tanggal Mulai</label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Tanggal Akhir</label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Filter by Owner (Employee ID)
                  </label>
                  <Input
                    placeholder="Masukkan Employee ID..."
                    value={ownerFilter}
                    onChange={(e) => setOwnerFilter(e.target.value)}
                  />
                </div>

                <div className="md:col-span-3 flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleClearFilters}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Hapus Filter
                  </Button>
                  <Button type="submit" size="sm">
                    Terapkan Filter
                  </Button>
                </div>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading ? (
        <SkeletonTable rows={5} columns={5} />
      ) : documents.length === 0 ? (
        <Card>
          <EmptyState
            icon={searchQuery || activeFiltersCount > 0 ? "search" : "file"}
            title={
              searchQuery || activeFiltersCount > 0
                ? "Tidak ada dokumen ditemukan"
                : "Belum ada dokumen"
            }
            description={
              searchQuery || activeFiltersCount > 0
                ? "Coba ubah filter pencarian Anda"
                : "Mulai dengan mengupload dokumen baru"
            }
            action={
              searchQuery || activeFiltersCount > 0
                ? {
                    label: "Hapus Filter",
                    onClick: handleClearFilters,
                  }
                : undefined
            }
          />
        </Card>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Subjek</TableHead>
                  <TableHead>Pemilik</TableHead>
                  <TableHead>Tanggal Upload</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell>
                      <FileIcon
                        fileName={doc.file_name}
                        resourceType={doc.resource_type}
                      />
                    </TableCell>
                    <TableCell className="font-medium max-w-md">
                      <div className="truncate">{doc.subject}</div>
                      {doc.file_name && (
                        <div className="text-xs text-muted-foreground truncate">
                          {doc.file_name}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {doc.owner_name || (
                        <span className="text-xs text-muted-foreground">
                          Unknown
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(doc.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setPreviewDoc(doc)}
                          title="Preview"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditDoc(doc)}
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          asChild
                          title="Download"
                        >
                          <a
                            href={doc.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Download className="h-4 w-4" />
                          </a>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteDoc({ id: doc.id, subject: doc.subject })}
                          title="Hapus"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Cards */}
          <div className="grid gap-4 md:hidden">
            {documents.map((doc) => (
              <Card key={doc.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    <FileIcon
                      fileName={doc.file_name}
                      resourceType={doc.resource_type}
                      className="h-8 w-8 mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base truncate">
                        {doc.subject}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground mt-1">
                        {doc.owner_name || "Unknown"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(doc.created_at).toLocaleDateString("id-ID")}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex justify-between items-center pt-3 border-t">
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPreviewDoc(doc)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Preview
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditDoc(doc)}
                    >
                      <Pencil className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setDeleteDoc({ id: doc.id, subject: doc.subject })}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Hapus
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Halaman {currentPage} dari {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Sebelumnya
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  Selanjutnya
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Preview Dialog */}
      {previewDoc && (
        <DocumentPreviewDialog
          isOpen={!!previewDoc}
          onClose={() => setPreviewDoc(null)}
          document={previewDoc}
        />
      )}

      {/* Edit Dialog */}
      {editDoc && (
        <DocumentEditDialog
          document={editDoc}
          isOpen={!!editDoc}
          onClose={() => setEditDoc(null)}
          onSuccess={async () => {
            setEditDoc(null);
            // Clear state first to force re-render
            setDocuments([]);
            setLoading(true);
            // Small delay to ensure clean state update
            await new Promise(resolve => setTimeout(resolve, 100));
            // Refetch documents with updated data
            await fetchDocuments();
          }}
          isAdmin={true}
        />
      )}

      {/* Delete Dialog */}
      {deleteDoc && (
        <DeleteDocumentDialog
          document={deleteDoc}
          isOpen={!!deleteDoc}
          onClose={() => setDeleteDoc(null)}
          onSuccess={async () => {
            setDeleteDoc(null);
            // Clear state first to force re-render
            setDocuments([]);
            setLoading(true);
            // Small delay to ensure clean state update
            await new Promise(resolve => setTimeout(resolve, 100));
            // Refetch documents
            await fetchDocuments();
          }}
          variant="admin"
        />
      )}
    </div>
  );
}
