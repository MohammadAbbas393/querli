import { createClient } from '@/lib/supabase/server'
import QueryInterface from '@/components/QueryInterface'

export default async function QueryPage({ searchParams }: { searchParams: { connection?: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: connections }, { data: sub }] = await Promise.all([
    supabase.from('connections').select('id, name, db_type').eq('user_id', user!.id),
    supabase.from('subscriptions').select('queries_used, queries_limit').eq('user_id', user!.id).single(),
  ])

  const used = sub?.queries_used ?? 0
  const limit = sub?.queries_limit ?? 50
  const hasQuota = limit === -1 || used < limit

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Ask a Question</h1>
        <p className="text-slate-400 text-sm mt-1">Type in plain English — get SQL + results</p>
      </div>
      <QueryInterface
        connections={connections ?? []}
        defaultConnectionId={searchParams.connection}
        hasQuota={hasQuota}
        queriesUsed={used}
        queriesLimit={limit}
        userId={user!.id}
      />
    </div>
  )
}
