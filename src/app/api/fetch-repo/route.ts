import { NextRequest } from "next/server";
import { fetchRepoBasics } from "@/lib/github";

export async function POST(req: NextRequest) {
  try {
    const { repoUrl } = await req.json();
    if (!repoUrl) {
      return new Response(JSON.stringify({ error: "repoUrl is required" }), {
        status: 400,
      });
    }
    const token = process.env.GITHUB_TOKEN;
    const data = await fetchRepoBasics(repoUrl, token);
    return Response.json(data);
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message || "Error" }), {
      status: 500,
    });
  }
}


