import { NextRequest } from "next/server";
import { geminiDrift } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const { context } = await req.json();
    const drift = await geminiDrift(context);
    return Response.json({ drift });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message || "Error" }), {
      status: 500,
    });
  }
}


