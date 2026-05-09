"use client";

import { useState, useEffect, useMemo } from "react";
import {
  ArrowLeft,
  RefreshCw,
  Lock,
  LogOut,
  Download,
  Users,
  Calendar,
  ListChecks,
  MessageSquareText,
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { QUESTIONS } from "@/lib/questions";
import {
  SingleChoiceChart,
  ScaleChart,
} from "@/components/charts/QuestionChart";

const formatDate = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export default function ResultsPage() {
  const [authed, setAuthed] = useState(null);
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

  const totalResponses = responses.length;

  const latestSubmission = useMemo(() => {
    if (!responses.length) return null;
    return responses.reduce(
      (acc, r) =>
        !acc || new Date(r.submitted_at) > new Date(acc) ? r.submitted_at : acc,
      null
    );
  }, [responses]);

  const sections = useMemo(() => {
    const map = new Map();
    QUESTIONS.filter((q) => q.type !== "text").forEach((q) => {
      if (!map.has(q.section)) map.set(q.section, []);
      map.get(q.section).push(q);
    });
    return Array.from(map.entries());
  }, []);

  const textQuestions = useMemo(
    () => QUESTIONS.filter((q) => q.type === "text"),
    []
  );

  const comments = useMemo(() => {
    const list = [];
    responses.forEach((r) => {
      textQuestions.forEach((q) => {
        const text = r.answers?.[q.id];
        if (typeof text === "string" && text.trim()) {
          list.push({
            id: `${r.id}-${q.id}`,
            qid: q.id,
            text: text.trim(),
            date: r.submitted_at,
          });
        }
      });
    });
    return list.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [responses, textQuestions]);

  const getDistribution = (qid) => {
    const counts = {};
    responses.forEach((r) => {
      const a = r.answers?.[qid];
      if (a !== undefined && a !== null) counts[a] = (counts[a] || 0) + 1;
    });
    return counts;
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
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8"
        >
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

            <AnimatePresence>
              {authError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700"
                >
                  {authError}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={!username || !password || authLoading}
              className="w-full bg-emerald-900 hover:bg-emerald-800 disabled:bg-gray-300 text-white font-semibold py-3 rounded-2xl transition-colors"
            >
              {authLoading ? "Signing in…" : "Sign In"}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-3xl shadow-xl p-6 md:p-8 mb-4"
        >
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <Link
              href="/"
              className="text-emerald-700 hover:text-emerald-900 text-sm font-medium flex items-center gap-1"
            >
              <ArrowLeft size={16} /> Back
            </Link>
            <div className="flex items-center gap-2 md:gap-3">
              <button
                onClick={loadResponses}
                disabled={loading}
                className="text-emerald-700 hover:text-emerald-900 text-sm font-medium flex items-center gap-1 disabled:opacity-50 px-2 py-1"
              >
                <RefreshCw
                  size={14}
                  className={loading ? "animate-spin" : ""}
                />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              <button
                onClick={downloadCSV}
                disabled={exporting || totalResponses === 0}
                className="text-emerald-700 hover:text-emerald-900 text-sm font-medium flex items-center gap-1 disabled:opacity-50 px-2 py-1"
              >
                <Download size={14} />
                <span className="hidden sm:inline">
                  {exporting ? "Exporting…" : "CSV"}
                </span>
              </button>
              <button
                onClick={logout}
                className="text-gray-500 hover:text-gray-800 text-sm font-medium flex items-center gap-1 px-2 py-1"
              >
                <LogOut size={14} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-emerald-900">
              Survey Dashboard
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              Live insights from collected responses
            </p>
          </div>

          {/* Metric strip */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <MetricCard
              icon={<Users size={18} />}
              label="Total responses"
              value={totalResponses}
            />
            <MetricCard
              icon={<ListChecks size={18} />}
              label="Questions"
              value={QUESTIONS.length}
            />
            <MetricCard
              icon={<Calendar size={18} />}
              label="Latest"
              value={formatDate(latestSubmission)}
              wide
            />
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 mt-4">
              {error}
            </div>
          )}
        </motion.div>

        {/* Empty / loading state */}
        {loading && responses.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-xl p-12 text-center text-gray-500">
            Loading responses…
          </div>
        ) : totalResponses === 0 ? (
          <div className="bg-white rounded-3xl shadow-xl p-12 text-center text-gray-500">
            <Users size={48} className="mx-auto mb-3 opacity-30" />
            <p>No responses yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {sections.map(([sectionName, qs], sectionIdx) => (
              <motion.section
                key={sectionName}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: sectionIdx * 0.06 }}
              >
                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-3 px-1">
                  {sectionName}
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {qs.map((question, qIdx) => {
                    const dist = getDistribution(question.id);
                    const answered = Object.values(dist).reduce(
                      (a, b) => a + b,
                      0
                    );
                    return (
                      <motion.div
                        key={question.id}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{
                          duration: 0.3,
                          delay: sectionIdx * 0.06 + qIdx * 0.04,
                        }}
                        className="bg-white rounded-2xl shadow-md p-5 hover:shadow-lg transition-shadow"
                      >
                        <p className="font-medium text-gray-800 text-sm leading-snug mb-1">
                          {question.question}
                        </p>
                        <p className="text-xs text-gray-400 mb-4">
                          {answered}{" "}
                          {answered === 1 ? "respondent" : "respondents"}
                        </p>
                        {question.type === "scale" ? (
                          <ScaleChart
                            distribution={dist}
                            total={answered}
                            scaleLabels={question.scaleLabels}
                          />
                        ) : (
                          <SingleChoiceChart
                            options={question.options}
                            distribution={dist}
                            total={answered}
                          />
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </motion.section>
            ))}

            {textQuestions.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.35,
                  delay: sections.length * 0.06,
                }}
              >
                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-3 px-1 flex items-center gap-1.5">
                  <MessageSquareText size={14} /> Comments
                  <span className="ml-1 text-gray-400 font-medium">
                    {comments.length}
                  </span>
                </h3>
                <div className="bg-white rounded-2xl shadow-md p-5">
                  {comments.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-8">
                      No free-text comments yet.
                    </p>
                  ) : (
                    <ul className="divide-y divide-gray-100">
                      {comments.map((c) => (
                        <li key={c.id} className="py-3 first:pt-0 last:pb-0">
                          <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                            {c.text}
                          </p>
                          <p className="text-[11px] text-gray-400 mt-1">
                            {formatDate(c.date)}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </motion.section>
            )}
          </div>
        )}

        <p className="text-center text-xs text-gray-500 mt-8">
          TaxEasy &bull; TS Academy Capstone
        </p>
      </div>
    </div>
  );
}

function MetricCard({ icon, label, value, wide }) {
  return (
    <div
      className={`flex items-center gap-3 p-4 bg-emerald-50 rounded-2xl ${
        wide ? "col-span-2 md:col-span-1" : ""
      }`}
    >
      <div className="w-10 h-10 rounded-xl bg-white text-emerald-700 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-[11px] uppercase tracking-wider text-emerald-700 font-semibold">
          {label}
        </div>
        <div className="text-lg font-bold text-emerald-900 truncate">
          {value}
        </div>
      </div>
    </div>
  );
}
