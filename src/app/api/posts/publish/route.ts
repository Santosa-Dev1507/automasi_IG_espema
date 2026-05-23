import { NextRequest, NextResponse } from "next/server";
import { checkAuth } from "@/lib/auth";
import { sql } from "@/lib/db";
import { postToInstagram } from "@/lib/instagram";
import { extractDriveFileId } from "@/lib/drive";

/**
 * Convert a Google Drive URL to our public proxy URL,
 * so Instagram API can fetch raw bytes (with correct Content-Type).
 */
function resolveMediaUrl(rawUrl: string, origin: string): string {
  if (!rawUrl) return rawUrl;

  // Already an external direct URL (not Drive)? Use as-is.
  const isDriveUrl =
    rawUrl.includes("drive.google.com") ||
    rawUrl.includes("googleusercontent.com");

  if (!isDriveUrl) return rawUrl;

  const fileId = extractDriveFileId(rawUrl);
  if (!fileId) return rawUrl;

  return `${origin}/api/media/${fileId}`;
}

// POST /api/posts/publish — Publish a post to Instagram immediately
export async function POST(req: NextRequest) {
  const session = await checkAuth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { postId } = await req.json();

  const result = await sql`SELECT * FROM posts WHERE id = ${postId}`;
  if (result.rows.length === 0) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const post = result.rows[0];

  if (!post.media_url) {
    return NextResponse.json({ error: "Post has no media URL" }, { status: 400 });
  }

  try {
    const fullCaption = post.hashtags?.length
      ? `${post.caption}\n\n${post.hashtags.join(" ")}`
      : post.caption;

    // Map media_type from DB to Instagram API media type
    let mediaType: "IMAGE" | "VIDEO" | "REELS" | "STORIES" = "IMAGE";
    if (post.media_type === "REELS") mediaType = "REELS";
    else if (post.media_type === "STORIES") mediaType = "STORIES";

    // Convert Drive URL → proxy URL accessible by Instagram API
    const origin = req.nextUrl.origin;
    const mediaUrl = resolveMediaUrl(post.media_url, origin);

    const igPostId = await postToInstagram({
      imageUrl: mediaUrl,
      caption: fullCaption,
      mediaType,
    });

    await sql`
      UPDATE posts SET 
        status = 'posted', 
        posted_at = NOW(), 
        ig_post_id = ${igPostId},
        updated_at = NOW()
      WHERE id = ${postId}
    `;

    return NextResponse.json({ success: true, igPostId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    await sql`
      UPDATE posts SET 
        status = 'failed', 
        error_message = ${message},
        updated_at = NOW()
      WHERE id = ${postId}
    `;

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
