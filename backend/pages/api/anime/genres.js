import { consumetApi, corsHeaders, handleError } from '../../../../lib/utils'

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
    // List of common anime genres
    const genres = [
      'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror',
      'Mystery', 'Romance', 'Sci-Fi', 'Slice of Life', 'Sports', 'Supernatural',
      'Ecchi', 'Harem', 'Josei', 'Martial Arts', 'Mecha', 'Military',
      'Music', 'Psychological', 'Seinen', 'Shoujo', 'Shounen', 'Thriller'
    ]
    
    res.status(200).json({
      success: true,
      data: genres
    })
  } catch (error) {
    handleError(error, res)
  }
}
