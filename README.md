Track 3 - Fix the Docs

Docs’ Doc — Smarter Docs for GitHub Repos
=========================================

Docs’ Doc is a lightweight Next.js prototype that turns any public GitHub repo into clean, readable documentation with AI help. Paste a repo URL and instantly browse the README, TL;DR, change suggestions, translations, and ask questions.

Features
--------

### Simplify writing
- Auto-generate README when missing: Builds a comprehensive README from code + recent commits. In the Docs tab, a small notice shows “(README not found)” and the content is presented with an “Auto-generated Docs” header for clarity.
- Docs Assist: For repos that already have a README, generates an updated README (changes applied inline) and appends an “Updates Added” section listing the applied improvements. The original README in the Docs tab remains unchanged; the updated document appears in the Docs Assist tab and can be copied as Markdown.
- Emoji toggle (persistent): Optionally add or remove tasteful emojis in generated content. The button shows an active state when enabled.
- Copy Markdown: One-click copy of generated/assisted docs to paste back into GitHub.

### Speed up reading
- GitHub-like Markdown rendering: `react-markdown` + `remark-gfm` + `remark-breaks` with Tailwind Typography (`prose`) for proper headers, lists, code blocks, tables, and preserved line breaks.
- TL;DR summaries: Concise summaries of the primary docs (README or generated README).
- Translation panel: Localized language names (e.g., “中文”, “Español”), localized placeholders (e.g., “正在翻译...”); translated output preserves Markdown.
- Floating Q&A assistant: Ask questions about the repo from anywhere; inline Q&A available in Maintenance.

### Make maintenance easy
- Repo fetch + parsing: Pulls README (if any), a small set of files, and recent commits via the GitHub REST API.
- Doc drift detection: Compares README against commits/code and suggests areas that may be outdated.
- Unified source logic: If no README exists, the generated README becomes the base for TL;DR, Translation, and Q&A.
- Smooth partial refresh: Toggling emojis or translating only re-renders the relevant content area; tab and scroll are preserved.

Tech Stack
----------
- Next.js (App Router, TypeScript)
- Tailwind CSS (+ Typography plugin)
- Backend via Next.js API routes
- GitHub REST API (public repos)
- Google Gemini (`@google/generative-ai`)

Getting Started
---------------

1) Install dependencies
```bash
npm install
```

2) Configure environment variables (create `.env.local` in the repo root)
```bash
GEMINI_API_KEY=your_key_here          # Required for AI features
GITHUB_TOKEN=optional_pat_here        # Optional, raises GitHub rate limits
```
Notes:
- `.env*` is already in `.gitignore`; your keys won’t be committed.
- Restart the dev server after editing environment variables.

3) Run the dev server
```bash
npm run dev
```
Open `http://localhost:3000`.

Usage
-----
1) Paste a public GitHub repo URL (e.g., `https://github.com/owner/repo`) and click “Analyse Repo”.
2) Explore tabs:
   - Docs & TL;DR: README (or generated README) and a concise summary.
   - Docs Assist: Updated README with improvements applied inline and an “Updates Added” section.
   - Maintenance: Doc drift detection and inline Q&A.
   - Translation: Choose a language by its native name; translation preserves Markdown.

Environment & Keys
------------------
- GEMINI_API_KEY: Required for summarisation, generation, translation, drift analysis, and Q&A.
- GITHUB_TOKEN: Optional personal access token (classic); useful for higher rate limits on GitHub API calls.

API Overview
------------
- `POST /api/fetch-repo` — Fetch README, recent commits, and a small subset of files.
- `POST /api/generate-docs` — Generate README when missing, or produce an updated README with an appended “Updates Added” section.
- `POST /api/summarise-docs` — TL;DR of the current docs source.
- `POST /api/check-doc-drift` — Compare README/docs with recent commits/code.
- `POST /api/qa` — Q&A over repo context.
- `POST /api/translate-docs` — Translate docs to the selected language while preserving code blocks.

Design Choices & Limits
-----------------------
- Prototype-first: Minimal state (no DB); outputs are generated on demand.
- Small repos: Only a handful of files and recent commits are fetched to keep responses snappy.
- Partial refresh UX: Content sections update without page reloads.

Project Structure (high level)
------------------------------
- `src/app/` — App Router pages and API routes
- `src/components/` — UI components (`RepoInput`, `ResultsPanel`, `MarkdownViewer`, `EmojiToggle`, `CopyButton`, `QnABox`, `QnAWidget`, `TabSwitcher`)
- `src/lib/` — Integrations (`github.ts`, `gemini.ts`)

Troubleshooting
---------------
- “API key not set”: Ensure `GEMINI_API_KEY` is in `.env.local` and restart `npm run dev`.
- “API rate limit exceeded”: Add `GITHUB_TOKEN` to `.env.local` for higher GitHub limits.
- Markdown looks plain: Ensure the dev server restarted after installing `@tailwindcss/typography`.

License
-------
MIT
