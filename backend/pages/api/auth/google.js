import { createClientFrontend, corsHeaders } from '../../../../lib/utils'

export default async function handler(req, res) {
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value)
  })

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method === 'POST') {
    try {
      const supabase = createClientFrontend()
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${req.headers.origin}/auth/callback`
        }
      })

      if (error) {
        throw error
      }

      res.status(200).json({
        success: true,
        data: data
      })
    } catch (error) {
      console.error('Google auth error:', error)
      res.status(500).json({
        success: false,
        error: error.message
      })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}
