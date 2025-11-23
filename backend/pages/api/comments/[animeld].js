import { supabase, corsHeaders, validateAuth } from '../../../../lib/utils'

export default async function handler(req, res) {
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value)
  })

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  try {
    const { animeId } = req.query

    if (!animeId) {
      return res.status(400).json({
        success: false,
        error: 'Anime ID is required'
      })
    }

    if (req.method === 'GET') {
      const { data: comments, error } = await supabase
        .from('comments')
        .select(`
          *,
          users:user_id (
            username,
            avatar_url
          )
        `)
        .eq('anime_id', animeId)
        .order('created_at', { ascending: false })

      if (error) throw error

      res.status(200).json({
        success: true,
        data: comments
      })

    } else if (req.method === 'POST') {
      const user = await validateAuth(req)
      if (!user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' })
      }

      const { content, rating, parent_id = null } = req.body

      if (!content) {
        return res.status(400).json({
          success: false,
          error: 'Comment content is required'
        })
      }

      const { data: comment, error } = await supabase
        .from('comments')
        .insert({
          user_id: user.id,
          anime_id: animeId,
          content,
          rating: rating || null,
          parent_id,
          created_at: new Date().toISOString()
        })
        .select(`
          *,
          users:user_id (
            username,
            avatar_url
          )
        `)
        .single()

      if (error) throw error

      res.status(201).json({
        success: true,
        data: comment,
        message: 'Comment added successfully'
      })

    } else {
      res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    console.error('Comments error:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
}
