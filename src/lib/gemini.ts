interface GenerateCaptionParams {
  description: string;
  category: string;
  tone: string;
  variants?: number;
}

interface CaptionResult {
  caption: string;
  hashtags: string[];
}

const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

export async function generateCaption(
  params: GenerateCaptionParams
): Promise<CaptionResult[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Gemini API key belum dikonfigurasi");

  const { description, category, tone, variants = 2 } = params;

  const prompt = `Kamu adalah admin media sosial Instagram untuk SMPN 5 Klaten, sekolah menengah pertama negeri di Klaten, Jawa Tengah. Tugasmu membuat caption Instagram yang sopan, positif, dan membanggakan sekolah. Selalu sertakan CTA yang relevan (like, share, komen, tag teman).

Buat ${variants} variasi caption Instagram untuk konten berikut:
Kategori: ${category}
Gaya bahasa: ${tone}
Deskripsi: ${description}

PENTING: Balas HANYA dengan JSON array murni, tanpa teks lain, tanpa markdown, tanpa backtick.
Format: [{"caption":"teks caption lengkap dengan emoji","hashtags":["#smpn5klaten","#tag2"]}]
Setiap variasi harus punya minimal 8 hashtag relevan.`;

  // Use gemini-2.5-flash (free tier compatible, most stable)
  const model = "gemini-2.5-flash";
  const url = `${GEMINI_API_BASE}/${model}:generateContent?key=${apiKey}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.85,
        maxOutputTokens: 2000,
        responseMimeType: "application/json",
      },
    }),
  });

  const data = await res.json();

  if (data.error) {
    throw new Error(data.error.message || "Gemini API error");
  }

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
  const clean = text.replace(/```json|```/g, "").trim();

  try {
    const parsed: CaptionResult[] = JSON.parse(clean);
    return parsed;
  } catch {
    throw new Error("Gagal parse response AI. Coba lagi.");
  }
}
