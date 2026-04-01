import { createClient } from '@/lib/supabase/server'
import { Clock, MessageSquare } from 'lucide-react'
import Link from 'next/link'

export default async function HistoryPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: queries } = await supabase
    .from('queries')
    .select('*, connections(name)')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-2xl font-bold text-white mb-6">Query History</h1>

      {!queries?.length ? (
        <div className="border border-dashed border-slate-700 rounded-xl p-10 text-center">
          <Clock className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-white font-medium mb-1">No queries yet</p>
          <Link href="/dashboard/query"
            className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors mt-3">
            <MessageSquare className="w-4 h-4" />Ask your first question
          </Link>
        </div>
      ) : (
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden">
          <div className="divide-y divide-slate-800">
            {queries.map(q => {
              const results = q.results as any ?? {}
              const rowCount = results.rows?.length ?? 0
              return (
                <div key={q.id} className="px-5 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <p className="text-sm font-medium text-white">{q.question}</p>
                    <span className="text-xs text-slate-500 shrink-0">{new Date(q.created_at).toLocaleDateString()}</span>
                  </div>
                  {q.sql && (
                    <pre className="mt-2 text-xs font-mono text-cyan-300/70 bg-slate-800/40 rounded px-3 py-2 overflow-x-auto line-clamp-2">{q.sql}</pre>
                  )}
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-slate-500">{(q as any).connections?.name ?? '—'}</span>
                    {q.execution_ms && <span className="text-xs text-slate-600">{q.execution_ms}ms</span>}
                    {rowCount > 0 && <span className="text-xs text-slate-600">{rowCount} rows</span>}
                    <Link href={`/dashboard/query?question=${encodeURIComponent(q.question)}&connection=${q.connection_id}`}
                      className="text-xs text-violet-400 hover:text-violet-300 ml-auto">Re-run →</Link>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
