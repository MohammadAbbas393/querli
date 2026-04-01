import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name, db_type, url } = await req.json()
  if (!name || !db_type || !url) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  // Encrypt the connection URL via the backend
  const backendUrl = process.env.BACKEND_URL ?? 'http://localhost:8001'
  const encRes = await fetch(`${backendUrl}/encrypt`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ value: url }),
  })
  const { encrypted } = await encRes.json()

  const { data, error } = await supabase
    .from('connections')
    .insert({ user_id: user.id, name, db_type, encrypted_url: encrypted })
    .select('id, name, db_type, created_at')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
