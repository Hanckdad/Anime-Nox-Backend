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
    const { 
      q, 
      genre, 
      year, 
      status, 
      type, 
      season,
      sort,
      page = 1 
    } = req.query

    let url = '/anime/gogoanime/'
    const params = { page }

    if (q) {
      url += encodeURIComponent(q)
    } else if (genre) {
      url += `genre/${genre}`
    } else {
      url += 'search'
      if (q) params.keyword = q
      if (genre) params.genre = genre
      if (year) params.year = year
      if (status) params.status = status
      if (type) params.type = type
      if (season) params.season = season
      if (sort) params.sort = sort
    }

    const response = await consumetApi.get(url, { params })
    
    res.status(200).json({
      success: true,
      data: response.data,
      filters: { q, genre, year, status, type, season, sort }
    })
  } catch (error) {
    handleError(error, res)
  }
}
