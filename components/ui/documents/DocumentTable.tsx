"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  FileText,
  Download,
  Trash,
  Eye,
  Edit,
  Image as ImageIcon,
  File,
} from "lucide-react";
import { DocumentStaff } from "@/types";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { toast } from "sonner";

interface DocumentTableProps {
  documents: DocumentStaff[];
  isAdmin?: boolean;
  onView: (doc: DocumentStaff) => void;
  onEdit?: (doc: DocumentStaff) => void;
  onDelete?: (doc: DocumentStaff) => void;
}

export function DocumentTable({
  documents,
  isAdmin = false,
  onView,
  onEdit,
  onDelete,
}: DocumentTableProps) {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const handleDownload = async (doc: DocumentStaff) => {
    try {
      if (doc.file_url) {
        setDownloadingId(doc.id);
        await new Promise((resolve) => setTimeout(resolve, 500));
        window.open(doc.file_url, "_blank");
        toast.success("Membuka file...");
      } else {
        toast.error("URL file tidak valid");
      }
    } catch (error) {
      console.error(error);
      toast.error("Gagal mengunduh file");
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="rounded-2xl border border-border/50 bg-card shadow-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/40">
          <TableRow className="hover:bg-transparent border-b border-border/50">
            <TableHead className="w-12.5 pl-6"></TableHead>
            <TableHead className="w-87.5 font-semibold">
              Detail Dokumen
            </TableHead>
            <TableHead className="font-semibold">
              {isAdmin ? "Pemilik" : "Tipe"}
            </TableHead>
            <TableHead className="font-semibold">Tanggal</TableHead>
            <TableHead className="text-right pr-6 font-semibold">
              Aksi
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="h-24 text-center text-muted-foreground"
              >
                Tidak ada dokumen yang ditemukan.
              </TableCell>
            </TableRow>
          ) : (
            documents.map((doc) => (
              <TableRow
                key={doc.id}
                className="group hover:bg-muted/30 transition-colors border-b border-border/40 last:border-0 cursor-default"
              >
                {/* Icon Column */}
                <TableCell className="pl-6 py-4 align-top">
                  <div
                    className={`p-2 rounded-lg flex items-center justify-center w-10 h-10 ${
                      doc.resource_type === "image"
                        ? "bg-purple-50 text-purple-600"
                        : "bg-blue-50 text-blue-600"
                    }`}
                  >
                    {doc.resource_type === "image" ? (
                      <ImageIcon className="h-5 w-5" />
                    ) : (
                      <FileText className="h-5 w-5" />
                    )}
                  </div>
                </TableCell>

                {/* Detail Column */}
                <TableCell className="align-top py-4">
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold text-foreground text-sm leading-snug group-hover:text-primary transition-colors">
                      {doc.subject}
                    </span>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span className="bg-muted px-1.5 py-0.5 rounded truncate max-w-50">
                        {doc.file_name || "Untitled"}
                      </span>
                    </div>
                  </div>
                </TableCell>

                {/* Owner/Type Column */}
                <TableCell className="align-top py-4">
                  {isAdmin ? (
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-foreground">
                        {doc.owner_name || doc.user?.name || "-"}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        @{doc.user?.username || "user"}
                      </span>
                    </div>
                  ) : (
                    <Badge variant="outline" className="capitalize">
                      {doc.resource_type || "file"}
                    </Badge>
                  )}
                </TableCell>

                {/* Date Column */}
                <TableCell className="align-top py-4 text-sm text-muted-foreground">
                  {formatDate(doc.created_at)}
                </TableCell>

                {/* Action Column */}
                <TableCell className="text-right pr-6 align-top py-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted"
                      >
                        <span className="sr-only">Menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-48 rounded-xl shadow-lg border-border/60 p-1"
                    >
                      <DropdownMenuLabel className="text-xs font-normal text-muted-foreground px-2 py-1.5">
                        Aksi Dokumen
                      </DropdownMenuLabel>

                      <DropdownMenuItem
                        onClick={() => onView(doc)}
                        className="gap-2 cursor-pointer rounded-lg text-sm font-medium"
                      >
                        <Eye className="h-4 w-4" /> Lihat Detail
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={() => handleDownload(doc)}
                        disabled={downloadingId === doc.id}
                        className="gap-2 cursor-pointer rounded-lg text-sm font-medium"
                      >
                        <Download className="h-4 w-4" />
                        {downloadingId === doc.id
                          ? "Memproses..."
                          : "Unduh File"}
                      </DropdownMenuItem>

                      {(onEdit || onDelete) && (
                        <div className="h-px bg-border/50 my-1" />
                      )}

                      {onEdit && (
                        <DropdownMenuItem
                          onClick={() => onEdit(doc)}
                          className="gap-2 cursor-pointer rounded-lg text-sm font-medium"
                        >
                          <Edit className="h-4 w-4" /> Edit
                        </DropdownMenuItem>
                      )}

                      {onDelete && (
                        <DropdownMenuItem
                          onClick={() => onDelete(doc)}
                          className="gap-2 cursor-pointer rounded-lg text-sm font-medium text-destructive focus:text-destructive focus:bg-destructive/10"
                        >
                          <Trash className="h-4 w-4" /> Hapus
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
