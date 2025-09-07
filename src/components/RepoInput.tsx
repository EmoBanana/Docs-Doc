"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";

export default function RepoInput() {
  const router = useRouter();
  const [repoUrl, setRepoUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onAnalyse = useCallback(async () => {
    setError(null);
    const trimmed = repoUrl.trim();
    if (!trimmed) {
      setError("Please paste a GitHub repo URL.");
      return;
    }
    try {
      setIsLoading(true);
      // Fire-and-forget: warm the cache/backend; results page will fetch again.
      void fetch("/api/fetch-repo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrl: trimmed }),
      }).catch(() => undefined);
      router.push(`/results?repo=${encodeURIComponent(trimmed)}`);
    } catch (e) {
      setError("Failed to start analysis.");
    } finally {
      setIsLoading(false);
    }
  }, [repoUrl, router]);

  return (
    <div className="w-full">
      <label className="block text-sm font-medium mb-2">GitHub Repository URL</label>
      <div className="flex gap-2 items-center">
        <input
          type="url"
          placeholder="https://github.com/owner/repo"
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
          className="flex-1 rounded-md border border-black/10 dark:border-white/15 bg-white/80 dark:bg-white/5 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={onAnalyse}
          disabled={isLoading}
          className="rounded-md bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? "Analysing…" : "Analyse Repo"}
        </button>
      </div>
      {error ? (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      ) : null}
    </div>
  );
}


