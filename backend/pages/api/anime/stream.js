import { consumetApi, corsHeaders, handleError, validateAuth } from '../../../../lib/utils'
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
    const { episodeId, server = 'gogocdn', animeId, animeTitle, episodeNumber } = req.query
    
    if (!episodeId) {
      return res.status(400).json({ 
        success: false,
        error: 'Episode ID is required' 
      })
    }
    
    // Save to watch history if user is authenticated
    const user = await validateAuth(req)
    if (user && animeId && animeTitle) {
      await supabase
        .from('watch_history')
        .upsert({
          user_id: user.id,
          anime_id: animeId,
          anime_title: animeTitle,
          episode_id: episodeId,
          episode_number: parseInt(episodeNumber) || 1,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,episode_id'
        })
    }
    
    const response = await consumetApi.get(`/anime/gogoanime/watch/${episodeId}`, {
      params: { server }
    })
    
    res.status(200).json({
      success: true,
      data: response.data
    })
  } catch (error) {
    handleError(error, res)
  }
}
