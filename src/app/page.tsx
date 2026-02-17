import Link from "next/link";
import { loadAllDocs, searchDocs } from "@/lib/memory";

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; file?: string }>;
}) {
  const sp = await searchParams ?? {};
  const q = sp.q ?? "";
  const file = sp.file ?? "all";

  const [docs, hits] = await Promise.all([
    loadAllDocs(),
    searchDocs({ q, file }),
  ]);

  const files = [
    { value: "all", label: "All files" },
    ...docs.map((d) => ({ value: d.relPath, label: d.relPath })),
  ].filter(
    (v, i, arr) => arr.findIndex((x) => x.value === v.value) === i,
  );

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-black dark:text-zinc-50">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <header className="mb-6 flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">Second Brain</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Zero-friction capture in chat. Fast retrieval here.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-[320px_1fr]">
          {/* Sidebar */}
          <aside className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <form className="space-y-3" action="/" method="get">
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  Search
                </label>
                <input
                  name="q"
                  defaultValue={q}
                  placeholder='e.g. "code reviewer"'
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-800 dark:bg-black"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  File
                </label>
                <select
                  name="file"
                  defaultValue={file}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-800 dark:bg-black"
                >
                  {files.map((f) => (
                    <option key={f.value} value={f.value}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-black dark:hover:bg-white"
              >
                Search
              </button>

              <div className="pt-3 text-xs text-zinc-500 dark:text-zinc-500">
                <div>
                  Indexed: <span className="font-medium">{docs.length}</span> files
                </div>
                <div>
                  Matches: <span className="font-medium">{hits.length}</span>
                </div>
              </div>
            </form>

            <div className="mt-6">
              <div className="mb-2 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                Tips
              </div>
              <ul className="list-disc space-y-1 pl-4 text-xs text-zinc-500 dark:text-zinc-500">
                <li>Use this dashboard for full-text search (no OpenAI costs).</li>
                <li>Your long-term notes live in <code>MEMORY.md</code>.</li>
                <li>Daily logs live in <code>memory/*.md</code>.</li>
              </ul>
            </div>
          </aside>

          {/* Results */}
          <main className="space-y-3">
            {hits.length === 0 ? (
              <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-sm text-zinc-600 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
                No results.
              </div>
            ) : (
              hits.map((h) => (
                <Link
                  key={h.doc.id}
                  href={`/m/${h.doc.id}`}
                  className="block rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-600"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold">{h.doc.title}</div>
                      <div className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-500">
                        {h.doc.relPath}
                        {h.doc.date ? ` • ${h.doc.date}` : ""}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 whitespace-pre-wrap text-xs leading-5 text-zinc-600 dark:text-zinc-400">
                    {h.snippet}
                  </div>
                </Link>
              ))
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
