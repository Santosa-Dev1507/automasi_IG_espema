"use client";

import { useState } from "react";

export default function SettingsPage() {
  const [igUserId, setIgUserId] = useState("");
  const [igToken, setIgToken] = useState("");
  const [tokenExp, setTokenExp] = useState("");
  const [driveFolderId, setDriveFolderId] = useState("");
  const [geminiKey, setGeminiKey] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [message, setMessage] = useState("");
  const [testing, setTesting] = useState(false);

  async function testConnection() {
    setTesting(true);
    setMessage("");
    try {
      // Simple test: try to get account info
      const res = await fetch("/api/instagram/test");
      const data = await res.json();
      if (data.error) {
        setMessage(`❌ ${data.error}`);
      } else {
        setMessage(`✅ Koneksi berhasil! Akun: @${data.username}`);
      }
    } catch {
      setMessage("❌ Gagal menguji koneksi");
    }
    setTesting(false);
  }

  function saveSettings() {
    // In production, save to DB via API
    setMessage("💾 Pengaturan disimpan!");
    setTimeout(() => setMessage(""), 3000);
  }

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Instagram API */}
      <div className="space-y-4">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="text-sm font-black text-gray-900 mb-4">🔑 Instagram API</h3>

          <div className="mb-3">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
              Instagram User ID
            </label>
            <input
              type="text"
              value={igUserId}
              onChange={(e) => setIgUserId(e.target.value)}
              placeholder="17841400000000000"
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
            />
            <p className="text-[11px] text-gray-400 mt-1">
              Didapat dari Meta Developer Console
            </p>
          </div>

          <div className="mb-3">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
              Access Token
            </label>
            <div className="flex gap-2">
              <input
                type={showToken ? "text" : "password"}
                value={igToken}
                onChange={(e) => setIgToken(e.target.value)}
                placeholder="EAAxx..."
                className="flex-1 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              <button
                onClick={() => setShowToken(!showToken)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50"
              >
                👁️
              </button>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
              Kedaluwarsa Token
            </label>
            <input
              type="date"
              value={tokenExp}
              onChange={(e) => setTokenExp(e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <button
            onClick={testConnection}
            disabled={testing}
            className="px-4 py-2 border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50 transition disabled:opacity-50"
          >
            {testing ? "Menguji..." : "🔍 Test Koneksi"}
          </button>

          {message && (
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm font-bold text-blue-800">
              {message}
            </div>
          )}
        </div>

        {/* Google Drive */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="text-sm font-black text-gray-900 mb-4">☁️ Google Drive</h3>
          <div className="mb-3">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
              Folder ID (dari URL shared folder)
            </label>
            <input
              type="text"
              value={driveFolderId}
              onChange={(e) => setDriveFolderId(e.target.value)}
              placeholder="1AbCdEfGhIjKlMnOpQrStUvWxYz"
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            <p className="text-[11px] text-gray-400 mt-1">
              Ambil dari URL: drive.google.com/drive/folders/<strong>ID_INI</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Right column */}
      <div className="space-y-4">
        {/* Gemini */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="text-sm font-black text-gray-900 mb-4">🤖 Gemini AI</h3>
          <div className="mb-3">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
              Gemini API Key
            </label>
            <input
              type="password"
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            <p className="text-[11px] text-gray-400 mt-1">
              Gratis 1.500 request/hari.{" "}
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                className="text-blue-500 hover:underline"
              >
                Dapatkan di sini →
              </a>
            </p>
          </div>
        </div>

        {/* Auto-posting */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="text-sm font-black text-gray-900 mb-4">⏰ Auto-Posting</h3>
          <div className="mb-3">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
              Zona Waktu
            </label>
            <select className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20">
              <option>WIB (UTC+7) — Jakarta / Klaten</option>
              <option>WITA (UTC+8)</option>
              <option>WIT (UTC+9)</option>
            </select>
          </div>
          <div className="mb-3">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
              Retry Jika Gagal
            </label>
            <select className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20">
              <option>3x retry, jeda 5 menit</option>
              <option>5x retry, jeda 10 menit</option>
              <option>Tidak retry otomatis</option>
            </select>
          </div>
        </div>

        {/* Save */}
        <button
          onClick={saveSettings}
          className="w-full py-3 bg-blue-800 text-white font-bold rounded-lg shadow hover:bg-blue-900 transition"
        >
          💾 Simpan Semua Pengaturan
        </button>
      </div>
    </div>
  );
}
