"use client";

import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";

interface Post {
  id: number;
  caption: string;
  media_type: string;
  status: string;
  scheduled_at: string;
  created_at: string;
}

const statusConfig: Record<string, { label: string; class: string }> = {
  scheduled: { label: "🕐 Terjadwal", class: "bg-blue-50 text-blue-700 border-blue-200" },
  posted: { label: "✅ Terposting", class: "bg-green-50 text-green-700 border-green-200" },
  failed: { label: "❌ Gagal", class: "bg-red-50 text-red-700 border-red-200" },
  draft: { label: "📝 Draft", class: "bg-gray-50 text-gray-600 border-gray-200" },
};

export default function JadwalPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [filter, setFilter] = useState("semua");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const params = new URLSearchParams();
    if (filter !== "semua") params.set("status", filter);
    if (search) params.set("q", search);

    fetch(`/api/posts?${params}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setPosts(data);
      })
      .catch(() => {});
  }, [filter, search]);

  async function loadPosts() {
    const params = new URLSearchParams();
    if (filter !== "semua") params.set("status", filter);
    if (search) params.set("q", search);

    const res = await fetch(`/api/posts?${params}`);
    const data = await res.json();
    if (Array.isArray(data)) setPosts(data);
  }

  async function deletePost(id: number) {
    if (!confirm("Hapus post ini?")) return;
    await fetch(`/api/posts/${id}`, { method: "DELETE" });
    loadPosts();
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
      {/* Filters */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg border border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition ${
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
          className="ml-auto w-52 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
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
            return (
              <div
                key={post.id}
                className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition"
              >
                <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-xl flex-shrink-0">
                  {post.media_type === "REELS"
                    ? "🎬"
                    : post.media_type === "STORIES"
                    ? "⭕"
                    : "📸"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-800 truncate">
                    {post.caption || "(Tanpa caption)"}
                  </p>
                  <p className="text-[11px] text-gray-400 font-mono mt-0.5">
                    {post.media_type} · 📅 {post.scheduled_at || post.created_at}
                  </p>
                </div>
                <span
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase ${st.class}`}
                >
                  {st.label}
                </span>
                <button
                  onClick={() => deletePost(post.id)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
