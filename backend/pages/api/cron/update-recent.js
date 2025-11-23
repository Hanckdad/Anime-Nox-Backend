import { consumetAPI, corsHeaders } from '../../../../lib/utils'
import { supabase } from '../../../../lib/supabase'

export default async function handler(req, res) {
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value)
  })

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  // Simple authentication for cron jobs
  if (req.method !== 'POST' || req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ success: false, error: 'Unauthorized' })
  }

  try {
    // Get recent episodes
    const recentData = await consumetAPI.getRecentEpisodes(1, 1)
    
    // Store in database for quick access (optional caching)
    if (recentData.results && recentData.results.length > 0) {
      const { error } = await supabase
        .from('cached_recent_episodes')
        .upsert(
          recentData.results.map(episode => ({
            id: episode.id,
            anime_id: episode.animeId,
            anime_title: episode.animeTitle,
            episode_id: episode.episodeId,
            episode_number: episode.episodeNumber,
            episode_title: episode.title,
            image: episode.image,
            url: episode.url,
            updated_at: new Date().toISOString()
          })),
          { onConflict: 'episode_id' }
        )

      if (error) throw error
    }

    // Notify subscribed users about new episodes (simplified)
    const newEpisodes = recentData.results?.slice(0, 5) || []

    for (const episode of newEpisodes) {
      const { data: subscribers } = await supabase
        .from('subscriptions')
        .select('user_id')
        .eq('anime_id', episode.animeId)
        .eq('notify_on_new_episode', true)

      if (subscribers && subscribers.length > 0) {
        for (const subscriber of subscribers) {
          await supabase
            .from('notifications')
            .insert({
              user_id: subscriber.user_id,
              title: 'New Episode Available!',
              message: `New episode of ${episode.animeTitle} is now available`,
              type: 'info',
              created_at: new Date().toISOString()
            })
        }
      }
    }

    res.status(200).json({
      success: true,
      message: `Updated ${newEpisodes.length} recent episodes`,
      data: newEpisodes
    })
  } catch (error) {
    console.error('Cron job error:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
}
