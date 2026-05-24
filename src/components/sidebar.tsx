"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  PenSquare,
  Calendar,
  Cloud,
  Bot,
  BarChart3,
  Settings,
  Menu,
  X,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, group: "main" },
  { label: "Buat Post", href: "/dashboard/buat", icon: PenSquare, group: "main" },
  { label: "Jadwal Post", href: "/dashboard/jadwal", icon: Calendar, group: "main" },
  { label: "Google Drive", href: "/dashboard/drive", icon: Cloud, group: "main" },
  { label: "AI Caption", href: "/dashboard/ai", icon: Bot, group: "main" },
  { label: "Analitik", href: "/dashboard/analitik", icon: BarChart3, group: "report" },
  { label: "Pengaturan", href: "/dashboard/settings", icon: Settings, group: "system" },
];

const groupLabels: Record<string, string> = {
  main: "Menu Utama",
  report: "Laporan",
  system: "Sistem",
};

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile menu when route changes
  useEffect(() => {
    if (mobileOpen) setMobileOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Group items
  const grouped: Record<string, typeof navItems> = {};
  navItems.forEach((item) => {
    if (!grouped[item.group]) grouped[item.group] = [];
    grouped[item.group].push(item);
  });

  return (
    <>
      {/* Mobile menu trigger (visible only on mobile) */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-3 left-3 z-30 p-2 bg-blue-800 text-white rounded-lg shadow-lg"
        aria-label="Buka menu"
      >
        <Menu size={20} />
      </button>

      {/* Backdrop (mobile only) */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-30"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 bottom-0 w-60 bg-blue-800 flex flex-col z-40 shadow-xl transition-transform duration-200 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Header */}
        <div className="px-5 pt-6 pb-5 border-b border-white/10 relative">
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
            📸 @espema_klaten
          </div>

          {/* Close button (mobile only) */}
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden absolute top-3 right-3 p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded-md"
            aria-label="Tutup menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {Object.keys(grouped).map((group) => (
            <div key={group}>
              <div className="text-[10px] font-mono text-white/30 uppercase tracking-widest px-3 pt-3 pb-2">
                {groupLabels[group]}
              </div>
              {grouped[group].map((item) => {
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
            </div>
          ))}
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
              <div className="text-xs font-bold text-white truncate">@espema_klaten</div>
              <div className="text-[10px] text-white/40">Instagram Business</div>
            </div>
            <div className="w-2 h-2 rounded-full bg-green-400" />
          </div>
        </div>
      </aside>
    </>
  );
}
