"use client";

import { useEffect, useRef, useState } from "react";

export default function QnAWidget({ context }: { context?: any }) {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, []);

  const ask = async () => {
    if (!question.trim()) return;
    setLoading(true);
    setAnswer(null);
    try {
      const res = await fetch("/api/qa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, context }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to get answer");
      setAnswer(data.answer || "(No answer)");
    } catch (e: any) {
      setAnswer(e.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 rounded-full bg-blue-600 text-white shadow-lg px-4 py-3 text-sm font-medium hover:bg-blue-700"
      >
        Ask Docs’ Doc
      </button>

      {open ? (
        <div
          ref={panelRef}
          className="fixed bottom-6 right-6 z-50 w-[min(100vw-2rem,360px)] rounded-lg border border-black/10 dark:border-white/10 bg-background shadow-xl p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="font-semibold">Q&A Assistant</div>
            <button onClick={() => setOpen(false)} className="text-sm opacity-70 hover:opacity-100">Close</button>
          </div>
          <div className="space-y-2">
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask about this repo"
              className="w-full rounded-md border border-black/10 dark:border-white/15 bg-white/80 dark:bg-white/5 px-3 py-2 text-sm"
            />
            <button
              onClick={ask}
              disabled={loading}
              className="w-full rounded-md bg-blue-600 text-white px-3 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Asking…" : "Ask"}
            </button>
            {answer ? (
              <div className="rounded-md border border-black/10 dark:border-white/10 p-3 text-sm whitespace-pre-wrap max-h-60 overflow-auto">
                {answer}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}


