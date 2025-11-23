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
    const { userId, limit = 10 } = req.query

    let recommendations = []

    if (userId) {
      // Get user's watch history and favorites for personalized recommendations
      const [historyResult, favoritesResult] = await Promise.all([
        supabase
          .from('watch_history')
          .select('anime_id, anime_title')
          .eq('user_id', userId)
          .limit(5),
        supabase
          .from('favorites')
          .select('anime_id, anime_title')
          .eq('user_id', userId)
          .limit(5)
      ])

      const userAnime = [
        ...(historyResult.data || []),
        ...(favoritesResult.data || [])
      ]

      if (userAnime.length > 0) {
        // Get popular anime as fallback recommendations
        const popularData = await consumetAPI.getPopular(1)
        recommendations = popularData.results?.slice(0, limit) || []
      }
    }

    // If no user or no personal data, return trending anime
    if (recommendations.length === 0) {
      const trendingData = await consumetAPI.getTrending(1)
      recommendations = trendingData.results?.slice(0, limit) || []
    }

    res.status(200).json({
      success: true,
      data: recommendations,
      personalized: !!userId
    })
  } catch (error) {
    handleError(error, res)
  }
}
