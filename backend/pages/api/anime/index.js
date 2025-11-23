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
    const { page = 1, perPage = 20 } = req.query
    
    const response = await consumetApi.get('/anime/gogoanime/top-airing', {
      params: { page, perPage }
    })
    
    res.status(200).json({
      success: true,
      data: response.data,
      pagination: {
        page: parseInt(page),
        perPage: parseInt(perPage)
      }
    })
  } catch (error) {
    handleError(error, res)
  }
}
