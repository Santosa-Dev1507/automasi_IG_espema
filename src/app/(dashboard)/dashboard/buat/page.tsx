"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";

function extractDriveFileId(input: string): string | null {
  const trimmed = input.trim();
  const m1 = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (m1) return m1[1];
  const m2 = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (m2) return m2[1];
  const m3 = trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (m3) return m3[1];
  if (/^[a-zA-Z0-9_-]+$/.test(trimmed) && trimmed.length > 10) return trimmed;
  return null;
}

function buildMediaUrl(input: string): string {
  const fileId = extractDriveFileId(input);
  if (fileId) return `https://lh3.googleusercontent.com/d/${fileId}`;
  return input.trim();
}

export default function BuatPostPage() {
  const router = useRouter();
  const [caption, setCaption] = useState("");
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [hashInput, setHashInput] = useState("");
  // Single image input (used for FEED, REELS, STORIES)
  const [driveInput, setDriveInput] = useState("");
  // Carousel: array of inputs (used when mediaType === CAROUSEL)
  const [carouselInputs, setCarouselInputs] = useState<string[]>(["", ""]);
  const [mediaType, setMediaType] = useState("FEED");
  const [location, setLocation] = useState("Klaten, Jawa Tengah");
  const [scheduleTime, setScheduleTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Derived state
  const isCarousel = mediaType === "CAROUSEL";
  const singleMediaUrl = driveInput ? buildMediaUrl(driveInput) : "";
  const carouselUrls = carouselInputs
    .map((i) => (i.trim() ? buildMediaUrl(i) : ""))
    .filter(Boolean);
  const previewUrl = isCarousel ? carouselUrls[0] || "" : singleMediaUrl;

  function updateCarouselInput(index: number, value: string) {
    const next = [...carouselInputs];
    next[index] = value;
    setCarouselInputs(next);
  }

  function addCarouselSlot() {
    if (carouselInputs.length >= 10) return;
    setCarouselInputs([...carouselInputs, ""]);
  }

  function removeCarouselSlot(index: number) {
    if (carouselInputs.length <= 2) return;
    setCarouselInputs(carouselInputs.filter((_, i) => i !== index));
  }

  function addHashtag(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      const val = hashInput.trim().replace(/^#/, "");
      if (val && !hashtags.includes(val)) {
        setHashtags([...hashtags, val]);
      }
      setHashInput("");
    }
  }

  function removeHashtag(index: number) {
    setHashtags(hashtags.filter((_, i) => i !== index));
  }

  function addSchoolHashtags() {
    const schoolTags = ["espema_klaten", "smpn5klaten", "klaten", "smpklaten", "pendidikanindonesia", "sekolahklaten"];
    const newTags = schoolTags.filter((t) => !hashtags.includes(t));
    setHashtags([...hashtags, ...newTags]);
  }

  async function handleSubmit(status: "draft" | "scheduled" | "publish") {
    setLoading(true);
    setMessage("");

    const hashtagsFormatted = hashtags.map((h) => `#${h}`);

    // Validate carousel
    if (isCarousel) {
      if (carouselUrls.length < 2) {
        setMessage("❌ Carousel butuh minimal 2 foto");
        setLoading(false);
        return;
      }
    } else {
      if (status !== "draft" && !singleMediaUrl) {
        setMessage("❌ Link media belum diisi");
        setLoading(false);
        return;
      }
    }

    try {
      const payload = {
        caption,
        hashtags: hashtagsFormatted,
        mediaUrl: isCarousel ? carouselUrls[0] : singleMediaUrl,
        mediaUrls: isCarousel ? carouselUrls : null,
        mediaType,
        location,
        status: status === "publish" ? "scheduled" : status,
        scheduledAt: status === "scheduled" ? scheduleTime : null,
      };

      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const post = await res.json();

      if (!res.ok) {
        setMessage(`❌ ${post.error || "Gagal menyimpan"}`);
        setLoading(false);
        return;
      }

      if (status === "publish") {
        const pubRes = await fetch("/api/posts/publish", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ postId: post.id }),
        });
        const pubData = await pubRes.json();

        if (pubData.success) {
          setMessage("✅ Berhasil diposting ke Instagram!");
        } else {
          setMessage(`❌ Gagal post: ${pubData.error || "Unknown error"}`);
        }
      } else {
        setMessage(
          status === "scheduled"
            ? "📅 Post berhasil dijadwalkan!"
            : "💾 Draft disimpan!"
        );
      }

      setTimeout(() => router.push("/dashboard/jadwal"), 1500);
    } catch {
      setMessage("❌ Gagal menyimpan post");
    }

    setLoading(false);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Form */}
      <div className="space-y-4">
        {/* Tipe Konten — moved up so user picks it first */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="text-sm font-black text-gray-900 mb-3">📋 Tipe Konten</h3>
          <select
            value={mediaType}
            onChange={(e) => setMediaType(e.target.value)}
            className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="FEED">📸 Feed — 1 Foto</option>
            <option value="CAROUSEL">🗂️ Carousel — Banyak Foto (2-10)</option>
            <option value="REELS">🎬 Reels — Video Pendek</option>
            <option value="STORIES">⭕ Stories — 24 Jam</option>
          </select>
        </div>

        {/* Media — different UI based on type */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="text-sm font-black text-gray-900 mb-3">
            📁 {isCarousel ? "Foto-foto Carousel" : "Media dari Google Drive"}
          </h3>

          {isCarousel ? (
            <div>
              <p className="text-[11px] text-gray-500 font-semibold mb-3">
                Tambahkan link Google Drive untuk setiap foto. Minimal 2, maksimal 10.
              </p>
              <div className="space-y-2">
                {carouselInputs.map((input, i) => (
                  <div key={i} className="flex gap-2 items-start">
                    <span className="flex-shrink-0 w-7 h-9 flex items-center justify-center bg-blue-50 text-blue-700 text-xs font-bold rounded">
                      {i + 1}
                    </span>
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => updateCarouselInput(i, e.target.value)}
                      placeholder={`Link Google Drive untuk foto #${i + 1}...`}
                      className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                    {carouselInputs.length > 2 && (
                      <button
                        onClick={() => removeCarouselSlot(i)}
                        className="flex-shrink-0 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                        title="Hapus slot"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {carouselInputs.length < 10 && (
                <button
                  onClick={addCarouselSlot}
                  className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 border border-dashed border-gray-300 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50 hover:border-blue-400 hover:text-blue-700 transition"
                >
                  <Plus size={13} />
                  Tambah Foto ({carouselInputs.length}/10)
                </button>
              )}
              {carouselUrls.length >= 2 && (
                <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded-lg">
                  <div className="text-[11px] font-bold text-green-700">
                    ✅ {carouselUrls.length} foto siap untuk carousel
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div>
              <input
                type="text"
                value={driveInput}
                onChange={(e) => setDriveInput(e.target.value)}
                placeholder="Paste link Google Drive atau File ID..."
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              <p className="text-[11px] text-gray-400 mt-2">
                Format: <code className="bg-gray-100 px-1 rounded">drive.google.com/file/d/FILE_ID/view</code>
              </p>
              {singleMediaUrl && (
                <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded-lg">
                  <div className="text-[11px] font-bold text-green-700">
                    ✅ Media URL siap pakai
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Caption */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="text-sm font-black text-gray-900 mb-3">✏️ Caption & Hashtag</h3>
          <div className="mb-3">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
              Caption
            </label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Tulis caption untuk post Instagram..."
              rows={4}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-y"
            />
            <div className="text-right text-[11px] text-gray-400 font-mono mt-1">
              {caption.length}/2200
            </div>
          </div>

          <div className="mb-3">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
              Hashtag (tekan Enter untuk tambah)
            </label>
            <div className="flex flex-wrap gap-1.5 p-2.5 bg-gray-50 border border-gray-200 rounded-lg min-h-[40px]">
              {hashtags.map((tag, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 bg-blue-50 border border-blue-200 rounded-full px-2.5 py-0.5 text-xs font-bold text-blue-700 font-mono"
                >
                  #{tag}
                  <button
                    onClick={() => removeHashtag(i)}
                    className="text-gray-400 hover:text-red-500 text-[10px]"
                  >
                    ✕
                  </button>
                </span>
              ))}
              <input
                value={hashInput}
                onChange={(e) => setHashInput(e.target.value)}
                onKeyDown={addHashtag}
                placeholder="#tambahkan..."
                className="flex-1 min-w-[100px] bg-transparent border-none outline-none text-sm font-bold"
              />
            </div>
          </div>
          <button
            onClick={addSchoolHashtags}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50 transition"
          >
            💡 Tambah Hashtag Sekolah
          </button>
        </div>

        {/* Settings */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="text-sm font-black text-gray-900 mb-3">⚙️ Pengaturan</h3>
          <div className="mb-3">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
              Lokasi
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="mb-4">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
              📅 Jadwalkan Posting
            </label>
            <input
              type="datetime-local"
              value={scheduleTime}
              onChange={(e) => setScheduleTime(e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {message && (
            <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm font-bold text-blue-800 break-words">
              {message}
            </div>
          )}

          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleSubmit("draft")}
                disabled={loading}
                className="py-2.5 border border-gray-200 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
              >
                💾 Simpan Draft
              </button>
              <button
                onClick={() => handleSubmit("scheduled")}
                disabled={loading || !scheduleTime}
                className="py-2.5 bg-blue-800 text-white rounded-lg text-sm font-bold hover:bg-blue-900 transition disabled:opacity-50"
              >
                📅 Jadwalkan
              </button>
            </div>
            <button
              onClick={() => handleSubmit("publish")}
              disabled={loading}
              className="w-full py-2.5 bg-amber-500 text-white rounded-lg text-sm font-bold hover:bg-amber-600 transition disabled:opacity-50"
            >
              ⚡ Post Sekarang
            </button>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 lg:sticky lg:top-20">
          <h3 className="text-sm font-black text-gray-900 mb-3">👁️ Preview Instagram</h3>
          <div className="bg-black rounded-2xl overflow-hidden max-w-[300px] mx-auto border-4 border-gray-900">
            <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-900">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 flex items-center justify-center text-xs font-black text-white">
                E
              </div>
              <div>
                <div className="text-[11px] font-bold text-white">espema_klaten</div>
                <div className="text-[9px] text-gray-500">{location}</div>
              </div>
            </div>
            <div className="aspect-square bg-gray-800 flex items-center justify-center text-5xl overflow-hidden relative">
              {previewUrl ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                  {isCarousel && carouselUrls.length > 1 && (
                    <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded-full">
                      1/{carouselUrls.length}
                    </div>
                  )}
                </>
              ) : (
                "📷"
              )}
            </div>
            <div className="p-3 bg-black">
              <div className="flex gap-3 text-lg mb-2">❤️ 💬 ✈️</div>
              <div className="text-[11px] text-gray-300 leading-relaxed">
                <span className="font-bold text-white">espema_klaten</span>{" "}
                {caption || "Caption akan tampil di sini..."}
              </div>
              {hashtags.length > 0 && (
                <div className="text-[11px] text-blue-400 mt-1 font-mono break-words">
                  {hashtags.map((h) => `#${h}`).join(" ")}
                </div>
              )}
              <div className="text-[9px] text-gray-600 mt-2 font-mono">BARU SAJA</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
