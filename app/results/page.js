"use client";

import { useState, useEffect } from "react";
import {
  ArrowLeft,
  BarChart3,
  RefreshCw,
  Lock,
  LogOut,
  Download,
} from "lucide-react";
import Link from "next/link";
import { QUESTIONS } from "@/lib/questions";

export default function ResultsPage() {
  const [authed, setAuthed] = useState(null); // null = checking
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);

  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetch("/api/admin/me")
      .then((r) => r.json())
      .then((d) => setAuthed(!!d.authenticated))
      .catch(() => setAuthed(false));
  }, []);

  const loadResponses = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/responses");
      if (res.status === 401) {
        setAuthed(false);
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load");
      setResponses(data.responses || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authed) loadResponses();
  }, [authed]);

  const login = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      setPassword("");
      setAuthed(true);
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/admin/login", { method: "DELETE" });
    } catch {}
    setAuthed(false);
    setUsername("");
    setResponses([]);
  };

  const downloadCSV = async () => {
    setExporting(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/export", { method: "POST" });
      if (res.status === 401) {
        setAuthed(false);
        return;
      }
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Export failed");
      }
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
      setExporting(false);
    }
  };

  if (authed === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 flex items-center justify-center p-4">
        <div className="text-gray-500">Loading…</div>
      </div>
    );
  }

  if (!authed) {
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
              Admin Login
            </h1>
            <p className="text-gray-600 text-sm">
              Sign in to view survey results
            </p>
          </div>

          <form onSubmit={login} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-700 transition-colors"
                placeholder="Enter username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-700 transition-colors"
                placeholder="Enter password"
              />
            </div>

            {authError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                {authError}
              </div>
            )}

            <button
              type="submit"
              disabled={!username || !password || authLoading}
              className="w-full bg-emerald-900 hover:bg-emerald-800 disabled:bg-gray-300 text-white font-semibold py-3 rounded-2xl transition-colors"
            >
              {authLoading ? "Signing in…" : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const totalResponses = responses.length;

  const getDistribution = (qid) => {
    const counts = {};
    responses.forEach((r) => {
      const a = r.answers?.[qid];
      if (a !== undefined && a !== null) {
        counts[a] = (counts[a] || 0) + 1;
      }
    });
    return counts;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8 mb-4">
          <div className="flex items-center justify-between mb-6">
            <Link
              href="/"
              className="text-emerald-700 hover:text-emerald-900 text-sm font-medium flex items-center gap-1"
            >
              <ArrowLeft size={16} /> Back
            </Link>
            <div className="flex items-center gap-3">
              <button
                onClick={loadResponses}
                disabled={loading}
                className="text-emerald-700 hover:text-emerald-900 text-sm font-medium flex items-center gap-1 disabled:opacity-50"
              >
                <RefreshCw
                  size={14}
                  className={loading ? "animate-spin" : ""}
                />{" "}
                Refresh
              </button>
              <button
                onClick={downloadCSV}
                disabled={exporting || totalResponses === 0}
                className="text-emerald-700 hover:text-emerald-900 text-sm font-medium flex items-center gap-1 disabled:opacity-50"
              >
                <Download size={14} />
                {exporting ? "Exporting…" : "CSV"}
              </button>
              <button
                onClick={logout}
                className="text-gray-500 hover:text-gray-800 text-sm font-medium flex items-center gap-1"
              >
                <LogOut size={14} /> Logout
              </button>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-emerald-900">
              Survey Results
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              {totalResponses} {totalResponses === 1 ? "response" : "responses"}{" "}
              collected
            </p>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 mb-4">
              {error}
            </div>
          )}

          {loading && responses.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              Loading responses...
            </div>
          ) : totalResponses === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <BarChart3 size={48} className="mx-auto mb-3 opacity-30" />
              <p>No responses yet.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {QUESTIONS.map((question, idx) => {
                const dist = getDistribution(question.id);
                const isScale = question.type === "scale";

                return (
                  <div key={question.id} className="border-t pt-5">
                    <div className="text-xs font-semibold text-emerald-700 mb-1">
                      Q{idx + 1} &bull; {question.section}
                    </div>
                    <p className="font-medium text-gray-800 mb-3 text-sm md:text-base">
                      {question.question}
                    </p>

                    {isScale ? (
                      <div>
                        <div className="flex justify-between text-xs text-gray-500 mb-2">
                          <span>{question.scaleLabels[0]}</span>
                          <span>{question.scaleLabels[1]}</span>
                        </div>
                        <div className="grid grid-cols-5 gap-1.5">
                          {[1, 2, 3, 4, 5].map((n) => {
                            const count = dist[n] || 0;
                            const pct = totalResponses
                              ? (count / totalResponses) * 100
                              : 0;
                            return (
                              <div key={n} className="text-center">
                                <div className="bg-gray-100 rounded-lg h-20 flex items-end overflow-hidden mb-1">
                                  <div
                                    className="bg-emerald-700 w-full transition-all"
                                    style={{ height: `${pct}%` }}
                                  ></div>
                                </div>
                                <div className="text-xs text-gray-600 font-medium">
                                  {n}
                                </div>
                                <div className="text-xs text-gray-400">
                                  {count}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {question.options.map((opt) => {
                          const count = dist[opt] || 0;
                          const pct = totalResponses
                            ? (count / totalResponses) * 100
                            : 0;
                          return (
                            <div key={opt}>
                              <div className="flex justify-between text-xs mb-1">
                                <span className="text-gray-700">{opt}</span>
                                <span className="text-gray-500 font-medium">
                                  {count} ({pct.toFixed(0)}%)
                                </span>
                              </div>
                              <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
                                <div
                                  className="bg-emerald-700 h-full transition-all"
                                  style={{ width: `${pct}%` }}
                                ></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <p className="text-center text-xs text-gray-500 mt-4">
          TaxEasy &bull; TS Academy Capstone
        </p>
      </div>
    </div>
  );
}
