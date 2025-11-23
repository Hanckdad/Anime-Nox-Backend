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
      const { data: history, error } = await supabase
        .from('watch_history')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(50)

      if (error) throw error

      res.status(200).json({
        success: true,
        data: history
      })

    } else if (req.method === 'DELETE') {
      const { id } = req.body

      let query = supabase
        .from('watch_history')
        .delete()
        .eq('user_id', user.id)

      if (id) {
        query = query.eq('id', id)
      }

      const { error } = await query

      if (error) throw error

      res.status(200).json({
        success: true,
        message: id ? 'History item deleted' : 'All history cleared'
      })

    } else {
      res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    console.error('History error:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
}
