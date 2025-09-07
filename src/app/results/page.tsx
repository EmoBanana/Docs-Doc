import ResultsPanel from "@/components/ResultsPanel";

export default function ResultsPage({
  searchParams,
}: {
  searchParams: { repo?: string; demo?: string };
}) {
  const repo = searchParams.repo || "https://github.com/vercel/next.js";
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-6 py-10 space-y-6">
        <header>
          <h1 className="text-2xl font-semibold">Results</h1>
          <p className="text-sm opacity-70 break-all">{repo}</p>
        </header>
        <ResultsPanel repo={repo} />
      </div>
    </main>
  );
}


