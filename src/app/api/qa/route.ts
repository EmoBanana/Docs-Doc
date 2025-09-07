import { NextRequest } from "next/server";
import { geminiQA } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const { question, context } = await req.json();
    if (!question) {
      return new Response(JSON.stringify({ error: "question is required" }), {
        status: 400,
      });
    }
    const answer = await geminiQA(String(question), context);
    return Response.json({ answer });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message || "Error" }), {
      status: 500,
    });
  }
}


