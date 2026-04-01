import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Check quota
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('queries_used, queries_limit')
    .eq('user_id', user.id)
    .single()

  const used = sub?.queries_used ?? 0
  const limit = sub?.queries_limit ?? 50
  if (limit !== -1 && used >= limit) {
    return NextResponse.json({ error: 'Query limit reached. Please upgrade.' }, { status: 402 })
  }

  const { connection_id, question } = await req.json()
  if (!connection_id || !question) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  // Proxy to FastAPI backend
  const backendUrl = process.env.BACKEND_URL ?? 'http://localhost:8001'
  const res = await fetch(`${backendUrl}/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-User-Id': user.id,
    },
    body: JSON.stringify({ connection_id, question, user_id: user.id }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    return NextResponse.json({ error: err.detail ?? 'Query failed' }, { status: res.status })
  }

  const result = await res.json()

  // Increment query usage
  await supabase.from('subscriptions').update({ queries_used: used + 1 }).eq('user_id', user.id)

  // Save to history
  await supabase.from('queries').insert({
    user_id: user.id,
    connection_id,
    question,
    sql: result.sql,
    results: { columns: result.columns, rows: result.rows },
    chart_type: result.chart_type,
    execution_ms: result.execution_ms,
  })

  return NextResponse.json(result)
}
