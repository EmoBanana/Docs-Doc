import { NextRequest } from "next/server";
import { geminiSummarise } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();
    const summary = await geminiSummarise(String(text || ""));
    return Response.json({ summary });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message || "Error" }), {
      status: 500,
    });
  }
}


