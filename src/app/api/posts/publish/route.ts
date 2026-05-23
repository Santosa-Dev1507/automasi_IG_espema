import { NextRequest, NextResponse } from "next/server";
import { checkAuth } from "@/lib/auth";
import { sql } from "@/lib/db";
import { postToInstagram } from "@/lib/instagram";

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

    const igPostId = await postToInstagram({
      imageUrl: post.media_url,
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
