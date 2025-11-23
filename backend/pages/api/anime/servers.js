import { corsHeaders } from '../../../../lib/utils'

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
    const servers = [
      { name: 'gogocdn', quality: 'HD', reliable: true },
      { name: 'streamsb', quality: 'Multiple', reliable: true },
      { name: 'vidstreaming', quality: 'HD', reliable: true },
      { name: 'mp4upload', quality: 'SD', reliable: false }
    ]
    
    res.status(200).json({
      success: true,
      data: servers
    })
  } catch (error) {
    console.error('Servers error:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
}
