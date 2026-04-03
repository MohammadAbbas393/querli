import { createClient } from '@/lib/supabase/server'
import { Clock, MessageSquare } from 'lucide-react'
import Link from 'next/link'
import HistoryList from '@/components/HistoryList'

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
          <Link href="/query"
            className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors mt-3">
            <MessageSquare className="w-4 h-4" />Ask your first question
          </Link>
        </div>
      ) : (
        <HistoryList queries={queries as any} />
      )}
    </div>
  )
}
