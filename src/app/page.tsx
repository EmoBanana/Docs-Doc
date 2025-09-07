import RepoInput from "@/components/RepoInput";

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <header className="mb-10">
          <h1 className="text-3xl font-bold">Docs’ Doc</h1>
          <p className="mt-2 text-sm opacity-80">Make documentation smarter, faster, and maintainable.</p>
        </header>
        <RepoInput />
      </div>
    </main>
  );
}
