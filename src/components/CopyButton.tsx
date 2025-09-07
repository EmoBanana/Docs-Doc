"use client";

import { useState } from "react";

export default function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  };

  return (
    <button
      onClick={onCopy}
      className="rounded-md bg-gray-800 text-white px-3 py-1.5 text-xs font-medium shadow-sm hover:bg-gray-700"
    >
      {copied ? "Copied!" : "Copy Markdown"}
    </button>
  );
}


