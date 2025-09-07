"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";

export default function MarkdownViewer({ markdown }: { markdown: string }) {
  return (
    <div className="prose prose-neutral max-w-none dark:prose-invert">
      <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>{markdown}</ReactMarkdown>
    </div>
  );
}


