Docs’ Doc — Prototype
=====================

Smarter, faster, maintainable documentation. Demo-only: stateless, no login, no DB.

Tech
- Next.js App Router + TypeScript
- Tailwind CSS
- API Routes for backend
- GitHub REST API (public repos)
- Gemini API (@google/generative-ai)

Setup
1) Install deps:
```
npm install
```
2) Create `.env.local`:
```
GEMINI_API_KEY=your_key_here
GITHUB_TOKEN=optional_pat_for_higher_rate_limits
```
3) Run dev server:
```
npm run dev
```

Usage
1) Open http://localhost:3000
2) Paste a public GitHub repo URL and click “Analyse Repo”
3) Explore tabs: Docs & TL;DR, Auto-generated Docs, Maintenance, Translation

Notes
- For demo simplicity, only a handful of files/commits are fetched.
- If GEMINI_API_KEY is not set, routes return placeholder messages instead of failing.
