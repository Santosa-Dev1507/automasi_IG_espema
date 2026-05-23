"use client";

export default function AnalitikPage() {
  // Placeholder values — TODO: Fetch real analytics from IG Insights API
  const stats = {
    totalReach: 0,
    impressions: 0,
    totalLikes: 0,
    comments: 0,
  };

  const bestTimes = [
    { time: "06:30–07:30", pct: 91 },
    { time: "09:00–10:00", pct: 65 },
    { time: "12:00–13:00", pct: 74 },
    { time: "14:00–15:30", pct: 88 },
    { time: "19:00–21:00", pct: 78 },
  ];

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <AnalyticCard label="Total Reach" value={formatNum(stats.totalReach)} sub="30 hari terakhir" icon="👁️" />
        <AnalyticCard label="Impressions" value={formatNum(stats.impressions)} sub="30 hari terakhir" icon="📈" />
        <AnalyticCard label="Total Likes" value={formatNum(stats.totalLikes)} sub="30 hari terakhir" icon="❤️" />
        <AnalyticCard label="Komentar" value={formatNum(stats.comments)} sub="30 hari terakhir" icon="💬" />
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Best Times */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="text-sm font-black text-gray-900 mb-4">⏰ Waktu Terbaik Posting</h3>
          <div className="space-y-3">
            {bestTimes.map((t) => (
              <div key={t.time} className="flex items-center gap-3">
                <span className="text-xs font-bold text-gray-500 w-28 flex-shrink-0">
                  {t.time}
                </span>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      t.pct >= 85 ? "bg-green-500" : "bg-blue-500"
                    }`}
                    style={{ width: `${t.pct}%` }}
                  />
                </div>
                <span className="text-xs font-bold font-mono text-gray-700 w-10 text-right">
                  {t.pct}%
                </span>
              </div>
            ))}
          </div>

          <div className="mt-5 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="text-xs font-bold text-amber-800 mb-1">💡 Rekomendasi</div>
            <div className="text-xs text-amber-700 font-semibold">
              Posting di jam <strong>06:30–07:30</strong> (sebelum masuk sekolah) dan{" "}
              <strong>14:00–15:30</strong> (pulang sekolah) untuk engagement tertinggi.
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="text-sm font-black text-gray-900 mb-4">📊 Tentang Analitik</h3>
          <div className="space-y-3 text-sm text-gray-600 font-semibold">
            <p>
              Data analitik diambil dari Instagram Insights API secara periodik.
            </p>
            <p>
              Metrik yang ditampilkan mencakup reach, impressions, likes, dan komentar
              dari 30 hari terakhir.
            </p>
            <p className="text-xs text-amber-600 font-semibold mt-4 pt-3 border-t border-gray-100">
              ⚠️ Fitur ini belum aktif — perlu integrasi IG Insights API
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function AnalyticCard({
  label,
  value,
  sub,
  icon,
}: {
  label: string;
  value: string;
  sub: string;
  icon: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <div className="text-2xl mb-2">{icon}</div>
      <div className="text-[11px] text-gray-400 font-mono uppercase tracking-wide mb-1">
        {label}
      </div>
      <div className="text-2xl font-black text-gray-900">{value}</div>
      <div className="text-[11px] text-gray-500 font-semibold mt-1">{sub}</div>
    </div>
  );
}

function formatNum(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}
