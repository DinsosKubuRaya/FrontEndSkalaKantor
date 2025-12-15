import {
  FileText,
  FileImage,
  FileSpreadsheet,
  Presentation,
  File,
} from "lucide-react";

interface FileIconProps {
  fileName?: string;
  resourceType?: string;
  className?: string;
}

export function getFileExtension(fileName?: string): string {
  if (!fileName) return "";
  const parts = fileName.split(".");
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "";
}

export function getFileType(fileName?: string, resourceType?: string): string {
  if (resourceType === "image") return "image";

  const ext = getFileExtension(fileName);
  
  // Images
  if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext)) {
    return "image";
  }
  
  // PDFs
  if (ext === "pdf") return "pdf";
  
  // Word documents
  if (["doc", "docx"].includes(ext)) return "word";
  
  // Excel spreadsheets
  if (["xls", "xlsx", "csv"].includes(ext)) return "excel";
  
  // PowerPoint presentations
  if (["ppt", "pptx"].includes(ext)) return "powerpoint";
  
  return "file";
}

export function FileIcon({
  fileName,
  resourceType,
  className = "h-5 w-5",
}: FileIconProps) {
  const fileType = getFileType(fileName, resourceType);

  switch (fileType) {
    case "image":
      return <FileImage className={`${className} text-green-600`} />;
    case "pdf":
      return <FileText className={`${className} text-red-600`} />;
    case "word":
      return <FileText className={`${className} text-blue-600`} />;
    case "excel":
      return <FileSpreadsheet className={`${className} text-green-700`} />;
    case "powerpoint":
      return <Presentation className={`${className} text-orange-600`} />;
    default:
      return <File className={`${className} text-gray-600`} />;
  }
}
