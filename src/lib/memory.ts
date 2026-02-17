import fs from "node:fs/promises";
import path from "node:path";

export type MemoryDoc = {
  id: string; // base64url of relPath
  relPath: string;
  title: string;
  date: string | null; // YYYY-MM-DD
  updatedAtMs: number;
  content: string;
};

const WORKSPACE_DIR = "/data/.openclaw/workspace";
const MEMORY_ROOT = path.join(WORKSPACE_DIR);

function base64UrlEncode(input: string): string {
  return Buffer.from(input, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function base64UrlDecode(input: string): string {
  const pad = input.length % 4 === 0 ? "" : "=".repeat(4 - (input.length % 4));
  const b64 = input.replace(/-/g, "+").replace(/_/g, "/") + pad;
  return Buffer.from(b64, "base64").toString("utf8");
}

export function docIdFromRelPath(relPath: string): string {
  return base64UrlEncode(relPath);
}

export function relPathFromDocId(id: string): string {
  return base64UrlDecode(id);
}

function extractTitle(markdown: string, fallback: string): string {
  const lines = markdown.split(/\r?\n/);
  const h1 = lines.find((l) => l.trim().startsWith("# "));
  if (h1) return h1.trim().slice(2).trim();
  return fallback;
}

function extractDateFromRelPath(relPath: string): string | null {
  const m = relPath.match(/(\d{4}-\d{2}-\d{2})/);
  return m ? m[1] : null;
}

async function listMemoryFiles(): Promise<string[]> {
  const files: string[] = [];

  // Long-term memory
  files.push("MEMORY.md");

  // Daily / topical memory vault
  try {
    const dir = path.join(MEMORY_ROOT, "memory");
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const e of entries) {
      if (e.isFile() && e.name.endsWith(".md")) {
        files.push(path.join("memory", e.name));
      }
    }
  } catch {
    // No memory dir yet
  }

  return files;
}

export async function loadAllDocs(): Promise<MemoryDoc[]> {
  const relPaths = await listMemoryFiles();

  const docs = await Promise.all(
    relPaths.map(async (relPath) => {
      const absPath = path.join(MEMORY_ROOT, relPath);
      const [content, stat] = await Promise.all([
        fs.readFile(absPath, "utf8"),
        fs.stat(absPath),
      ]);

      const title = extractTitle(content, path.basename(relPath));
      const date = extractDateFromRelPath(relPath);

      return {
        id: docIdFromRelPath(relPath),
        relPath,
        title,
        date,
        updatedAtMs: stat.mtimeMs,
        content,
      } satisfies MemoryDoc;
    }),
  );

  // Newest first
  docs.sort((a, b) => b.updatedAtMs - a.updatedAtMs);
  return docs;
}

export type SearchHit = {
  doc: Omit<MemoryDoc, "content">;
  snippet: string;
};

export async function searchDocs(params: {
  q?: string;
  file?: string;
}): Promise<SearchHit[]> {
  const { q, file } = params;
  const docs = await loadAllDocs();

  const needle = (q ?? "").trim().toLowerCase();

  const filtered = docs.filter((d) => {
    if (file && file !== "all" && d.relPath !== file) return false;
    if (!needle) return true;
    return d.content.toLowerCase().includes(needle);
  });

  return filtered.map((d) => {
    const lc = d.content.toLowerCase();
    let snippet = d.content.slice(0, 240);
    if (needle) {
      const idx = lc.indexOf(needle);
      if (idx >= 0) {
        const start = Math.max(0, idx - 80);
        const end = Math.min(d.content.length, idx + needle.length + 160);
        snippet = d.content.slice(start, end);
        if (start > 0) snippet = `…${snippet}`;
        if (end < d.content.length) snippet = `${snippet}…`;
      }
    }

    const { content: _content, ...meta } = d;
    return { doc: meta, snippet };
  });
}
