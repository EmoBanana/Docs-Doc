"use client";

import { useEffect, useMemo, useState } from "react";
import TabSwitcher from "@/components/TabSwitcher";
import QnABox from "@/components/QnABox";

type RepoData = {
  repo: string;
  readmeText?: string;
  files?: { path: string; content: string }[];
  commits?: any[];
};

export default function ResultsPanel({ repo }: { repo: string }) {
  const [data, setData] = useState<RepoData | null>(null);
  const [summary, setSummary] = useState<string>("");
  const [generatedDocs, setGeneratedDocs] = useState<string>("");
  const [drift, setDrift] = useState<string>("");
  const [active, setActive] = useState("docs");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [translation, setTranslation] = useState<string>("");
  const [language, setLanguage] = useState("Spanish");

  const tabs = useMemo(
    () => [
      { key: "docs", label: "📖 Docs & TL;DR" },
      { key: "auto", label: "✍️ Auto-generated Docs" },
      { key: "maint", label: "🛠️ Maintenance" },
      { key: "trans", label: "🌍 Translation" },
    ],
    []
  );

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/fetch-repo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ repoUrl: repo }),
        });
        const d = await res.json();
        if (!res.ok) throw new Error(d.error || "Failed to fetch repo");
        if (!isMounted) return;
        setData(d);

        // Kick off AI calls in parallel
        void (async () => {
          try {
            const [s, g, c] = await Promise.all([
              fetch("/api/summarise-docs", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: d.readmeText ?? "" }),
              }).then((r) => r.json()),
              fetch("/api/generate-docs", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ context: d }),
              }).then((r) => r.json()),
              fetch("/api/check-doc-drift", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ context: d }),
              }).then((r) => r.json()),
            ]);
            if (s?.summary) setSummary(s.summary);
            if (g?.docs) setGeneratedDocs(g.docs);
            if (c?.drift) setDrift(c.drift);
          } catch (e) {
            // ignore AI errors in demo
          }
        })();
      } catch (e: any) {
        setError(e.message || "Error");
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [repo]);

  const onTranslate = async () => {
    if (!data) return;
    const res = await fetch("/api/translate-docs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: data.readmeText ?? "", language }),
    });
    const json = await res.json();
    setTranslation(json.translated || json.error || "");
  };

  if (loading) return <p className="opacity-70">Loading…</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (!data) return <p>No data.</p>;

  return (
    <div className="space-y-6">
      <TabSwitcher tabs={tabs} onChange={setActive} />

      {active === "docs" ? (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">README</h2>
          <pre className="whitespace-pre-wrap rounded-md border border-black/10 dark:border-white/10 p-4 text-sm">
            {data.readmeText || "(README not found)"}
          </pre>
          <h3 className="text-lg font-semibold">TL;DR</h3>
          <div className="rounded-md border border-black/10 dark:border-white/10 p-4 text-sm whitespace-pre-wrap">
            {summary || "(Summary pending)"}
          </div>
        </div>
      ) : null}

      {active === "auto" ? (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Auto-generated Docs</h2>
          <div className="rounded-md border border-black/10 dark:border-white/10 p-4 text-sm whitespace-pre-wrap">
            {generatedDocs || "(Generating…)"}
          </div>
        </div>
      ) : null}

      {active === "maint" ? (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Doc Drift Detection</h2>
          <div className="rounded-md border border-black/10 dark:border-white/10 p-4 text-sm whitespace-pre-wrap">
            {drift || "(Analysing commits and code…)"}
          </div>
          <h3 className="text-lg font-semibold">Q&A</h3>
          <QnABox context={{ ...data }} />
        </div>
      ) : null}

      {active === "trans" ? (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Translate Docs</h2>
          <div className="flex items-center gap-2">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="rounded-md border border-black/10 dark:border-white/15 bg-white/80 dark:bg-white/5 px-3 py-2"
            >
              {[
                "Spanish",
                "French",
                "German",
                "Portuguese",
                "Japanese",
                "Korean",
              ].map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
            <button
              onClick={onTranslate}
              className="rounded-md bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700"
            >
              Translate
            </button>
          </div>
          <div className="rounded-md border border-black/10 dark:border-white/10 p-4 text-sm whitespace-pre-wrap">
            {translation || "(Select a language and click Translate)"}
          </div>
        </div>
      ) : null}
    </div>
  );
}


