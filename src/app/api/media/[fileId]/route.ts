import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/media/:fileId
 * Proxy untuk Google Drive file supaya bisa dipakai Instagram API.
 *
 * Instagram Graph API butuh URL gambar/video yang:
 * 1. Public (no auth)
 * 2. Direct file (Content-Type: image/* atau video/*)
 * 3. HTTPS
 *
 * Endpoint ini menjembatani Google Drive (yang serve HTML wrapper) menjadi raw bytes.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  const { fileId } = await params;

  if (!fileId) {
    return NextResponse.json({ error: "Missing fileId" }, { status: 400 });
  }

  // Strip query params if any
  const cleanFileId = fileId.split("?")[0].split("&")[0];

  // Try multiple Google Drive endpoints to get raw file content
  const urlsToTry = [
    `https://drive.usercontent.google.com/download?id=${cleanFileId}&export=download&authuser=0`,
    `https://drive.google.com/uc?export=download&id=${cleanFileId}`,
    `https://lh3.googleusercontent.com/d/${cleanFileId}=s2048`,
  ];

  for (const url of urlsToTry) {
    try {
      const res = await fetch(url, {
        redirect: "follow",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      });

      if (!res.ok) continue;

      const contentType = res.headers.get("content-type") || "";

      // Skip if returned HTML (means we got the interstitial page, not the file)
      if (contentType.includes("text/html")) continue;

      // Stream the file back with correct headers
      const buffer = await res.arrayBuffer();

      return new NextResponse(buffer, {
        status: 200,
        headers: {
          "Content-Type": contentType || "application/octet-stream",
          "Content-Length": String(buffer.byteLength),
          "Cache-Control": "public, max-age=3600",
        },
      });
    } catch {
      continue;
    }
  }

  return NextResponse.json(
    { error: "Tidak bisa mengakses file. Pastikan file di-share publik." },
    { status: 404 }
  );
}
