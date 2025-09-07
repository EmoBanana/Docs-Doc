export type RepoFile = { path: string; content: string };

export async function fetchRepoBasics(repoUrl: string, token?: string) {
  // Very naive parsing: https://github.com/{owner}/{repo}
  const match = repoUrl.match(/github\.com\/(.+?)\/(.+?)(?:$|\?|#|\/)/i);
  if (!match) throw new Error("Invalid GitHub repo URL");
  const owner = match[1];
  const repo = match[2];

  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
  };
  if (token) headers.Authorization = `token ${token}`;
  headers["X-GitHub-Api-Version"] = "2022-11-28";
  headers["User-Agent"] = "docsdoc-app";

  // fetch default branch
  const repoResp = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
    headers,
    cache: "no-store",
  });
  const repoJson = await repoResp.json();
  if (!repoResp.ok) throw new Error(repoJson?.message || "GitHub repo fetch failed");
  const defaultBranch = repoJson.default_branch as string;

  // get README
  const readmeResp = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/readme`,
    { headers, cache: "no-store" }
  );
  let readmeText = "";
  if (readmeResp.ok) {
    const readmeJson = await readmeResp.json();
    if (readmeJson?.content) {
      try {
        readmeText = Buffer.from(readmeJson.content, "base64").toString("utf-8");
      } catch {
        readmeText = "";
      }
    }
  }

  // get a few recent commits
  const commitsResp = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/commits?sha=${defaultBranch}&per_page=5`,
    { headers, cache: "no-store" }
  );
  const commits = commitsResp.ok ? await commitsResp.json() : [];

  // get code files (limit: list root and fetch a few files only)
  const treeResp = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`,
    { headers, cache: "no-store" }
  );
  const treeJson = await treeResp.json();
  const files: RepoFile[] = [];
  if (treeResp.ok && Array.isArray(treeJson?.tree)) {
    const codeLike = treeJson.tree
      .filter((n: any) => n.type === "blob")
      .filter((n: any) => /\.(ts|tsx|js|jsx|py|go|rb|java|md)$/i.test(n.path))
      .slice(0, 8); // limit for demo

    for (const node of codeLike) {
      const fileResp = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(node.path)}`,
        { headers, cache: "no-store" }
      );
      if (!fileResp.ok) continue;
      const fjson = await fileResp.json();
      const content = fjson?.content
        ? Buffer.from(fjson.content, "base64").toString("utf-8")
        : "";
      files.push({ path: node.path, content });
    }
  }

  return { repo: `${owner}/${repo}`, defaultBranch, readmeText, commits, files };
}


