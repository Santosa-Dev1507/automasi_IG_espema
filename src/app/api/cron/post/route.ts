import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { postToInstagram } from "@/lib/instagram";

// GET /api/cron/post — Called by Vercel Cron to publish scheduled posts
// Configure in vercel.json: { "crons": [{ "path": "/api/cron/post", "schedule": "*/5 * * * *" }] }
export async function GET(req: NextRequest) {
  // Verify cron secret (Vercel sends this header)
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Find posts that are scheduled and due
    const result = await sql`
      SELECT * FROM posts 
      WHERE status = 'scheduled' 
        AND scheduled_at <= NOW()
      ORDER BY scheduled_at ASC
      LIMIT 5
    `;

    const results = [];

    for (const post of result.rows) {
      try {
        const fullCaption = post.hashtags?.length
          ? `${post.caption}\n\n${post.hashtags.join(" ")}`
          : post.caption;

        const igPostId = await postToInstagram({
          imageUrl: post.media_url,
          caption: fullCaption,
          mediaType: post.media_type === "REELS" ? "VIDEO" : "IMAGE",
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
