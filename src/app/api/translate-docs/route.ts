import { NextRequest } from "next/server";
import { geminiTranslate } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const { text, language } = await req.json();
    const translated = await geminiTranslate(String(text || ""), String(language || "Spanish"));
    return Response.json({ translated });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message || "Error" }), {
      status: 500,
    });
  }
}


