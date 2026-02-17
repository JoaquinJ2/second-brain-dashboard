import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { loadAllDocs, relPathFromDocId } from "@/lib/memory";

function formatDate(ms: number): string {
  try {
    return new Date(ms).toLocaleString("es-ES", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return String(ms);
  }
}

export default async function MemoryDocPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Safety: only allow ids that map to known docs
  const relPath = relPathFromDocId(id);
  const docs = await loadAllDocs();
  const doc = docs.find((d) => d.relPath === relPath);

  if (!doc) {
    return (
      <div className="min-h-screen bg-zinc-50 p-8 text-zinc-950 dark:bg-black dark:text-zinc-50">
        <div className="mx-auto max-w-3xl">
          <Link href="/" className="text-sm text-zinc-600 hover:underline dark:text-zinc-400">
            ← Back
          </Link>
          <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <div className="text-sm">Not found.</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-black dark:text-zinc-50">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <Link href="/" className="text-sm text-zinc-600 hover:underline dark:text-zinc-400">
          ← Back
        </Link>

        <header className="mt-6 flex flex-row justify-between items-start">
          <h1 className="text-2xl font-semibold tracking-tight">{doc.title}</h1>
          <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
            {doc.relPath} • updated {formatDate(doc.updatedAtMs)}
          </div>
        </header>

        <article className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <pre className="whitespace-pre-wrap text-sm leading-6 text-zinc-800 dark:text-zinc-200">
            {doc.content}
          </pre>
        </article>
      </div>
    </div>
  );
}
