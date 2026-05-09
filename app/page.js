"use client";

import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Send,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { QUESTIONS } from "@/lib/questions";

const cardVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 60 : -60,
    opacity: 0,
    scale: 0.98,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] },
  },
  exit: (direction) => ({
    x: direction > 0 ? -60 : 60,
    opacity: 0,
    scale: 0.98,
    transition: { duration: 0.22, ease: "easeIn" },
  }),
};

const optionsContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.12 },
  },
};

const optionItem = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

export default function SurveyPage() {
  const [view, setView] = useState("intro");
  const [currentQ, setCurrentQ] = useState(0);
  const [direction, setDirection] = useState(1);
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
      setDirection(1);
      setCurrentQ(currentQ + 1);
    } else {
      submitSurvey();
    }
  };

  const handleBack = () => {
    if (currentQ > 0) {
      setDirection(-1);
      setCurrentQ(currentQ - 1);
    }
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
      if (!res.ok) throw new Error(data.error || "Failed to submit");
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
    setDirection(1);
    setError(null);
    setView("survey");
  };

  // INTRO
  if (view === "intro") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-xl w-full bg-white rounded-3xl shadow-xl p-8 md:p-10"
        >
          <div className="text-center mb-6">
            <motion.h2
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              className="text-3xl md:text-4xl font-bold text-emerald-900 mb-4"
            >
              Help Us Build Something Useful
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="text-gray-600 leading-relaxed"
            >
              We&apos;re building a mobile app to make paying tax in Nigeria
              simple, transparent, and stress-free under the new 2026 tax laws.
              Your honest answers will shape what we build.
            </motion.p>
          </div>

          <motion.div
            variants={optionsContainer}
            initial="hidden"
            animate="show"
            transition={{ delayChildren: 0.45 }}
            className="bg-emerald-50 rounded-2xl p-5 mb-6 space-y-2"
          >
            {[
              "10 short questions",
              "Takes about 3 minutes",
              "100% anonymous",
            ].map((line) => (
              <motion.div
                key={line}
                variants={optionItem}
                className="flex items-center gap-3 text-sm text-emerald-900"
              >
                <CheckCircle2 size={18} className="flex-shrink-0" />
                <span>{line}</span>
              </motion.div>
            ))}
          </motion.div>

          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.35 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setView("survey")}
            className="w-full bg-emerald-900 hover:bg-emerald-800 text-white font-semibold py-4 rounded-2xl transition-colors flex items-center justify-center gap-2"
          >
            Start Survey <ChevronRight size={20} />
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // THANKS
  if (view === "thanks") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              delay: 0.2,
              type: "spring",
              stiffness: 200,
              damping: 14,
            }}
            className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle2 size={48} className="text-emerald-700" />
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.35 }}
            className="text-3xl font-bold text-emerald-900 mb-3"
          >
            Thank You!
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55, duration: 0.35 }}
            className="text-gray-600 mb-8 leading-relaxed"
          >
            Your response helps us build a tax app that actually works for
            Nigerians like you. We appreciate it.
          </motion.p>
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.35 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={restart}
            className="w-full bg-emerald-900 hover:bg-emerald-800 text-white font-semibold py-3 rounded-2xl transition-colors"
          >
            Take Survey Again
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // SURVEY
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 flex items-center justify-center p-4">
      <div className="max-w-xl w-full">
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <motion.span
              key={q.section}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="text-xs font-semibold text-emerald-700 uppercase tracking-wide"
            >
              {q.section}
            </motion.span>
            <span className="text-xs text-gray-500 font-medium">
              Question {currentQ + 1} of {QUESTIONS.length}
            </span>
          </div>
          <div className="bg-white rounded-full h-2 overflow-hidden shadow-sm">
            <motion.div
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="bg-emerald-700 h-full"
            />
          </div>
        </div>

        <div className="relative">
          <AnimatePresence mode="wait" custom={direction} initial={false}>
            <motion.div
              key={q.id}
              custom={direction}
              variants={cardVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="bg-white rounded-3xl shadow-xl p-6 md:p-8"
            >
              <h2 className="text-lg md:text-xl font-semibold text-gray-900 leading-relaxed mb-6">
                {q.question}
              </h2>

              {q.type === "single" && (
                <motion.div
                  variants={optionsContainer}
                  initial="hidden"
                  animate="show"
                  className="space-y-2"
                >
                  {q.options.map((opt) => {
                    const selected = currentAnswer === opt;
                    return (
                      <motion.button
                        key={opt}
                        variants={optionItem}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => handleAnswer(opt)}
                        className={`w-full text-left p-4 rounded-2xl border-2 transition-colors ${
                          selected
                            ? "border-emerald-700 bg-emerald-50 text-emerald-900 font-medium"
                            : "border-gray-200 hover:border-emerald-300 text-gray-700"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                              selected
                                ? "border-emerald-700 bg-emerald-700"
                                : "border-gray-300"
                            }`}
                          >
                            <AnimatePresence>
                              {selected && (
                                <motion.div
                                  key="dot"
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  exit={{ scale: 0 }}
                                  transition={{
                                    type: "spring",
                                    stiffness: 400,
                                    damping: 18,
                                  }}
                                  className="w-2 h-2 bg-white rounded-full"
                                />
                              )}
                            </AnimatePresence>
                          </div>
                          <span className="text-sm md:text-base">{opt}</span>
                        </div>
                      </motion.button>
                    );
                  })}
                </motion.div>
              )}

              {q.type === "text" && (
                <div>
                  <textarea
                    value={currentAnswer || ""}
                    onChange={(e) => handleAnswer(e.target.value)}
                    maxLength={q.maxLength ?? 500}
                    rows={5}
                    placeholder="Share your thoughts here…"
                    className="w-full p-4 rounded-2xl border-2 border-gray-200 focus:outline-none focus:border-emerald-700 transition-colors resize-none text-sm md:text-base text-gray-800"
                  />
                  <div className="flex justify-between mt-1 px-1 text-xs text-gray-500">
                    <span>Optional — feel free to skip</span>
                    <span>
                      {(currentAnswer || "").length}/{q.maxLength ?? 500}
                    </span>
                  </div>
                </div>
              )}

              {q.type === "scale" && (
                <div>
                  <div className="flex justify-between text-xs md:text-sm text-gray-600 mb-3 px-1">
                    <span>{q.scaleLabels[0]}</span>
                    <span>{q.scaleLabels[1]}</span>
                  </div>
                  <motion.div
                    variants={optionsContainer}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-5 gap-2"
                  >
                    {[1, 2, 3, 4, 5].map((n) => {
                      const selected = currentAnswer === n;
                      return (
                        <motion.button
                          key={n}
                          variants={optionItem}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          animate={
                            selected
                              ? { scale: [1, 1.15, 1.06] }
                              : { scale: 1 }
                          }
                          transition={{ duration: 0.35 }}
                          onClick={() => handleAnswer(n)}
                          className={`aspect-square rounded-2xl border-2 font-bold text-lg md:text-xl transition-colors ${
                            selected
                              ? "border-emerald-700 bg-emerald-700 text-white"
                              : "border-gray-200 hover:border-emerald-300 text-gray-700"
                          }`}
                        >
                          {n}
                        </motion.button>
                      );
                    })}
                  </motion.div>
                </div>
              )}

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex gap-3 mt-8">
                <motion.button
                  whileHover={currentQ > 0 ? { x: -2 } : {}}
                  whileTap={currentQ > 0 ? { scale: 0.97 } : {}}
                  onClick={handleBack}
                  disabled={currentQ === 0}
                  className="px-5 py-3 rounded-2xl font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                >
                  <ChevronLeft size={18} /> Back
                </motion.button>
                <motion.button
                  whileHover={
                    (q.optional || currentAnswer !== undefined) && !submitting
                      ? { scale: 1.02 }
                      : {}
                  }
                  whileTap={
                    (q.optional || currentAnswer !== undefined) && !submitting
                      ? { scale: 0.98 }
                      : {}
                  }
                  onClick={handleNext}
                  disabled={
                    (!q.optional && currentAnswer === undefined) || submitting
                  }
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
                </motion.button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <p className="text-center text-xs text-gray-500 mt-4">
          Anonymous responses
        </p>
      </div>
    </div>
  );
}
