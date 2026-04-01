import { createClient } from '@/lib/supabase/server'
import ConnectionManager from '@/components/ConnectionManager'

export default async function ConnectionsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: connections }, { data: sub }] = await Promise.all([
    supabase.from('connections').select('id, name, db_type, created_at').eq('user_id', user!.id).order('created_at', { ascending: false }),
    supabase.from('subscriptions').select('plan, connections_limit').eq('user_id', user!.id).single(),
  ])

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Connections</h1>
        <p className="text-slate-400 text-sm mt-1">Manage your database connections</p>
      </div>
      <ConnectionManager
        connections={connections ?? []}
        userId={user!.id}
        plan={sub?.plan ?? 'free'}
        connectionsLimit={sub?.connections_limit ?? 1}
      />
    </div>
  )
}
