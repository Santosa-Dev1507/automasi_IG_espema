import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { postToInstagram } from "@/lib/instagram";
import { extractDriveFileId } from "@/lib/drive";

function resolveMediaUrl(rawUrl: string, origin: string): string {
  if (!rawUrl) return rawUrl;
  const isDriveUrl =
    rawUrl.includes("drive.google.com") ||
    rawUrl.includes("googleusercontent.com");
  if (!isDriveUrl) return rawUrl;

  const fileId = extractDriveFileId(rawUrl);
  if (!fileId) return rawUrl;

  return `${origin}/api/media/${fileId}`;
}

// GET /api/cron/post — Called by Vercel Cron to publish scheduled posts
export async function GET(req: NextRequest) {
  // Verify cron secret (Vercel sends this header)
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Find posts that are scheduled and due (no LIMIT — process all due posts)
    const result = await sql`
      SELECT * FROM posts 
      WHERE status = 'scheduled' 
        AND scheduled_at <= NOW()
      ORDER BY scheduled_at ASC
    `;

    const results = [];
    const origin = req.nextUrl.origin;

    for (const post of result.rows) {
      try {
        const fullCaption = post.hashtags?.length
          ? `${post.caption}\n\n${post.hashtags.join(" ")}`
          : post.caption;

        // Map media_type from DB to Instagram API media type
        let mediaType: "IMAGE" | "VIDEO" | "REELS" | "STORIES" = "IMAGE";
        if (post.media_type === "REELS") mediaType = "REELS";
        else if (post.media_type === "STORIES") mediaType = "STORIES";

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
          WHERE id = ${post.id}
        `;

        results.push({ id: post.id, status: "posted", igPostId });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";

        await sql`
          UPDATE posts SET 
            status = 'failed', 
            error_message = ${message},
            updated_at = NOW()
          WHERE id = ${post.id}
        `;

        results.push({ id: post.id, status: "failed", error: message });
      }
    }

    return NextResponse.json({
      processed: results.length,
      results,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Cron job failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
