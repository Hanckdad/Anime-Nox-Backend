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
      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) throw error

      res.status(200).json({
        success: true,
        data: profile
      })

    } else if (req.method === 'PUT') {
      const { username, avatar_url } = req.body

      const updates = {}
      if (username) updates.username = username
      if (avatar_url) updates.avatar_url = avatar_url
      updates.updated_at = new Date().toISOString()

      // Check if username is taken
      if (username) {
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('username', username)
          .neq('id', user.id)
          .single()

        if (existingUser) {
          return res.status(400).json({
            success: false,
            error: 'Username already taken'
          })
        }
      }

      const { data: profile, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single()

      if (error) throw error

      res.status(200).json({
        success: true,
        data: profile,
        message: 'Profile updated successfully'
      })

    } else {
      res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    console.error('Profile error:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
}
