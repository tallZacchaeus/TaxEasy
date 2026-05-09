"use client";

import { useState } from "react";
import { Lock, Download, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const downloadCSV = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Export failed");
      }

      // Trigger download
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `taxeasy_responses_${
        new Date().toISOString().split("T")[0]
      }.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8">
        <Link
          href="/"
          className="text-emerald-700 hover:text-emerald-900 text-sm font-medium flex items-center gap-1 mb-4"
        >
          <ArrowLeft size={16} /> Back to survey
        </Link>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock size={28} className="text-emerald-700" />
          </div>
          <h1 className="text-2xl font-bold text-emerald-900 mb-2">
            Admin Export
          </h1>
          <p className="text-gray-600 text-sm">
            Download all survey responses as a CSV file
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Admin Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && password) downloadCSV();
              }}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-700 transition-colors"
              placeholder="Enter password"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            onClick={downloadCSV}
            disabled={!password || loading}
            className="w-full bg-emerald-900 hover:bg-emerald-800 disabled:bg-gray-300 text-white font-semibold py-3 rounded-2xl transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              "Exporting..."
            ) : (
              <>
                <Download size={18} /> Download CSV
              </>
            )}
          </button>
        </div>

        <p className="text-xs text-gray-400 mt-6 text-center">
          The admin password is set in your environment variables
        </p>
      </div>
    </div>
  );
}
