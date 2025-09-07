"use client";

import { useState } from "react";

export default function QnABox({
  context,
}: {
  context: {
    readmeText?: string;
    files?: { path: string; content: string }[];
    commits?: any[];
    repo?: string;
  };
}) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ask = async () => {
    setError(null);
    setAnswer(null);
    if (!question.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/qa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, context }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to get answer");
      setAnswer(data.answer || "(No answer)");
    } catch (e: any) {
      setError(e.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-3">
      <div className="flex gap-2 items-center">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a question about this repo"
          className="flex-1 rounded-md border border-black/10 dark:border-white/15 bg-white/80 dark:bg-white/5 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={ask}
          disabled={loading}
          className="rounded-md bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Asking…" : "Ask"}
        </button>
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {answer ? (
        <div className="rounded-md border border-black/10 dark:border-white/10 p-4 whitespace-pre-wrap text-sm">
          {answer}
        </div>
      ) : null}
    </div>
  );
}


