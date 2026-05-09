"use client";

import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Send,
} from "lucide-react";
import { QUESTIONS } from "@/lib/questions";

export default function SurveyPage() {
  const [view, setView] = useState("intro"); // intro | survey | thanks
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const progress = ((currentQ + 1) / QUESTIONS.length) * 100;
  const q = QUESTIONS[currentQ];
  const currentAnswer = answers[q?.id];

  const handleAnswer = (val) => {
    setAnswers({ ...answers, [q.id]: val });
    setError(null);
  };

  const handleNext = () => {
    if (currentQ < QUESTIONS.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      submitSurvey();
    }
  };

  const handleBack = () => {
    if (currentQ > 0) setCurrentQ(currentQ - 1);
  };

  const submitSurvey = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/responses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit");
      }
      setView("thanks");
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const restart = () => {
    setAnswers({});
    setCurrentQ(0);
    setError(null);
    setView("survey");
  };

  // INTRO
  if (view === "intro") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 flex items-center justify-center p-4">
        <div className="max-w-xl w-full bg-white rounded-3xl shadow-xl p-8 md:p-10">
          <div className="text-center mb-6">
            <div className="inline-block bg-emerald-900 text-white px-4 py-1 rounded-full text-xs font-semibold tracking-wide mb-4">
              GOVTECH / PUBLIC SERVICES
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-emerald-900 mb-2">
              TaxEasy
            </h1>
            <p className="text-emerald-700 italic mb-6">
              Tax made simple for everyday Nigerians
            </p>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">
              Help Us Build Something Useful
            </h2>
            <p className="text-gray-600 leading-relaxed">
              We&apos;re building a mobile app to make paying tax in Nigeria
              simple, transparent, and stress-free under the new 2026 tax laws.
              Your honest answers will shape what we build.
            </p>
          </div>

          <div className="bg-emerald-50 rounded-2xl p-5 mb-6 space-y-2">
            <div className="flex items-center gap-3 text-sm text-emerald-900">
              <CheckCircle2 size={18} className="flex-shrink-0" />
              <span>10 short questions</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-emerald-900">
              <CheckCircle2 size={18} className="flex-shrink-0" />
              <span>Takes about 3 minutes</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-emerald-900">
              <CheckCircle2 size={18} className="flex-shrink-0" />
              <span>100% anonymous</span>
            </div>
          </div>

          <button
            onClick={() => setView("survey")}
            className="w-full bg-emerald-900 hover:bg-emerald-800 text-white font-semibold py-4 rounded-2xl transition-colors flex items-center justify-center gap-2"
          >
            Start Survey <ChevronRight size={20} />
          </button>
        </div>
      </div>
    );
  }

  // THANKS
  if (view === "thanks") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={48} className="text-emerald-700" />
          </div>
          <h2 className="text-3xl font-bold text-emerald-900 mb-3">
            Thank You!
          </h2>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Your response helps us build a tax app that actually works for
            Nigerians like you. We appreciate it.
          </p>
          <button
            onClick={restart}
            className="w-full bg-emerald-900 hover:bg-emerald-800 text-white font-semibold py-3 rounded-2xl transition-colors"
          >
            Take Survey Again
          </button>
        </div>
      </div>
    );
  }

  // SURVEY
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 flex items-center justify-center p-4">
      <div className="max-w-xl w-full">
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">
              {q.section}
            </span>
            <span className="text-xs text-gray-500 font-medium">
              Question {currentQ + 1} of {QUESTIONS.length}
            </span>
          </div>
          <div className="bg-white rounded-full h-2 overflow-hidden shadow-sm">
            <div
              className="bg-emerald-700 h-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8">
          <h2 className="text-lg md:text-xl font-semibold text-gray-900 leading-relaxed mb-6">
            {q.question}
          </h2>

          {q.type === "single" && (
            <div className="space-y-2">
              {q.options.map((opt) => {
                const selected = currentAnswer === opt;
                return (
                  <button
                    key={opt}
                    onClick={() => handleAnswer(opt)}
                    className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${
                      selected
                        ? "border-emerald-700 bg-emerald-50 text-emerald-900 font-medium"
                        : "border-gray-200 hover:border-emerald-300 text-gray-700"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                          selected
                            ? "border-emerald-700 bg-emerald-700"
                            : "border-gray-300"
                        }`}
                      >
                        {selected && (
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        )}
                      </div>
                      <span className="text-sm md:text-base">{opt}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {q.type === "scale" && (
            <div>
              <div className="flex justify-between text-xs md:text-sm text-gray-600 mb-3 px-1">
                <span>{q.scaleLabels[0]}</span>
                <span>{q.scaleLabels[1]}</span>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map((n) => {
                  const selected = currentAnswer === n;
                  return (
                    <button
                      key={n}
                      onClick={() => handleAnswer(n)}
                      className={`aspect-square rounded-2xl border-2 font-bold text-lg md:text-xl transition-all ${
                        selected
                          ? "border-emerald-700 bg-emerald-700 text-white scale-105"
                          : "border-gray-200 hover:border-emerald-300 text-gray-700"
                      }`}
                    >
                      {n}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex gap-3 mt-8">
            <button
              onClick={handleBack}
              disabled={currentQ === 0}
              className="px-5 py-3 rounded-2xl font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
            >
              <ChevronLeft size={18} /> Back
            </button>
            <button
              onClick={handleNext}
              disabled={currentAnswer === undefined || submitting}
              className="flex-1 bg-emerald-900 hover:bg-emerald-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-2xl transition-colors flex items-center justify-center gap-2"
            >
              {submitting ? (
                "Submitting..."
              ) : currentQ === QUESTIONS.length - 1 ? (
                <>
                  Submit <Send size={18} />
                </>
              ) : (
                <>
                  Next <ChevronRight size={18} />
                </>
              )}
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-gray-500 mt-4">
          TaxEasy &bull; Anonymous responses
        </p>
      </div>
    </div>
  );
}
