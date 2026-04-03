import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Database } from 'lucide-react'
import InsightsDashboard from '@/components/InsightsDashboard'

export default async function InsightsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: connections } = await supabase
    .from('connections')
    .select('id, name, db_type')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Insights</h1>
        <p className="text-slate-400 text-sm mt-1">Auto-generated charts from your database</p>
      </div>

      {!connections?.length ? (
        <div className="border border-dashed border-slate-700 rounded-xl p-10 text-center">
          <Database className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-white font-medium mb-1">No databases connected</p>
          <Link href="/connections"
            className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors mt-3">
            Add a database
          </Link>
        </div>
      ) : (
        <InsightsDashboard connections={connections} />
      )}
    </div>
  )
}
