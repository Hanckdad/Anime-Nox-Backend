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
    const { q, page = 1, genre, year, sort } = req.query
    
    if (!q && !genre) {
      return res.status(400).json({ 
        success: false,
        error: 'Query parameter "q" or "genre" is required' 
      })
    }
    
    let url = '/anime/gogoanime/'
    if (q) {
      url += encodeURIComponent(q)
    } else {
      url += `genre/${genre}`
    }
    
    const response = await consumetApi.get(url, {
      params: { page, year, sort }
    })
    
    res.status(200).json({
      success: true,
      data: response.data,
      query: q,
      genre: genre
    })
  } catch (error) {
    handleError(error, res)
  }
}
