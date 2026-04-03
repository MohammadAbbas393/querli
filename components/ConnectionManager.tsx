'use client'

import { useState } from 'react'
import { Database, Plus, Trash2, Loader2, Link2, RefreshCw } from 'lucide-react'
import Link from 'next/link'

interface Connection {
  id: string
  name: string
  db_type: string
  created_at: string
}

const DB_TYPES = ['postgres', 'mysql', 'sqlite']
const DB_PLACEHOLDERS: Record<string, string> = {
  postgres: 'postgresql://user:password@host:5432/dbname',
  mysql: 'mysql://user:password@host:3306/dbname',
  sqlite: '/absolute/path/to/database.db',
}

export default function ConnectionManager({ connections, connectionsLimit }: {
  connections: Connection[]
  userId?: string
  plan?: string
  connectionsLimit: number
}) {
  const [list, setList] = useState(connections)
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [dbType, setDbType] = useState('postgres')
  const [url, setUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState<string | null>(null)
  const [error, setError] = useState('')

  const atLimit = connectionsLimit !== -1 && list.length >= connectionsLimit

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    const res = await fetch('/api/connections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, db_type: dbType, url }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error ?? 'Failed to save'); setSaving(false); return }
    setList(l => [data, ...l])
    setName(''); setUrl(''); setShowForm(false)
    setSaving(false)
  }

  async function handleDelete(id: string) {
    setDeleting(id)
    await fetch(`/api/connections/${id}`, { method: 'DELETE' })
    setList(l => l.filter(c => c.id !== id))
    setDeleting(null)
  }

  async function handleRefreshSchema(id: string) {
    setRefreshing(id)
    await fetch(`/api/connections/${id}`, { method: 'PATCH' })
    setRefreshing(null)
  }

  return (
    <div>
      {atLimit && (
        <div className="mb-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-4 py-3 text-yellow-400 text-sm">
          You've reached the {connectionsLimit}-connection limit.{' '}
          <Link href="/billing" className="underline">Upgrade for more.</Link>
        </div>
      )}

      {!showForm && (
        <button onClick={() => setShowForm(true)} disabled={atLimit}
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors mb-6">
          <Plus className="w-4 h-4" />Add connection
        </button>
      )}

      {showForm && (
        <form onSubmit={handleAdd} className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 mb-6 space-y-4">
          <h3 className="font-semibold text-white">New database connection</h3>
          <div>
            <label className="block text-sm text-slate-400 mb-1.5">Nickname</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="Production DB"
              className="w-full bg-slate-800 border border-slate-700 text-white px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:border-violet-500 transition-colors" />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1.5">Database type</label>
            <select value={dbType} onChange={e => setDbType(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-white px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:border-violet-500 transition-colors">
              {DB_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1.5">Connection URL</label>
            <input type="text" value={url} onChange={e => setUrl(e.target.value)} required placeholder={DB_PLACEHOLDERS[dbType]}
              className="w-full bg-slate-800 border border-slate-700 text-white px-3 py-2.5 rounded-lg text-sm font-mono focus:outline-none focus:border-violet-500 transition-colors" />
            <p className="text-xs text-slate-500 mt-1">Stored encrypted. Only used for read-only queries.</p>
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <div className="flex gap-2">
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-50">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}Save connection
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="px-4 py-2 border border-slate-700 text-slate-400 hover:text-white rounded-lg text-sm transition-colors">
              Cancel
            </button>
          </div>
        </form>
      )}

      {list.length === 0 && !showForm ? (
        <div className="border border-dashed border-slate-700 rounded-xl p-10 text-center">
          <Database className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-white font-medium mb-1">No databases connected</p>
          <p className="text-slate-500 text-sm">Add your first Postgres, MySQL, or SQLite connection</p>
        </div>
      ) : (
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden">
          <div className="divide-y divide-slate-800">
            {list.map(conn => (
              <div key={conn.id} className="flex items-center px-5 py-4 gap-4">
                <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
                  <Link2 className="w-4 h-4 text-violet-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">{conn.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5 capitalize">{conn.db_type} · Added {new Date(conn.created_at).toLocaleDateString()}</p>
                </div>
                <Link href={`/query?connection=${conn.id}`}
                  className="text-xs text-violet-400 hover:text-violet-300 border border-violet-500/20 px-3 py-1.5 rounded-lg transition-colors">
                  Query
                </Link>
                <button onClick={() => handleRefreshSchema(conn.id)} disabled={refreshing === conn.id}
                  title="Refresh schema cache"
                  className="text-slate-500 hover:text-violet-400 transition-colors disabled:opacity-40">
                  {refreshing === conn.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                </button>
                <button onClick={() => handleDelete(conn.id)} disabled={deleting === conn.id}
                  className="text-slate-500 hover:text-red-400 transition-colors disabled:opacity-40">
                  {deleting === conn.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
