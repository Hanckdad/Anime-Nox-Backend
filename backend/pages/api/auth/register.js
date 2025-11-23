import { supabase, corsHeaders } from '../../../../lib/utils'

export default async function handler(req, res) {
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value)
  })

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method === 'POST') {
    try {
      const { email, password, username } = req.body

      if (!email || !password || !username) {
        return res.status(400).json({
          success: false,
          error: 'Email, password, and username are required'
        })
      }

      // Check if user exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .or(`email.eq.${email},username.eq.${username}`)
        .single()

      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'User already exists'
        })
      }

      // Create user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { username }
      })

      if (authError) throw authError

      // Create profile
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email,
          username,
          avatar_url: null,
          created_at: new Date().toISOString()
        })

      if (profileError) throw profileError

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        user: {
          id: authData.user.id,
          email,
          username
        }
      })

    } catch (error) {
      console.error('Registration error:', error)
      res.status(500).json({
        success: false,
        error: error.message
      })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}
