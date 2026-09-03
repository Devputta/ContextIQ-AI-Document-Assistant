export type DocumentStatus = "Uploading" | "Uploaded" | "Processing" | "Ready" | "Failed";

export type DocumentRecord = {
  id: string;
  name: string;
  fileType: "PDF" | "Markdown";
  mimeType: string;
  size: number;
  uploadedAt: string;
  status: DocumentStatus;
  error?: string | null;
};

export const ALLOWED_TYPES = [
  "application/pdf",
  "text/markdown",
  "text/x-markdown",
] as const;

export const ALLOWED_EXTENSIONS = [".pdf", ".md", ".markdown"];

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit++;
  }
  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[unit]}`;
}

export function getFileType(file: File): DocumentRecord["fileType"] | null {
  const lower = file.name.toLowerCase();
  if (lower.endsWith(".pdf")) return "PDF";
  if (lower.endsWith(".md") || lower.endsWith(".markdown")) return "Markdown";
  return null;
}
