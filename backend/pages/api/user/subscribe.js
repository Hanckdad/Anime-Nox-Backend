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

  try {
    if (req.method === 'GET') {
      const { data: subscriptions, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      res.status(200).json({
        success: true,
        data: subscriptions
      })

    } else if (req.method === 'POST') {
      const { animeId, animeTitle, notifyOnNewEpisode = true } = req.body

      if (!animeId || !animeTitle) {
        return res.status(400).json({
          success: false,
          error: 'Anime ID and title are required'
        })
      }

      const { data: subscription, error } = await supabase
        .from('subscriptions')
        .upsert({
          user_id: user.id,
          anime_id: animeId,
          anime_title: animeTitle,
          notify_on_new_episode: notifyOnNewEpisode,
          created_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,anime_id'
        })
        .select()
        .single()

      if (error) throw error

      res.status(200).json({
        success: true,
        data: subscription,
        message: 'Subscribed to anime'
      })

    } else if (req.method === 'DELETE') {
      const { animeId } = req.body

      if (!animeId) {
        return res.status(400).json({
          success: false,
          error: 'Anime ID is required'
        })
      }

      const { error } = await supabase
        .from('subscriptions')
        .delete()
        .eq('user_id', user.id)
        .eq('anime_id', animeId)

      if (error) throw error

      res.status(200).json({
        success: true,
        message: 'Unsubscribed from anime'
      })

    } else {
      res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    console.error('Subscription error:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
}
