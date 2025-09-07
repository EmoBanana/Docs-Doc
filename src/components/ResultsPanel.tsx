"use client";

import { useEffect, useMemo, useState } from "react";
import TabSwitcher from "@/components/TabSwitcher";
import QnABox from "@/components/QnABox";
import MarkdownViewer from "@/components/MarkdownViewer";
import EmojiToggle from "@/components/EmojiToggle";
import CopyButton from "@/components/CopyButton";
import QnAWidget from "@/components/QnAWidget";

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
  const [docsSource, setDocsSource] = useState<string>("");
  const [drift, setDrift] = useState<string>("");
  const [emojiOn, setEmojiOn] = useState(true);
  const [active, setActive] = useState("docs");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [translation, setTranslation] = useState<string>("");
  const [language, setLanguage] = useState("English");
  const [genLoading, setGenLoading] = useState<string | null>(null);
  const [hasGeneratedOnce, setHasGeneratedOnce] = useState(false);
  const languages = [
    { label: "English", translating: "Translating...", btn: "Translate", placeholder: "Select a language and click \"Translate\"" },
    { label: "中文", translating: "正在翻译...", btn: "翻译", placeholder: "请选择语言并点击“翻译”" },
    { label: "Melayu", translating: "Sedang menterjemah...", btn: "Terjemah", placeholder: "Sila pilih bahasa dan klik “Terjemah”" },
    { label: "日本語", translating: "翻訳中...", btn: "翻訳", placeholder: "言語を選択して「翻訳」をクリックしてください" },
    { label: "한국어", translating: "번역 중...", btn: "번역", placeholder: "언어를 선택하고 \"번역\"을 클릭하세요" },
    { label: "Español", translating: "Traduciendo...", btn: "Traducir", placeholder: "Selecciona un idioma y haz clic en «Traducir»" },
    { label: "Français", translating: "Traduction en cours...", btn: "Traduire", placeholder: "Sélectionnez une langue et cliquez sur « Traduire »" },
    { label: "Deutsch", translating: "Übersetzung läuft...", btn: "Übersetzen", placeholder: "Wähle eine Sprache und klicke auf „Übersetzen“" },
    { label: "Português", translating: "Traduzindo...", btn: "Traduzir", placeholder: "Selecione um idioma e clique em \"Traduzir\"" },
    { label: "Italiano", translating: "Traduzione in corso...", btn: "Tradurre", placeholder: "Seleziona una lingua e fai clic su \"Tradurre\"" },
  ];

  const tabs = useMemo(
    () => [
      { key: "docs", label: "📖 Docs & TL;DR" },
      { key: "auto", label: "✍️ Docs Assist" },
      { key: "maint", label: "🛠️ Maintenance" },
      { key: "trans", label: "🌍 Translation" },
    ],
    []
  );

  // Fetch static repo context once
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
        // Decide docs source: README or auto-generated if missing
        const hasReadme = Boolean(d?.readmeText && String(d.readmeText).trim().length > 0);
        if (!hasReadme) {
          // Will be set after generation returns, for now note missing
          setDocsSource("");
        } else {
          setDocsSource(d.readmeText);
        }
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

  // Fetch AI artifacts separately to avoid resetting scroll/section
  useEffect(() => {
    if (!data) return;
    let cancelled = false;
    (async () => {
      try {
        const msgBase = hasGeneratedOnce ? "Updating" : "Generating";
        setGenLoading(
          emojiOn ? `${msgBase} docs with emoji...` : `${msgBase} docs without emoji...`
        );
        const baseDoc = docsSource || data.readmeText || "";
        const [s, g, c] = await Promise.all([
          fetch("/api/summarise-docs", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: baseDoc }),
          }).then((r) => r.json()),
          fetch("/api/generate-docs", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ context: { ...data, emoji: emojiOn } }),
          }).then((r) => r.json()),
          fetch("/api/check-doc-drift", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ context: { ...data, readmeText: baseDoc } }),
          }).then((r) => r.json()),
        ]);
        if (cancelled) return;
        if (s?.summary) setSummary(s.summary);
        if (g?.docs) {
          setGeneratedDocs(g.docs);
          const hasReadmeExisting = Boolean(
            data?.readmeText && String(data.readmeText).trim().length > 0
          );
          if (!hasReadmeExisting) {
            // Use generated as primary docs
            setDocsSource(g.docs);
            // Recompute summary based on generated docs for unified source
            try {
              const resSum = await fetch("/api/summarise-docs", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: g.docs }),
              });
              const js = await resSum.json();
              if (resSum.ok && js?.summary) setSummary(js.summary);
            } catch {}
          } else {
            // README exists: do NOT modify Docs. Keep original README in Docs section.
            // The Docs Assist tab will display the updated README with an "Updates Added" section.
          }
        }
        if (c?.drift) setDrift(c.drift);
        setGenLoading(null);
        setHasGeneratedOnce(true);
      } catch {
        // ignore
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [data, emojiOn]);

  const onTranslate = async () => {
    if (!data) return;
    const langConf = languages.find((l) => l.label === language);
    if (langConf) setTranslation(langConf.translating);
    const res = await fetch("/api/translate-docs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: docsSource || data.readmeText || "", language }),
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
          {!data.readmeText || !String(data.readmeText).trim().length ? (
            <>
              <div className="text-sm opacity-70">(README not found)</div>
              <div className="rounded-md border border-black/10 dark:border-white/10 p-4">
                <MarkdownViewer markdown={`## [Auto-generated Docs]\n\n${docsSource || generatedDocs || "Generating..."}`} />
              </div>
            </>
          ) : (
            <div className="rounded-md border border-black/10 dark:border-white/10 p-4">
              <MarkdownViewer markdown={docsSource || data.readmeText} />
            </div>
          )}
          <h3 className="text-lg font-semibold">TL;DR</h3>
          <div className="rounded-md border border-black/10 dark:border-white/10 p-4">
            <MarkdownViewer markdown={summary || "(Summary pending)"} />
          </div>
        </div>
      ) : null}

      {active === "auto" ? (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Docs Assist</h2>
          {data?.readmeText && String(data.readmeText).trim().length ? (
            <div className="flex items-center justify-between">
              <EmojiToggle onChange={setEmojiOn} />
              <CopyButton text={generatedDocs} />
            </div>
          ) : (
            <div className="flex items-center justify-end">
              <CopyButton text={docsSource || generatedDocs} />
            </div>
          )}
          <div className="rounded-md border border-black/10 dark:border-white/10 p-4">
            <MarkdownViewer
              markdown={
                data?.readmeText && String(data.readmeText).trim().length
                  ? (genLoading || generatedDocs || "(Generating…)")
                  : (docsSource || generatedDocs || "(Generating…)")
              }
            />
          </div>
        </div>
      ) : null}

      {active === "maint" ? (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Doc Drift Detection</h2>
          <div className="rounded-md border border-black/10 dark:border-white/10 p-4">
            <MarkdownViewer markdown={drift || "(Analysing commits and code…)"} />
          </div>
          <h3 className="text-lg font-semibold">Q&A</h3>
          <QnABox context={{ ...data, readmeText: docsSource || data.readmeText }} />
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
              {languages.map((l) => (
                <option key={l.label} value={l.label}>
                  {l.label}
                </option>
              ))}
            </select>
            <button
              onClick={onTranslate}
              className="rounded-md bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700"
            >
              {languages.find((l) => l.label === language)?.btn || "Translate"}
            </button>
          </div>
          <div className="rounded-md border border-black/10 dark:border-white/10 p-4">
            <MarkdownViewer
              markdown={
                translation ||
                (languages.find((l) => l.label === language)?.placeholder || "(Select a language and click Translate)")
              }
            />
          </div>
        </div>
      ) : null}

      {/* Floating Q&A has access to repo context */}
      <QnAWidget context={{ ...data, readmeText: docsSource || data.readmeText }} />
    </div>
  );
}


