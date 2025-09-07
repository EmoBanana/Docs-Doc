import { GoogleGenerativeAI } from "@google/generative-ai";

function getClient() {
  const apiKey = process.env.GEMINI_API_KEY || "";
  if (!apiKey) {
    // Return a mock-like object for demo so server doesn't crash
    return null;
  }
  return new GoogleGenerativeAI(apiKey);
}

export async function geminiSummarise(text: string) {
  const client = getClient();
  if (!client) return "[Gemini API key not set]";
  const model = client.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
  const prompt = `Summarise the following documentation into a concise TL;DR with bullet points.\n\n${text}`;
  const res = await model.generateContent(prompt);
  return res.response.text();
}

export async function geminiGenerateDocs(context: any) {
  const client = getClient();
  if (!client) return "[Gemini API key not set]";
  const model = client.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
  const withEmojis = Boolean(context?.emoji);
  const style = withEmojis
    ? "Use friendly tone and tasteful emojis where appropriate (e.g., ✅, 📖, 🚀)."
    : "Use a concise, professional tone. Do not include emojis.";
  const hasReadme = Boolean(context?.readmeText && String(context.readmeText).trim().length > 0);
  const modeInstruction = hasReadme
    ? `The repository ALREADY has a README. Produce an UPDATED README with improvements APPLIED DIRECTLY inline (no markers).
AFTER the full updated README, append a new section:
\n## Updates Added\n
List each applied change as concise bullets referencing the updated sections.
Return a single Markdown document that first contains the full updated README, then the Updates Added section. ${style}`
    : `The repository has NO README. Generate a comprehensive starter README based on code + commits.
Return well-structured Markdown that a maintainer can paste directly. Do NOT add any extra preface/header; start directly with the README content (no "Auto-generated Docs" banner). ${style}`;

  const prompt = `You are Docs' Doc.
${modeInstruction}

Context (JSON):\n${JSON.stringify(context).slice(0, 15000)}`;
  const res = await model.generateContent(prompt);
  return res.response.text();
}

export async function geminiDrift(context: any) {
  const client = getClient();
  if (!client) return "[Gemini API key not set]";
  const model = client.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
  const prompt = `Compare README/docs with recent commits and code. Identify outdated or risky sections and propose updates. Keep code snippets minimal.\n\nContext (JSON):\n${JSON.stringify(context).slice(0, 15000)}`;
  const res = await model.generateContent(prompt);
  return res.response.text();
}

export async function geminiQA(question: string, context: any) {
  const client = getClient();
  if (!client) return "[Gemini API key not set]";
  const model = client.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
  const prompt = `Answer the user's question about the repository using the provided context. If unsure, say so.\n\nQuestion: ${question}\n\nContext (JSON):\n${JSON.stringify(context).slice(0, 15000)}`;
  const res = await model.generateContent(prompt);
  return res.response.text();
}

export async function geminiTranslate(text: string, language: string) {
  const client = getClient();
  if (!client) return "[Gemini API key not set]";
  const model = client.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
  const prompt = `Translate the documentation to ${language}. Keep code blocks/snippets unchanged.\n\n${text}`;
  const res = await model.generateContent(prompt);
  return res.response.text();
}


