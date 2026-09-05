export type DocumentStatus='UPLOADING'|'UPLOADED'|'PROCESSING'|'READY'|'FAILED'|'Uploading'|'Uploaded'|'Processing'|'Ready'|'Failed';
export type DocumentRecord={id:string;name:string;fileType:'PDF'|'Markdown';mimeType?:string;size:number;uploadedAt:string;status:DocumentStatus;error?:string|null;chatAvailable?:boolean};
export const ALLOWED_EXTENSIONS=['.pdf','.md','.markdown'];
export function formatBytes(bytes:number){if(bytes<1024)return `${bytes} B`;const units=['KB','MB','GB'];let v=bytes/1024,u=0;while(v>=1024&&u<units.length-1){v/=1024;u++}return `${v.toFixed(v>=10?0:1)} ${units[u]}`}
export function getFileType(file:File){const n=file.name.toLowerCase();return n.endsWith('.pdf')?'PDF':n.endsWith('.md')||n.endsWith('.markdown')?'Markdown':null}
