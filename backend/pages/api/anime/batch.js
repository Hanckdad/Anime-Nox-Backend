import { consumetApi, corsHeaders, handleError } from '../../../../lib/utils'

export default async function handler(req, res) {
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value)
  })

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { animeIds } = req.body

    if (!animeIds || !Array.isArray(animeIds)) {
      return res.status(400).json({
        success: false,
        error: 'animeIds array is required'
      })
    }

    if (animeIds.length > 20) {
      return res.status(400).json({
        success: false,
        error: 'Maximum 20 anime IDs allowed per request'
      })
    }

    // Fetch details for multiple anime in parallel
    const animeDetails = await Promise.all(
      animeIds.map(async (animeId) => {
        try {
          const response = await consumetApi.get(`/anime/gogoanime/info/${animeId}`)
          return {
            success: true,
            data: response.data
          }
        } catch (error) {
          return {
            success: false,
            error: error.message,
            animeId
          }
        }
      })
    )

    res.status(200).json({
      success: true,
      data: animeDetails
    })
  } catch (error) {
    handleError(error, res)
  }
}
