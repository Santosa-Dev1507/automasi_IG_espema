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

/**
 * Get a URL that serves the raw file bytes via our proxy.
 * Use this URL when sending to Instagram API (instead of the lh3.googleusercontent.com one).
 *
 * @param fileId - The Google Drive file ID
 * @param baseUrl - The deployment base URL (e.g. https://example.vercel.app). Required because IG fetches from public URL.
 */
export function getProxyMediaUrl(fileId: string, baseUrl: string): string {
  return `${baseUrl}/api/media/${fileId}`;
}

export function getDriveImageUrl(fileId: string): string {
  // For preview only — IG API can't reliably fetch from this URL.
  // Use getProxyMediaUrl() for actual posting.
  return `https://lh3.googleusercontent.com/d/${fileId}`;
}

/**
 * Extract file ID from various Google Drive URL formats or return as-is if it's already an ID.
 */
export function extractDriveFileId(input: string): string | null {
  const trimmed = input.trim();

  // Format: https://drive.google.com/file/d/FILE_ID/view
  const match1 = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (match1) return match1[1];

  // Format: https://drive.google.com/open?id=FILE_ID or any ?id=FILE_ID
  const match2 = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (match2) return match2[1];

  // Format: lh3.googleusercontent.com/d/FILE_ID
  const match3 = trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (match3) return match3[1];

  // Already a plain file ID
  if (/^[a-zA-Z0-9_-]+$/.test(trimmed)) return trimmed;

  return null;
}

export function formatFileSize(bytes: string | number): string {
  const size = typeof bytes === "string" ? parseInt(bytes) : bytes;
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}
