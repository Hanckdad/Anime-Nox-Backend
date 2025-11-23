import { consumetApi, corsHeaders, handleError } from '../../../../../lib/utils'

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
    // Get recent episodes for ongoing anime
    const [recentResponse, popularResponse] = await Promise.all([
      consumetApi.get('/anime/gogoanime/recent-episodes', { params: { page: 1, type: 1 } }),
      consumetApi.get('/anime/gogoanime/top-airing', { params: { page: 1 } })
    ])

    // Simulate schedule by days (since Consumet doesn't have direct schedule endpoint)
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    const schedule = {}
    
    days.forEach(day => {
      schedule[day] = popularResponse.data.results
        ?.slice(0, 5)
        .map(anime => ({
          ...anime,
          airingTime: `${Math.floor(Math.random() * 24)}:00` // Simulated time
        })) || []
    })

    res.status(200).json({
      success: true,
      data: {
        schedule,
        recent_episodes: recentResponse.data,
        ongoing_anime: popularResponse.data
      }
    })
  } catch (error) {
    handleError(error, res)
  }
}
