"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

interface TopbarProps {
  user?: {
    name?: string | null;
    email?: string | null;
  };
}

export function Topbar({ user }: TopbarProps) {
  return (
    <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-7 h-16 flex items-center gap-4 shadow-sm">
      <div className="flex-1">
        <span className="text-sm font-bold text-gray-500">
          Halo, <span className="text-gray-900">{user?.name || "Admin"}</span>
        </span>
      </div>

      <Link
        href="/dashboard/buat"
        className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-800 text-white text-xs font-bold rounded-lg shadow hover:bg-blue-900 transition"
      >
        ✏️ Buat Post
      </Link>

      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
      >
        <LogOut size={14} />
        Keluar
      </button>
    </header>
  );
}
