"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Download, ExternalLink } from "lucide-react";
import { getFileType } from "@/components/ui/file-icon";
import Image from "next/image";

interface DocumentPreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  document: {
    subject: string;
    file_url: string;
    file_name?: string;
    resource_type?: string;
  };
}

export function DocumentPreviewDialog({
  isOpen,
  onClose,
  document,
}: DocumentPreviewDialogProps) {
  const fileType = getFileType(document.file_name, document.resource_type);
  const [isLoading, setIsLoading] = useState(true);

  const handleDownload = () => {
    window.open(document.file_url, "_blank");
  };

  const handleOpenNewTab = () => {
    window.open(document.file_url, "_blank");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh]">
        <DialogHeader>
          <DialogTitle>{document.subject}</DialogTitle>
          <DialogDescription>
            {document.file_name || "Preview dokumen"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2 mb-4">
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button variant="outline" size="sm" onClick={handleOpenNewTab}>
            <ExternalLink className="h-4 w-4 mr-2" />
            Buka di Tab Baru
          </Button>
        </div>

        <div className="flex-1 overflow-hidden border rounded-lg bg-muted/30">
          {fileType === "image" ? (
            <div className="relative flex items-center justify-center h-full p-4">
              <Image
                src={document.file_url}
                alt={document.subject}
                fill
                className="object-contain"
                onLoad={() => setIsLoading(false)}
              />
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              )}
            </div>
          ) : fileType === "pdf" ? (
            <iframe
              src={`${document.file_url}#toolbar=0`}
              className="w-full h-full"
              title={document.subject}
              onLoad={() => setIsLoading(false)}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <p className="text-muted-foreground mb-4">
                Preview tidak tersedia untuk jenis file ini.
              </p>
              <Button onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download File
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
