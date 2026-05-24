"use client";

import { useState } from "react";

interface CaptionResult {
  caption: string;
  hashtags: string[];
}

export default function AICaptionPage() {
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Kegiatan & Upacara");
  const [tone, setTone] = useState("Formal & Informatif");
  const [variants, setVariants] = useState(2);
  const [results, setResults] = useState<CaptionResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function generate() {
    if (!description.trim()) return;
    setLoading(true);
    setError("");
    setResults([]);

    try {
      const res = await fetch("/api/ai/caption", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description, category, tone, variants }),
      });

      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setResults(data);
      }
    } catch {
      setError("Gagal generate caption. Cek koneksi atau API key.");
    }

    setLoading(false);
  }

  function copyCaption(result: CaptionResult) {
    const text = `${result.caption}\n\n${result.hashtags.join(" ")}`;
    navigator.clipboard.writeText(text);
    alert("Caption disalin ke clipboard!");
  }

  const categories = [
    "Kegiatan & Upacara",
    "Prestasi Siswa",
    "Ekstrakurikuler",
    "OSIS & Organisasi",
    "Pembelajaran & Akademik",
    "Pengumuman Penting",
    "Karya Siswa",
    "Event & Lomba",
    "Wisuda & Perpisahan",
    "Profil Guru & Staf",
  ];

  const tones = [
    "Formal & Informatif",
    "Bangga & Semangat",
    "Santai tapi Sopan",
    "Inspiratif & Motivatif",
    "Ceria & Ramah",
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Form */}
      <div>
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-indigo-200 p-5 mb-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-green-500 rounded-xl flex items-center justify-center text-lg">
              🤖
            </div>
            <div>
              <div className="text-sm font-black text-blue-800">AI Caption Generator</div>
              <div className="text-[11px] text-gray-500 font-semibold">
                Powered by Google Gemini · Khusus Konten Sekolah
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                Deskripsi Kegiatan / Konten
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Contoh: Upacara bendera hari Senin, dihadiri seluruh siswa dan guru..."
                rows={4}
                className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-y"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                Kategori
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                {categories.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                  Gaya Bahasa
                </label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  {tones.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                  Jumlah Variasi
                </label>
                <select
                  value={variants}
                  onChange={(e) => setVariants(Number(e.target.value))}
                  className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value={1}>1 variasi</option>
                  <option value={2}>2 variasi</option>
                  <option value={3}>3 variasi</option>
                </select>
              </div>
            </div>

            <button
              onClick={generate}
              disabled={loading || !description.trim()}
              className="w-full py-3 bg-blue-800 text-white font-bold rounded-lg shadow hover:bg-blue-900 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating...
                </span>
              ) : (
                "🚀 Generate Caption"
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      <div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="text-sm font-black text-gray-900 mb-4">✨ Hasil Caption AI</h3>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm font-bold text-red-700 mb-4">
              ❌ {error}
            </div>
          )}

          {results.length === 0 && !loading && !error && (
            <div className="text-center py-12 text-gray-400">
              <div className="text-4xl mb-3">🤖</div>
              <p className="font-semibold">
                Isi form di kiri lalu klik
                <br />&quot;Generate Caption&quot;
              </p>
            </div>
          )}

          {loading && (
            <div className="text-center py-12">
              <div className="w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-gray-500 font-semibold">
                Gemini AI sedang menulis caption...
              </p>
            </div>
          )}

          {results.map((result, i) => (
            <div
              key={i}
              className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-3"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold text-blue-700 font-mono uppercase">
                  Variasi {i + 1}
                </span>
                <button
                  onClick={() => copyCaption(result)}
                  className="px-3 py-1 bg-blue-800 text-white text-[11px] font-bold rounded-md hover:bg-blue-900 transition"
                >
                  📋 Copy
                </button>
              </div>
              <p className="text-sm text-gray-800 font-semibold leading-relaxed border-l-3 border-blue-400 pl-3 mb-3">
                {result.caption}
              </p>
              <div className="text-xs text-blue-600 font-mono leading-relaxed">
                {result.hashtags.join(" ")}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
