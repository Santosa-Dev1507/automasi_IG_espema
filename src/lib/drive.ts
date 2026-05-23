/**
 * Google Drive integration via shared folder (public link).
 * No OAuth needed — just uses the Google Drive API with API key
 * to list files from a publicly shared folder.
 */

const DRIVE_API_BASE = "https://www.googleapis.com/drive/v3";

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size: string;
  thumbnailLink?: string;
  webContentLink?: string;
  createdTime: string;
}

export async function listDriveFiles(folderId?: string): Promise<DriveFile[]> {
  const folder = folderId || process.env.GOOGLE_DRIVE_FOLDER_ID;
  const apiKey = process.env.GEMINI_API_KEY; // Reuse Gemini key (same GCP project)

  if (!folder) {
    throw new Error("Google Drive folder ID not configured");
  }

  const query = `'${folder}' in parents and trashed = false and (mimeType contains 'image/' or mimeType contains 'video/')`;

  const params = new URLSearchParams({
    q: query,
    key: apiKey || "",
    fields: "files(id,name,mimeType,size,thumbnailLink,webContentLink,createdTime)",
    orderBy: "createdTime desc",
    pageSize: "50",
  });

  const res = await fetch(`${DRIVE_API_BASE}/files?${params}`);
  const data = await res.json();

  if (data.error) {
    throw new Error(data.error.message);
  }

  return data.files || [];
}

export function getDriveDirectLink(fileId: string): string {
  return `https://drive.google.com/uc?export=download&id=${fileId}`;
}

export function getDriveImageUrl(fileId: string): string {
  // This URL works for images that are publicly shared
  return `https://lh3.googleusercontent.com/d/${fileId}`;
}

export function formatFileSize(bytes: string | number): string {
  const size = typeof bytes === "string" ? parseInt(bytes) : bytes;
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}
