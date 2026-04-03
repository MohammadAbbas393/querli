'use client'

import { useState, useEffect } from 'react'
import { Loader2, RefreshCw } from 'lucide-react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

interface Connection { id: string; name: string; db_type: string }

interface InsightCard {
  title: string
  question: string
  chart: 'bar' | 'line' | 'table'
}

const INSIGHTS: InsightCard[] = [
  { title: 'Top 10 Customers by Spending', question: 'top 10 customers by total order spending', chart: 'bar' },
  { title: 'Revenue by Month', question: 'total revenue per month ordered by month', chart: 'line' },
  { title: 'Orders by Status', question: 'count of orders grouped by status', chart: 'bar' },
  { title: 'Top Products Sold', question: 'top 10 products by total quantity sold', chart: 'bar' },
  { title: 'Employees by Department', question: 'count of employees by department', chart: 'bar' },
  { title: 'Open Support Tickets by Priority', question: 'count of open support tickets grouped by priority', chart: 'bar' },
]

interface ChartResult {
  columns: string[]
  rows: any[][]
  sql: string
}

function isNumeric(v: any) { return v !== null && v !== '' && !isNaN(Number(v)) }

function InsightChart({ title, question, chart, connId }: InsightCard & { connId: string }) {
  const [data, setData] = useState<ChartResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)

  async function load() {
    setLoading(true)
    setFailed(false)
    const res = await fetch('/api/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ connection_id: connId, question }),
    })
    if (!res.ok) { setFailed(true); setLoading(false); return }
    const d = await res.json()
    setData(d)
    setLoading(false)
  }

  useEffect(() => { load() }, [connId])

  const chartData = data?.rows.map(row => {
    const obj: Record<string, any> = {}
    data.columns.forEach((col, i) => { obj[col] = row[i] })
    return obj
  }) ?? []

  const labelCol = data?.columns[0]
  const valueCol = data ? data.columns.find((_, i) => data.rows.length > 0 && isNumeric(data.rows[0][i]) && i > 0) : null

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        <button onClick={load} className="text-slate-500 hover:text-slate-300 transition-colors">
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="px-4 py-4">
        {loading && (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="w-5 h-5 text-slate-500 animate-spin" />
          </div>
        )}
        {failed && (
          <div className="flex items-center justify-center h-40 text-slate-500 text-sm">
            No data available
          </div>
        )}
        {!loading && !failed && data && chartData.length > 0 && valueCol && (
          <ResponsiveContainer width="100%" height={200}>
            {chart === 'line' ? (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey={labelCol} tick={{ fill: '#64748b', fontSize: 10 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', color: '#fff', fontSize: 11 }} />
                <Line type="monotone" dataKey={valueCol} stroke="#8b5cf6" strokeWidth={2} dot={false} />
              </LineChart>
            ) : (
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey={labelCol} tick={{ fill: '#64748b', fontSize: 10 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', color: '#fff', fontSize: 11 }} />
                <Bar dataKey={valueCol} fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        )}
        {!loading && !failed && data && chartData.length === 0 && (
          <div className="flex items-center justify-center h-40 text-slate-500 text-sm">No data yet</div>
        )}
      </div>
    </div>
  )
}

export default function InsightsDashboard({ connections }: { connections: Connection[] }) {
  const [connId, setConnId] = useState(connections[0]?.id ?? '')

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <label className="text-sm text-slate-400 shrink-0">Database</label>
        <select value={connId} onChange={e => setConnId(e.target.value)}
          className="bg-slate-800 border border-slate-700 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-violet-500 transition-colors">
          {connections.map(c => <option key={c.id} value={c.id}>{c.name} ({c.db_type})</option>)}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {INSIGHTS.map(insight => (
          <InsightChart key={insight.title} {...insight} connId={connId} />
        ))}
      </div>
    </div>
  )
}
