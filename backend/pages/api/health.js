import { consumetApi, corsHeaders, supabase } from '../../lib/utils'

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
    const healthChecks = {
      api: false,
      database: false,
      consumet_api: false,
      timestamp: new Date().toISOString()
    }

    // Check database connection
    try {
      const { data, error } = await supabase.from('users').select('count').limit(1)
      healthChecks.database = !error
    } catch (error) {
      console.error('Database health check failed:', error)
    }

    // Check consumet API
    try {
      const response = await consumetApi.get('/anime/gogoanime/top-airing', {
        timeout: 5000
      })
      healthChecks.consumet_api = response.status === 200
    } catch (error) {
      console.error('Consumet API health check failed:', error)
    }

    healthChecks.api = true

    const allHealthy = Object.values(healthChecks).every(status => status === true)

    res.status(allHealthy ? 200 : 503).json({
      success: allHealthy,
      ...healthChecks,
      message: allHealthy ? 'All systems operational' : 'Some services are down'
    })

  } catch (error) {
    console.error('Health check error:', error)
    res.status(500).json({
      success: false,
      error: 'Health check failed',
      timestamp: new Date().toISOString()
    })
  }
}
