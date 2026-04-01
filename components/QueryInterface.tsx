'use client'

import { useState } from 'react'
import { Send, Loader2, Database, BarChart2, Table, AlertCircle } from 'lucide-react'
import Link from 'next/link'

interface Connection { id: string; name: string; db_type: string }

interface QueryResult {
  sql: string
  columns: string[]
  rows: any[][]
  chart_type: string | null
  execution_ms: number
  summary?: string
}

export default function QueryInterface({ connections, defaultConnectionId, hasQuota, queriesUsed, queriesLimit, userId }: {
  connections: Connection[]
  defaultConnectionId?: string
  hasQuota: boolean
  queriesUsed: number
  queriesLimit: number
  userId: string
}) {
  const [connId, setConnId] = useState(defaultConnectionId ?? connections[0]?.id ?? '')
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<QueryResult | null>(null)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!connId || !question.trim()) return
    setLoading(true)
    setError('')
    setResult(null)

    const res = await fetch('/api/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ connection_id: connId, question }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error ?? 'Query failed'); setLoading(false); return }
    setResult(data)
    setLoading(false)
  }

  if (connections.length === 0) {
    return (
      <div className="border border-dashed border-slate-700 rounded-xl p-10 text-center">
        <Database className="w-10 h-10 text-slate-600 mx-auto mb-3" />
        <p className="text-white font-medium mb-1">No databases connected</p>
        <Link href="/dashboard/connections"
          className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors mt-3">
          Add a database
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Quota */}
      {!hasQuota && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 flex items-center gap-3 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          You've used all {queriesLimit} queries this month.{' '}
          <Link href="/dashboard/billing" className="underline font-medium">Upgrade for more →</Link>
        </div>
      )}
      {hasQuota && queriesLimit !== -1 && (
        <p className="text-xs text-slate-500">{queriesUsed} / {queriesLimit} queries used this month</p>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
        <div>
          <label className="block text-sm text-slate-400 mb-1.5">Database</label>
          <select value={connId} onChange={e => setConnId(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 text-white px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:border-violet-500 transition-colors">
            {connections.map(c => <option key={c.id} value={c.id}>{c.name} ({c.db_type})</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1.5">Your question</label>
          <textarea
            value={question}
            onChange={e => setQuestion(e.target.value)}
            rows={3}
            placeholder="What are the top 5 customers by total revenue this month?"
            className="w-full bg-slate-800 border border-slate-700 text-white px-3 py-2.5 rounded-lg text-sm resize-none focus:outline-none focus:border-violet-500 transition-colors placeholder-slate-600"
          />
        </div>
        <button type="submit" disabled={loading || !hasQuota || !question.trim()}
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          {loading ? 'Generating…' : 'Ask'}
        </button>
      </form>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />{error}
        </div>
      )}

      {result && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden">
          {/* SQL */}
          <div className="border-b border-slate-800 px-5 py-4">
            <p className="text-xs text-slate-500 mb-2 flex items-center gap-1.5">Generated SQL · {result.execution_ms}ms</p>
            <pre className="text-xs font-mono text-cyan-300 bg-slate-800/60 rounded-lg px-4 py-3 overflow-x-auto">{result.sql}</pre>
          </div>

          {/* Summary */}
          {result.summary && (
            <div className="px-5 py-3 border-b border-slate-800">
              <p className="text-sm text-slate-300">{result.summary}</p>
            </div>
          )}

          {/* Results table */}
          {result.rows.length > 0 && (
            <div className="overflow-x-auto">
              <div className="px-5 py-3 flex items-center gap-2 text-xs text-slate-500">
                <Table className="w-3.5 h-3.5" />{result.rows.length} rows
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800">
                    {result.columns.map(col => (
                      <th key={col} className="px-5 py-2.5 text-left text-xs font-medium text-slate-400">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {result.rows.slice(0, 50).map((row, i) => (
                    <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                      {row.map((cell, j) => (
                        <td key={j} className="px-5 py-2.5 text-slate-300 text-xs">{String(cell ?? '')}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {result.rows.length > 50 && (
                <p className="px-5 py-3 text-xs text-slate-500">Showing first 50 of {result.rows.length} rows</p>
              )}
            </div>
          )}

          {result.rows.length === 0 && (
            <div className="px-5 py-6 text-center text-slate-500 text-sm">No results returned</div>
          )}
        </div>
      )}
    </div>
  )
}
