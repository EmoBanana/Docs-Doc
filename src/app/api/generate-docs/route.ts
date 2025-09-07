import { NextRequest } from "next/server";
import { geminiGenerateDocs } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const { context } = await req.json();
    const docs = await geminiGenerateDocs(context);
    return Response.json({ docs });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message || "Error" }), {
      status: 500,
    });
  }
}


