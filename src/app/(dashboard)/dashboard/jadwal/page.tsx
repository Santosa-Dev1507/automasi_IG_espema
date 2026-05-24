"use client";

import { useCallback, useEffect, useState } from "react";
import { Trash2, Send, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";

interface Post {
  id: number;
  caption: string;
  media_type: string;
  status: string;
  scheduled_at: string;
  created_at: string;
  error_message?: string;
}

const statusConfig: Record<string, { label: string; class: string }> = {
  scheduled: { label: "🕐 Terjadwal", class: "bg-blue-50 text-blue-700 border-blue-200" },
  posted: { label: "✅ Terposting", class: "bg-green-50 text-green-700 border-green-200" },
  failed: { label: "❌ Gagal", class: "bg-red-50 text-red-700 border-red-200" },
  draft: { label: "📝 Draft", class: "bg-gray-50 text-gray-600 border-gray-200" },
};

function formatDate(dateStr: string): string {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    return d.toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

export default function JadwalPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [filter, setFilter] = useState("semua");
  const [search, setSearch] = useState("");
  const [publishingId, setPublishingId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const loadPosts = useCallback(async () => {
    const params = new URLSearchParams();
    if (filter !== "semua") params.set("status", filter);
    if (search) params.set("q", search);

    const res = await fetch(`/api/posts?${params}`);
    const data = await res.json();
    if (Array.isArray(data)) setPosts(data);
  }, [filter, search]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  async function deletePost(id: number) {
    if (!confirm("Hapus post ini?")) return;
    await fetch(`/api/posts/${id}`, { method: "DELETE" });
    loadPosts();
  }

  async function publishNow(id: number) {
    if (!confirm("Posting sekarang ke Instagram?")) return;
    setPublishingId(id);
    setMessage("");

    try {
      const res = await fetch("/api/posts/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: id }),
      });
      const data = await res.json();

      if (data.success) {
        setMessage("✅ Berhasil diposting ke Instagram!");
      } else {
        setMessage(`❌ Gagal: ${data.error || "Unknown error"}`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Network error";
      setMessage(`❌ ${msg}`);
    }

    setPublishingId(null);
    loadPosts();
    setTimeout(() => setMessage(""), 6000);
  }

  const tabs = [
    { key: "semua", label: "Semua" },
    { key: "scheduled", label: "Terjadwal" },
    { key: "posted", label: "Terposting" },
    { key: "draft", label: "Draft" },
    { key: "failed", label: "Gagal" },
  ];

  return (
    <div>
      {/* Cron info banner */}
      <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
        <AlertCircle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-amber-800 font-semibold leading-relaxed">
          <strong>Catatan Cron:</strong> Auto-posting hanya jalan sekali sehari (jam 14:00 WIB).
          Untuk post di waktu spesifik, gunakan tombol <strong>Post Sekarang</strong>.
        </div>
      </div>

      {/* Status message */}
      {message && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm font-bold text-blue-800 break-words">
          {message}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg border border-gray-200 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition whitespace-nowrap ${
                filter === tab.key
                  ? "bg-white text-blue-700 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍 Cari post..."
          className="sm:ml-auto sm:w-52 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        />
      </div>

      {/* List */}
      <div className="space-y-2">
        {posts.length === 0 ? (
          <div className="text-center py-16 text-gray-400 font-semibold">
            Tidak ada post ditemukan
          </div>
        ) : (
          posts.map((post) => {
            const st = statusConfig[post.status] || statusConfig.draft;
            const canPublish =
              post.status === "scheduled" ||
              post.status === "draft" ||
              post.status === "failed";
            const isExpanded = expandedId === post.id;
            const isLongCaption = post.caption && post.caption.length > 120;

            return (
              <div
                key={post.id}
                className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition p-4"
              >
                {/* Top row: thumbnail + info */}
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-xl flex-shrink-0">
                    {post.media_type === "REELS"
                      ? "🎬"
                      : post.media_type === "STORIES"
                      ? "⭕"
                      : "📸"}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Caption (truncated unless expanded) */}
                    <p
                      className={`text-sm font-bold text-gray-800 break-words ${
                        isExpanded ? "" : "line-clamp-2"
                      }`}
                    >
                      {post.caption || "(Tanpa caption)"}
                    </p>

                    {isLongCaption && (
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : post.id)}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 mt-1"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp size={12} /> Sembunyikan
                          </>
                        ) : (
                          <>
                            <ChevronDown size={12} /> Lihat selengkapnya
                          </>
                        )}
                      </button>
                    )}

                    {/* Meta info */}
                    <p className="text-[11px] text-gray-400 font-mono mt-1.5 truncate">
                      {post.media_type} · 📅{" "}
                      {formatDate(post.scheduled_at || post.created_at)}
                    </p>

                    {/* Error message */}
                    {post.status === "failed" && post.error_message && (
                      <p className="text-[11px] text-red-600 font-semibold mt-1.5 break-words">
                        ⚠️ {post.error_message}
                      </p>
                    )}
                  </div>

                  {/* Status badge (always on right at top) */}
                  <span
                    className={`flex-shrink-0 text-[10px] font-bold px-2 py-1 rounded-full border uppercase whitespace-nowrap ${st.class}`}
                  >
                    {st.label}
                  </span>
                </div>

                {/* Action buttons (full row on mobile) */}
                <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-gray-100">
                  {canPublish && (
                    <button
                      onClick={() => publishNow(post.id)}
                      disabled={publishingId === post.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 text-white text-xs font-bold rounded-lg hover:bg-amber-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {publishingId === post.id ? (
                        <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Send size={12} />
                      )}
                      Post Sekarang
                    </button>
                  )}

                  <button
                    onClick={() => deletePost(post.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg border border-gray-200 transition"
                    title="Hapus post"
                  >
                    <Trash2 size={12} />
                    Hapus
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
