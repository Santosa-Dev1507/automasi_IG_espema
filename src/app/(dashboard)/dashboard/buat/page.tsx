"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function BuatPostPage() {
  const router = useRouter();
  const [caption, setCaption] = useState("");
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [hashInput, setHashInput] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [driveInput, setDriveInput] = useState("");
  const [mediaType, setMediaType] = useState("FEED");
  const [location, setLocation] = useState("Klaten, Jawa Tengah");
  const [scheduleTime, setScheduleTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  function handleDriveUrl(input: string) {
    setDriveInput(input);
    let fileId = input.trim();

    // Format: https://drive.google.com/file/d/FILE_ID/view
    const match1 = fileId.match(/\/file\/d\/([^/]+)/);
    if (match1) fileId = match1[1];

    // Format: https://drive.google.com/open?id=FILE_ID
    const match2 = fileId.match(/[?&]id=([^&]+)/);
    if (match2) fileId = match2[1];

    // If just an ID (no slashes, no protocol)
    if (fileId && !fileId.includes("/") && !fileId.includes("http")) {
      setMediaUrl(`https://lh3.googleusercontent.com/d/${fileId}`);
    } else if (match1) {
      setMediaUrl(`https://lh3.googleusercontent.com/d/${match1[1]}`);
    } else if (match2) {
      setMediaUrl(`https://lh3.googleusercontent.com/d/${match2[1]}`);
    } else {
      setMediaUrl("");
    }
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
    const schoolTags = ["smpn5klaten", "klaten", "smpklaten", "pendidikanindonesia", "sekolahklaten"];
    const newTags = schoolTags.filter((t) => !hashtags.includes(t));
    setHashtags([...hashtags, ...newTags]);
  }

  async function handleSubmit(status: "draft" | "scheduled" | "publish") {
    setLoading(true);
    setMessage("");

    try {
      const hashtagsFormatted = hashtags.map((h) => `#${h}`);

      if (status === "publish") {
        const res = await fetch("/api/posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            caption,
            hashtags: hashtagsFormatted,
            mediaUrl,
            mediaType,
            location,
            status: "scheduled",
          }),
        });
        const post = await res.json();

        await fetch("/api/posts/publish", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ postId: post.id }),
        });

        setMessage("✅ Berhasil diposting ke Instagram!");
      } else {
        await fetch("/api/posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            caption,
            hashtags: hashtagsFormatted,
            mediaUrl,
            mediaType,
            location,
            status,
            scheduledAt: status === "scheduled" ? scheduleTime : null,
          }),
        });

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
        {/* Media */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="text-sm font-black text-gray-900 mb-3">📁 Media dari Google Drive</h3>
          <div className="mb-3">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
              Link / ID File Google Drive
            </label>
            <input
              type="text"
              value={driveInput}
              onChange={(e) => handleDriveUrl(e.target.value)}
              placeholder="Paste link Google Drive atau File ID..."
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
            />
            <p className="text-[11px] text-gray-400 mt-1.5">
              Format yang diterima:
            </p>
            <ul className="text-[11px] text-gray-400 list-disc ml-4 mt-0.5 space-y-0.5">
              <li>https://drive.google.com/file/d/<strong>FILE_ID</strong>/view</li>
              <li>https://drive.google.com/open?id=<strong>FILE_ID</strong></li>
              <li>Langsung paste <strong>FILE_ID</strong> saja</li>
            </ul>
          </div>
          {mediaUrl && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-xs font-bold text-blue-700 mb-1">✅ Media URL terdeteksi:</div>
              <div className="text-[11px] text-blue-600 font-mono break-all">{mediaUrl}</div>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                Tipe Konten
              </label>
              <select
                value={mediaType}
                onChange={(e) => setMediaType(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="FEED">📸 Feed</option>
                <option value="REELS">🎬 Reels</option>
                <option value="CAROUSEL">🗂️ Carousel</option>
                <option value="STORIES">⭕ Stories</option>
              </select>
            </div>
            <div>
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
            <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm font-bold text-blue-800">
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
              disabled={loading || !mediaUrl}
              className="w-full py-2.5 bg-amber-500 text-white rounded-lg text-sm font-bold hover:bg-amber-600 transition disabled:opacity-50"
            >
              ⚡ Post Sekarang
            </button>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 sticky top-20">
          <h3 className="text-sm font-black text-gray-900 mb-3">👁️ Preview Instagram</h3>
          <div className="bg-black rounded-2xl overflow-hidden max-w-[300px] mx-auto border-4 border-gray-900">
            <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-900">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 flex items-center justify-center text-xs font-black text-white">
                5
              </div>
              <div>
                <div className="text-[11px] font-bold text-white">smpn5klaten</div>
                <div className="text-[9px] text-gray-500">{location}</div>
              </div>
            </div>
            <div className="aspect-square bg-gray-800 flex items-center justify-center text-5xl overflow-hidden">
              {mediaUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={mediaUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              ) : (
                "📷"
              )}
            </div>
            <div className="p-3 bg-black">
              <div className="flex gap-3 text-lg mb-2">❤️ 💬 ✈️</div>
              <div className="text-[11px] text-gray-300 leading-relaxed">
                <span className="font-bold text-white">smpn5klaten</span>{" "}
                {caption || "Caption akan tampil di sini..."}
              </div>
              {hashtags.length > 0 && (
                <div className="text-[11px] text-blue-400 mt-1 font-mono">
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
