/* file: dinsoskuburaya/frontendskalakantor/FrontEndSkalaKantor.../app/dashboard/my-documents/page.tsx */
"use client";

import { useEffect, useState } from "react";
import { documentAPI, getErrorMessage } from "@/lib/api";
import { DocumentFilterParams, DocumentStaff } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import {
  UploadCloud,
  Search,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DocumentUploadForm } from "@/components/ui/documents/DocumentUploadForm";
import { DocumentTable } from "@/components/ui/documents/DocumentTable"; // Import komponen baru
import { DocumentEditDialog } from "@/components/ui/documents/DocumentEditDialog";
import { DocumentPreviewDialog } from "@/components/ui/documents/DocumentPreviewDialog";
import { DeleteDocumentDialog } from "@/components/ui/documents/DeleteDocumentDialog";
import { SkeletonTable } from "@/components/ui/skeleton-table";

export default function MyDocumentsPage() {
  const [documents, setDocuments] = useState<DocumentStaff[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // State untuk Dialogs
  const [editDoc, setEditDoc] = useState<DocumentStaff | null>(null);
  const [deleteDoc, setDeleteDoc] = useState<{
    id: string;
    subject: string;
  } | null>(null);
  const [previewDoc, setPreviewDoc] = useState<DocumentStaff | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showFilters, setShowFilters] = useState(false);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const params: DocumentFilterParams = {
        page: currentPage,
        limit: itemsPerPage,
        subject: searchQuery || undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
      };

      const response = await documentAPI.getMyDocuments(params);
      setDocuments(response.data?.documents || []);

      if (response.data?.pagination) {
        setTotalPages(response.data.pagination.total_pages);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchDocuments();
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setStartDate("");
    setEndDate("");
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dokumen Saya</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Kelola arsip dokumen pribadi Anda di sini.
          </p>
        </div>
        <DocumentUploadForm onSuccess={fetchDocuments} isAdmin={false}>
          <Button className="shadow-lg shadow-primary/20">
            <UploadCloud className="mr-2 h-4 w-4" /> Upload Dokumen
          </Button>
        </DocumentUploadForm>
      </div>

      <Card className="border-border/60 shadow-sm">
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari dokumen..."
                  className="pl-9 h-10 bg-muted/30 border-transparent focus:bg-background focus:border-primary/50"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button type="submit" variant="secondary" className="h-10">
                Cari
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-10 border-dashed"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </div>

            {showFilters && (
              <div className="grid gap-4 md:grid-cols-2 pt-4 border-t animate-in slide-in-from-top-2">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase text-muted-foreground">
                    Dari Tanggal
                  </label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase text-muted-foreground">
                    Sampai Tanggal
                  </label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
                <div className="md:col-span-2 flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleClearFilters}
                    className="text-destructive hover:text-destructive"
                  >
                    <X className="mr-2 h-4 w-4" /> Reset
                  </Button>
                  <Button type="submit" size="sm">
                    Terapkan
                  </Button>
                </div>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {loading ? (
        <SkeletonTable rows={5} columns={5} />
      ) : (
        <DocumentTable
          documents={documents}
          onView={setPreviewDoc}
          onEdit={setEditDoc}
          onDelete={(doc) => setDeleteDoc({ id: doc.id, subject: doc.subject })}
        />
      )}

      {/* Pagination Simple */}
      {totalPages > 1 && (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium">Halaman {currentPage}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Dialog Edit */}
      {editDoc && (
        <DocumentEditDialog
          document={editDoc}
          isOpen={!!editDoc}
          onClose={() => setEditDoc(null)}
          onSuccess={() => {
            setEditDoc(null);
            fetchDocuments();
          }}
          isAdmin={false}
        />
      )}

      {/* Dialog Delete */}
      {deleteDoc && (
        <DeleteDocumentDialog
          document={deleteDoc}
          isOpen={!!deleteDoc}
          onClose={() => setDeleteDoc(null)}
          onSuccess={() => {
            setDeleteDoc(null);
            fetchDocuments();
          }}
          variant="staff"
        />
      )}

      {previewDoc && (
        <DocumentPreviewDialog
          isOpen={!!previewDoc}
          onClose={() => setPreviewDoc(null)}
          document={previewDoc}
        />
      )}
    </div>
  );
}
