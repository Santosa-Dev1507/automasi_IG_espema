"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PenSquare,
  Calendar,
  Cloud,
  Bot,
  BarChart3,
  Settings,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Buat Post", href: "/dashboard/buat", icon: PenSquare },
  { label: "Jadwal Post", href: "/dashboard/jadwal", icon: Calendar },
  { label: "Google Drive", href: "/dashboard/drive", icon: Cloud },
  { label: "AI Caption", href: "/dashboard/ai", icon: Bot },
  { label: "Analitik", href: "/dashboard/analitik", icon: BarChart3 },
  { label: "Pengaturan", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-60 bg-blue-800 flex flex-col z-20 shadow-xl">
      {/* Header */}
      <div className="px-5 pt-6 pb-5 border-b border-white/10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-amber-400 rounded-xl flex items-center justify-center text-xl shadow-md">
            🏫
          </div>
          <div>
            <div className="text-sm font-black text-white leading-tight">
              SMPN 5 Klaten
            </div>
            <div className="text-[11px] text-white/50 font-mono">
              IG Content Automation
            </div>
          </div>
        </div>
        <div className="inline-flex items-center gap-1.5 bg-white/10 border border-white/20 rounded-full px-2.5 py-1 text-[11px] text-white/70 font-bold">
          📸 @smpn5klaten
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        <div className="text-[10px] font-mono text-white/30 uppercase tracking-widest px-3 pb-2">
          Menu Utama
        </div>
        {navItems.slice(0, 5).map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] font-bold transition-all ${
                isActive
                  ? "bg-white/15 text-white border border-white/20"
                  : "text-white/60 hover:bg-white/10 hover:text-white border border-transparent"
              }`}
            >
              <item.icon size={17} />
              {item.label}
            </Link>
          );
        })}

        <div className="text-[10px] font-mono text-white/30 uppercase tracking-widest px-3 pt-4 pb-2">
          Laporan
        </div>
        <Link
          href={navItems[5].href}
          className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] font-bold transition-all ${
            pathname === navItems[5].href
              ? "bg-white/15 text-white border border-white/20"
              : "text-white/60 hover:bg-white/10 hover:text-white border border-transparent"
          }`}
        >
          <BarChart3 size={17} />
          Analitik
        </Link>

        <div className="text-[10px] font-mono text-white/30 uppercase tracking-widest px-3 pt-4 pb-2">
          Sistem
        </div>
        <Link
          href={navItems[6].href}
          className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] font-bold transition-all ${
            pathname === navItems[6].href
              ? "bg-white/15 text-white border border-white/20"
              : "text-white/60 hover:bg-white/10 hover:text-white border border-transparent"
          }`}
        >
          <Settings size={17} />
          Pengaturan
        </Link>
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-white/10">
        <div className="text-[10px] font-mono text-white/30 uppercase tracking-wider mb-2 px-3">
          Akun Aktif
        </div>
        <div className="flex items-center gap-2.5 px-3 py-2.5 bg-white/10 rounded-lg border border-white/15">
          <div className="w-7 h-7 rounded-full bg-amber-400 flex items-center justify-center text-xs font-black text-blue-800">
            5
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-white truncate">@smpn5klaten</div>
            <div className="text-[10px] text-white/40">Instagram Business</div>
          </div>
          <div className="w-2 h-2 rounded-full bg-green-400" />
        </div>
      </div>
    </aside>
  );
}
