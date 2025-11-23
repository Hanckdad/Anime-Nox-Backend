import { supabase, corsHeaders, validateAuth } from '../../../../lib/utils'

export default async function handler(req, res) {
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value)
  })

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  const user = await validateAuth(req)
  if (!user) {
    return res.status(401).json({ success: false, error: 'Unauthorized' })
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Get favorites count
    const { count: favoritesCount, error: favError } = await supabase
      .from('favorites')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    if (favError) throw favError

    // Get watch history count
    const { count: historyCount, error: histError } = await supabase
      .from('watch_history')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    if (histError) throw histError

    // Get subscriptions count
    const { count: subscriptionsCount, error: subError } = await supabase
      .from('subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    if (subError) throw subError

    // Get recent activity
    const { data: recentActivity, error: activityError } = await supabase
      .from('watch_history')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(5)

    if (activityError) throw activityError

    res.status(200).json({
      success: true,
      data: {
        favorites_count: favoritesCount || 0,
        history_count: historyCount || 0,
        subscriptions_count: subscriptionsCount || 0,
        recent_activity: recentActivity || []
      }
    })

  } catch (error) {
    console.error('Stats error:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
}
