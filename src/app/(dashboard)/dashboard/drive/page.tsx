"use client";

import { useState } from "react";
import { Copy, ExternalLink } from "lucide-react";

export default function DrivePage() {
  const [fileUrl, setFileUrl] = useState("");
  const [convertedUrl, setConvertedUrl] = useState("");

  function convertUrl(input: string) {
    setFileUrl(input);
    let fileId = input.trim();

    // Format: https://drive.google.com/file/d/FILE_ID/view
    const match1 = fileId.match(/\/file\/d\/([^/]+)/);
    if (match1) fileId = match1[1];

    // Format: https://drive.google.com/open?id=FILE_ID
    const match2 = fileId.match(/[?&]id=([^&]+)/);
    if (match2) fileId = match2[1];

    if (fileId && !fileId.includes("/") && !fileId.includes("http")) {
      setConvertedUrl(`https://lh3.googleusercontent.com/d/${fileId}`);
    } else if (match1) {
      setConvertedUrl(`https://lh3.googleusercontent.com/d/${match1[1]}`);
    } else if (match2) {
      setConvertedUrl(`https://lh3.googleusercontent.com/d/${match2[1]}`);
    } else {
      setConvertedUrl("");
    }
  }

  function copyUrl() {
    if (convertedUrl) {
      navigator.clipboard.writeText(convertedUrl);
    }
  }

  const folderId = process.env.NEXT_PUBLIC_GOOGLE_DRIVE_FOLDER_ID || "";

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-5">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-green-500 rounded-xl flex items-center justify-center text-xl shadow">
            ☁️
          </div>
          <div>
            <div className="text-sm font-black">Google Drive — Media Sekolah</div>
            <div className="text-xs text-gray-500 font-semibold">
              Upload file ke folder Drive, lalu paste link-nya di sini
            </div>
          </div>
        </div>

        {folderId && (
          <a
            href={`https://drive.google.com/drive/folders/${folderId}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-xs font-bold text-blue-700 hover:bg-blue-100 transition"
          >
            <ExternalLink size={13} />
            Buka Folder Drive
          </a>
        )}
      </div>

      {/* Converter */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-5">
        <h3 className="text-sm font-black text-gray-900 mb-3">🔗 Konversi Link Google Drive</h3>
        <p className="text-xs text-gray-500 font-semibold mb-4">
          Paste link file dari Google Drive untuk mendapatkan URL yang bisa dipakai posting ke Instagram.
        </p>

        <div className="mb-3">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
            Link Google Drive
          </label>
          <input
            type="text"
            value={fileUrl}
            onChange={(e) => convertUrl(e.target.value)}
            placeholder="https://drive.google.com/file/d/xxxxx/view?usp=sharing"
            className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
          />
        </div>

        {convertedUrl && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="text-xs font-bold text-green-700 mb-2">✅ URL Media (siap pakai):</div>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-[11px] text-green-800 font-mono bg-green-100 px-2 py-1.5 rounded break-all">
                {convertedUrl}
              </code>
              <button
                onClick={copyUrl}
                className="flex-shrink-0 p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                title="Salin URL"
              >
                <Copy size={14} />
              </button>
            </div>
            <p className="text-[11px] text-green-600 mt-2 font-semibold">
              💡 Gunakan URL ini di halaman &quot;Buat Post&quot; atau langsung paste di field media
            </p>
          </div>
        )}
      </div>

      {/* Guide */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <h3 className="text-sm font-black text-gray-900 mb-3">📖 Cara Pakai</h3>
        <ol className="space-y-3 text-sm text-gray-600 font-semibold">
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-black">1</span>
            <span>Upload foto/video ke folder <strong>Google Drive</strong> yang sudah di-share</span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-black">2</span>
            <span>Klik kanan file → <strong>Get link</strong> → pastikan &quot;Anyone with the link&quot;</span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-black">3</span>
            <span>Copy link, lalu <strong>paste di atas</strong> untuk konversi</span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-black">4</span>
            <span>Gunakan URL hasil konversi di halaman <strong>Buat Post</strong></span>
          </li>
        </ol>

        <div className="mt-5 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="text-xs font-bold text-amber-800 mb-1">⚠️ Penting</div>
          <div className="text-xs text-amber-700 font-semibold">
            File harus di-share sebagai &quot;Anyone with the link can view&quot; agar bisa diakses oleh Instagram API saat posting.
          </div>
        </div>
      </div>
    </div>
  );
}
