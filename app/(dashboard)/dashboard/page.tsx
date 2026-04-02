import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Database, MessageSquare, Clock, ArrowRight, Plus, TrendingUp } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: connections }, { data: recentQueries }, { data: sub }] = await Promise.all([
    supabase.from('connections').select('id, name, db_type, created_at').eq('user_id', user!.id),
    supabase.from('queries').select('*, connections(name)').eq('user_id', user!.id).order('created_at', { ascending: false }).limit(5),
    supabase.from('subscriptions').select('plan, queries_used, queries_limit').eq('user_id', user!.id).single(),
  ])

  const plan = sub?.plan ?? 'free'
  const used = sub?.queries_used ?? 0
  const limit = sub?.queries_limit ?? 50
  const pct = limit === -1 ? 0 : Math.min(100, (used / limit) * 100)

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Overview</h1>
          <p className="text-slate-400 text-sm mt-1">Your database AI agent</p>
        </div>
        <Link href="/query"
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors">
          <MessageSquare className="w-4 h-4" />Ask a question
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
          <div className="w-9 h-9 rounded-lg bg-violet-500/15 border border-violet-500/20 flex items-center justify-center mb-3">
            <Database className="w-5 h-5 text-violet-400" />
          </div>
          <p className="text-2xl font-bold text-white">{connections?.length ?? 0}</p>
          <p className="text-slate-500 text-sm mt-0.5">Connected databases</p>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
          <div className="w-9 h-9 rounded-lg bg-violet-500/15 border border-violet-500/20 flex items-center justify-center mb-3">
            <MessageSquare className="w-5 h-5 text-violet-400" />
          </div>
          <p className="text-2xl font-bold text-white">{used}</p>
          <p className="text-slate-500 text-sm mt-0.5">Queries this month</p>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
          <div className="w-9 h-9 rounded-lg bg-violet-500/15 border border-violet-500/20 flex items-center justify-center mb-3">
            <TrendingUp className="w-5 h-5 text-violet-400" />
          </div>
          <p className="text-2xl font-bold text-white">{limit === -1 ? '∞' : limit - used}</p>
          <p className="text-slate-500 text-sm mt-0.5">Queries remaining</p>
          {limit !== -1 && (
            <div className="mt-2 h-1 bg-slate-800 rounded-full">
              <div className="h-full bg-violet-500 rounded-full" style={{ width: `${pct}%` }} />
            </div>
          )}
        </div>
      </div>

      {/* No connections CTA */}
      {!connections?.length && (
        <div className="bg-slate-900/80 border border-dashed border-slate-700 rounded-xl p-10 text-center mb-8">
          <div className="w-14 h-14 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mx-auto mb-4">
            <Database className="w-7 h-7 text-violet-400" />
          </div>
          <h2 className="text-lg font-semibold text-white mb-2">Connect your first database</h2>
          <p className="text-slate-400 text-sm mb-6 max-w-sm mx-auto">Add a Postgres, MySQL, or SQLite connection and start asking questions in plain English.</p>
          <Link href="/connections"
            className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors">
            <Plus className="w-4 h-4" />Add database
          </Link>
        </div>
      )}

      {/* Recent queries */}
      {(recentQueries?.length ?? 0) > 0 && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />Recent Queries
            </h2>
            <Link href="/history" className="text-violet-400 hover:text-violet-300 text-sm flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-slate-800">
            {recentQueries!.map(q => (
              <div key={q.id} className="px-5 py-3.5">
                <p className="text-sm text-white font-medium truncate">{q.question}</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {(q as any).connections?.name ?? '—'} · {new Date(q.created_at).toLocaleDateString()}
                  {q.execution_ms && ` · ${q.execution_ms}ms`}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
