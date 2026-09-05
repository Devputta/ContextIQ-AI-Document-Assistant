<<<<<<< HEAD
export type DocumentStatus='UPLOADING'|'UPLOADED'|'PROCESSING'|'READY'|'FAILED'|'Uploading'|'Uploaded'|'Processing'|'Ready'|'Failed';
export type DocumentRecord={id:string;name:string;fileType:'PDF'|'Markdown';mimeType?:string;size:number;uploadedAt:string;status:DocumentStatus;error?:string|null;chatAvailable?:boolean};
export const ALLOWED_EXTENSIONS=['.pdf','.md','.markdown'];
export function formatBytes(bytes:number){if(bytes<1024)return `${bytes} B`;const units=['KB','MB','GB'];let v=bytes/1024,u=0;while(v>=1024&&u<units.length-1){v/=1024;u++}return `${v.toFixed(v>=10?0:1)} ${units[u]}`}
export function getFileType(file:File){const n=file.name.toLowerCase();return n.endsWith('.pdf')?'PDF':n.endsWith('.md')||n.endsWith('.markdown')?'Markdown':null}
=======
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
>>>>>>> 96caef8b5731e0359bc665a7d85c03e5a003a67a
