import { NextRequest, NextResponse } from "next/server";
import { checkAuth } from "@/lib/auth";
import { sql } from "@/lib/db";

// GET /api/posts — List all posts
export async function GET(req: NextRequest) {
  const session = await checkAuth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const search = searchParams.get("q");

  let query;
  if (status && status !== "semua") {
    if (search) {
      query = await sql`
        SELECT * FROM posts 
        WHERE status = ${status} AND caption ILIKE ${"%" + search + "%"}
        ORDER BY created_at DESC
      `;
    } else {
      query = await sql`
        SELECT * FROM posts WHERE status = ${status}
        ORDER BY created_at DESC
      `;
    }
  } else {
    if (search) {
      query = await sql`
        SELECT * FROM posts WHERE caption ILIKE ${"%" + search + "%"}
        ORDER BY created_at DESC
      `;
    } else {
      query = await sql`SELECT * FROM posts ORDER BY created_at DESC`;
    }
  }

  return NextResponse.json(query.rows);
}

// POST /api/posts — Create a new post
export async function POST(req: NextRequest) {
  const session = await checkAuth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { caption, hashtags, mediaUrl, mediaType, location, status, scheduledAt } = body;

  const userId = (session.user as { id?: string }).id;

  const result = await sql`
    INSERT INTO posts (user_id, caption, hashtags, media_url, media_type, location, status, scheduled_at)
    VALUES (${userId}, ${caption}, ${hashtags}, ${mediaUrl}, ${mediaType || "FEED"}, ${location}, ${status || "draft"}, ${scheduledAt || null})
    RETURNING *
  `;

  return NextResponse.json(result.rows[0], { status: 201 });
}
