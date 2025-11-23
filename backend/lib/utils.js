import axios from 'axios'

const CONSUMET_API = process.env.CONSUMET_API || 'https://consumet-api-production-5f96.up.railway.app'

export const consumetApi = axios.create({
  baseURL: CONSUMET_API,
  timeout: 15000,
})

export const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://animenox-stream.netlify.app',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export const handleError = (error, res) => {
  console.error('API Error:', error)
  
  if (error.response) {
    return res.status(error.response.status).json({
      success: false,
      error: error.response.data?.message || 'API Error',
      status: error.response.status
    })
  }
  
  return res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    details: error.message
  })
}

export const validateAuth = async (req) => {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.substring(7)
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token)
    if (error) throw error
    return user
  } catch (error) {
    return null
  }
}
