import { consumetAPI, corsHeaders, handleError } from '../../../../lib/utils'
import { supabase } from '../../../../lib/supabase'

export default async function handler(req, res) {
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value)
  })

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { force_refresh = false } = req.query

    // Check cache first
    if (!force_refresh) {
      const { data: cachedData, error: cacheError } = await supabase
        .from('cached_recent_episodes')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(20)

      if (!cacheError && cachedData && cachedData.length > 0) {
        return res.status(200).json({
          success: true,
          data: cachedData,
          source: 'cache',
          cached_at: cachedData[0].updated_at
        })
      }
    }

    // Fetch fresh data from API
    const recentData = await consumetAPI.getRecentEpisodes(1, 1)
    
    // Update cache
    if (recentData.results && recentData.results.length > 0) {
      await supabase
        .from('cached_recent_episodes')
        .upsert(
          recentData.results.map(episode => ({
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
    }

    res.status(200).json({
      success: true,
      data: recentData.results || [],
      source: 'api',
      cached_at: new Date().toISOString()
    })
  } catch (error) {
    handleError(error, res)
  }
}
