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
    const { id } = req.query
    
    if (!id) {
      return res.status(400).json({ 
        success: false,
        error: 'Anime ID is required' 
      })
    }
    
    const response = await consumetApi.get(`/anime/gogoanime/info/${id}`)
    
    res.status(200).json({
      success: true,
      data: response.data
    })
  } catch (error) {
    handleError(error, res)
  }
}
