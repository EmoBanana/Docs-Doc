import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="border-b border-black/10 dark:border-white/10 bg-background sticky top-0 z-40">
      <div className="mx-auto max-w-5xl px-6 py-4 flex items-center justify-between">
        <Link href="/" className="font-semibold text-lg">Docs’ Doc</Link>
        <div className="text-xs opacity-70">
          Demo • No login • No data stored
        </div>
      </div>
    </nav>
  );
}


