import { NextResponse } from "next/server";
import { checkAuth } from "@/lib/auth";

// GET /api/instagram/test — Test Instagram connection & get account info
export async function GET() {
  const session = await checkAuth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const token = process.env.INSTAGRAM_ACCESS_TOKEN;

  if (!token) {
    return NextResponse.json(
      { error: "INSTAGRAM_ACCESS_TOKEN belum diisi di env" },
      { status: 400 }
    );
  }

  try {
    const isIGAA = token.startsWith("IGAA");
    const apiBase = isIGAA
      ? "https://graph.instagram.com/v21.0"
      : "https://graph.facebook.com/v21.0";

    const fields = isIGAA
      ? "id,username,account_type,media_count"
      : "username,name,followers_count,media_count";

    const path = isIGAA ? "me" : process.env.INSTAGRAM_USER_ID || "me";

    const res = await fetch(
      `${apiBase}/${path}?fields=${fields}&access_token=${token}`
    );
    const data = await res.json();

    if (data.error) {
      return NextResponse.json(
        { error: data.error.message, code: data.error.code },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      ...data,
      message: `Berhasil terhubung ke @${data.username}`,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Connection failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
