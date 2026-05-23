import { NextResponse } from "next/server";
import { checkAuth } from "@/lib/auth";
import { listDriveFiles, formatFileSize } from "@/lib/drive";

// GET /api/drive — List files from Google Drive shared folder
export async function GET() {
  const session = await checkAuth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const files = await listDriveFiles();

    const formatted = files.map((f) => ({
      id: f.id,
      name: f.name,
      type: f.mimeType.startsWith("video/") ? "video" : "foto",
      mimeType: f.mimeType,
      size: formatFileSize(f.size),
      thumbnail: f.thumbnailLink,
      createdTime: f.createdTime,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to list files";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
