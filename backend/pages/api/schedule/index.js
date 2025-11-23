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
    // This would typically fetch schedule data
    // For now, we'll return recent episodes as ongoing
    const response = await consumetApi.get('/anime/gogoanime/recent-episodes', {
      params: { page: 1, type: 1 }
    })
    
    // Group by day (simplified)
    const schedule = {
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
      saturday: [],
      sunday: []
    }
    
    res.status(200).json({
      success: true,
      data: {
        schedule,
        recent: response.data
      }
    })
  } catch (error) {
    handleError(error, res)
  }
}
