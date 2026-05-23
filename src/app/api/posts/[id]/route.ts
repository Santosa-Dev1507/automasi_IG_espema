import { NextRequest, NextResponse } from "next/server";
import { checkAuth } from "@/lib/auth";
import { sql } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await checkAuth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const result = await sql`SELECT * FROM posts WHERE id = ${id}`;

  if (result.rows.length === 0) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  return NextResponse.json(result.rows[0]);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await checkAuth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { caption, hashtags, mediaUrl, mediaType, location, status, scheduledAt } = body;

  const result = await sql`
    UPDATE posts SET
      caption = COALESCE(${caption}, caption),
      hashtags = COALESCE(${hashtags}, hashtags),
      media_url = COALESCE(${mediaUrl}, media_url),
      media_type = COALESCE(${mediaType}, media_type),
      location = COALESCE(${location}, location),
      status = COALESCE(${status}, status),
      scheduled_at = COALESCE(${scheduledAt}, scheduled_at),
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `;

  if (result.rows.length === 0) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  return NextResponse.json(result.rows[0]);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await checkAuth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await sql`DELETE FROM posts WHERE id = ${id}`;

  return NextResponse.json({ success: true });
}
