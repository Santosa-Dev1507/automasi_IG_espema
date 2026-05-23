import { NextRequest, NextResponse } from "next/server";
import { checkAuth } from "@/lib/auth";
import { generateCaption } from "@/lib/gemini";

// POST /api/ai/caption — Generate AI caption
export async function POST(req: NextRequest) {
  const session = await checkAuth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { description, category, tone, variants } = body;

  if (!description) {
    return NextResponse.json(
      { error: "Deskripsi kegiatan wajib diisi" },
      { status: 400 }
    );
  }

  try {
    const results = await generateCaption({
      description,
      category: category || "Kegiatan & Upacara",
      tone: tone || "Formal & Informatif",
      variants: variants || 2,
    });

    return NextResponse.json(results);
  } catch (error) {
    const message = error instanceof Error ? error.message : "AI generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
