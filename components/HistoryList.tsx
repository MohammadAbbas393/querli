'use client'

import { useState } from 'react'
import { Trash2, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface Query {
  id: string
  question: string
  sql: string | null
  results: any
  execution_ms: number | null
  connection_id: string
  created_at: string
  connections: { name: string } | null
}

export default function HistoryList({ queries }: { queries: Query[] }) {
  const [list, setList] = useState(queries)
  const [deleting, setDeleting] = useState<string | null>(null)

  async function handleDelete(id: string) {
    setDeleting(id)
    await fetch(`/api/history/${id}`, { method: 'DELETE' })
    setList(l => l.filter(q => q.id !== id))
    setDeleting(null)
  }

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden">
      <div className="divide-y divide-slate-800">
        {list.map(q => {
          const rowCount = (q.results as any)?.rows?.length ?? 0
          return (
            <div key={q.id} className="px-5 py-4">
              <div className="flex items-start justify-between gap-4">
                <p className="text-sm font-medium text-white">{q.question}</p>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs text-slate-500">{new Date(q.created_at).toLocaleDateString()}</span>
                  <button onClick={() => handleDelete(q.id)} disabled={deleting === q.id}
                    className="text-slate-600 hover:text-red-400 transition-colors disabled:opacity-40">
                    {deleting === q.id
                      ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      : <Trash2 className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
              {q.sql && (
                <pre className="mt-2 text-xs font-mono text-cyan-300/70 bg-slate-800/40 rounded px-3 py-2 overflow-x-auto line-clamp-2">{q.sql}</pre>
              )}
              <div className="flex items-center gap-3 mt-2">
                <span className="text-xs text-slate-500">{q.connections?.name ?? '—'}</span>
                {q.execution_ms && <span className="text-xs text-slate-600">{q.execution_ms}ms</span>}
                {rowCount > 0 && <span className="text-xs text-slate-600">{rowCount} rows</span>}
                <Link href={`/query?question=${encodeURIComponent(q.question)}&connection=${q.connection_id}`}
                  className="text-xs text-violet-400 hover:text-violet-300 ml-auto">Re-run →</Link>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
