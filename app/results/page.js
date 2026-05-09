"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, BarChart3, RefreshCw } from "lucide-react";
import Link from "next/link";
import { QUESTIONS } from "@/lib/questions";

export default function ResultsPage() {
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadResponses = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/responses");
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
    loadResponses();
  }, []);

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
            <button
              onClick={loadResponses}
              disabled={loading}
              className="text-emerald-700 hover:text-emerald-900 text-sm font-medium flex items-center gap-1 disabled:opacity-50"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />{" "}
              Refresh
            </button>
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
              <p>No responses yet. Be the first!</p>
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

        <Link
          href="/"
          className="block w-full bg-emerald-900 hover:bg-emerald-800 text-white font-semibold py-3 rounded-2xl transition-colors text-center"
        >
          Take the Survey
        </Link>

        <p className="text-center text-xs text-gray-500 mt-4">
          TaxEasy &bull; TS Academy Capstone
        </p>
      </div>
    </div>
  );
}
