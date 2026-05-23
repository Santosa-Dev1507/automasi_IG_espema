"use client";

import { useEffect, useState } from "react";
import { Camera, Calendar, CheckCircle, Heart } from "lucide-react";

interface Post {
  id: number;
  caption: string;
  media_type: string;
  status: string;
  scheduled_at: string;
}

export default function DashboardPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    scheduled: 0,
    posted: 0,
    avgLikes: 0,
  });

  useEffect(() => {
    fetch("/api/posts")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setPosts(data);
          setStats({
            total: data.length,
            scheduled: data.filter((p: Post) => p.status === "scheduled").length,
            posted: data.filter((p: Post) => p.status === "posted").length,
            avgLikes: 0,
          });
        }
      })
      .catch(() => {});
  }, []);

  const upcoming = posts
    .filter((p) => p.status === "scheduled")
    .slice(0, 4);

  const typeEmoji: Record<string, string> = {
    FEED: "📸",
    REELS: "🎬",
    CAROUSEL: "🗂️",
    STORIES: "⭕",
  };

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={<Camera className="text-blue-600" size={28} />}
          label="Total Post"
          value={stats.total}
          sub="Semua post"
          accent="bg-gradient-to-r from-blue-800 to-blue-500"
        />
        <StatCard
          icon={<Calendar className="text-sky-500" size={28} />}
          label="Terjadwal"
          value={stats.scheduled}
          sub="Menunggu posting"
          accent="bg-gradient-to-r from-sky-500 to-sky-300"
        />
        <StatCard
          icon={<CheckCircle className="text-green-600" size={28} />}
          label="Terposting"
          value={stats.posted}
          sub="Berhasil"
          accent="bg-gradient-to-r from-green-600 to-green-400"
        />
        <StatCard
          icon={<Heart className="text-amber-500" size={28} />}
          label="Avg. Likes"
          value={stats.avgLikes}
          sub="Per post"
          accent="bg-gradient-to-r from-amber-500 to-amber-300"
        />
      </div>

      {/* Upcoming */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <h3 className="text-sm font-black text-gray-900 mb-4 flex items-center gap-2">
          📋 Post Akan Datang
        </h3>
        {upcoming.length === 0 ? (
          <p className="text-center text-gray-400 py-8 font-semibold">
            Belum ada post terjadwal
          </p>
        ) : (
          <div className="space-y-2">
            {upcoming.map((post) => (
              <div
                key={post.id}
                className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 bg-gray-50"
              >
                <span className="text-xl">
                  {typeEmoji[post.media_type] || "📸"}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-800 truncate">
                    {post.caption || "(Tanpa caption)"}
                  </p>
                  <p className="text-[11px] text-gray-400 font-mono mt-0.5">
                    {post.media_type} · {post.scheduled_at}
                  </p>
                </div>
                <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full uppercase">
                  Terjadwal
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  sub: string;
  accent: string;
}) {
  return (
    <div className="relative bg-white rounded-xl border border-gray-200 shadow-sm p-5 overflow-hidden">
      <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-xl ${accent}`} />
      <div className="mb-2">{icon}</div>
      <div className="text-[11px] text-gray-400 font-mono uppercase tracking-wide mb-1">
        {label}
      </div>
      <div className="text-2xl font-black text-gray-900">{value}</div>
      <div className="text-[11px] text-gray-500 font-semibold mt-1">{sub}</div>
    </div>
  );
}
