import jwt from 'jsonwebtoken'
import { supabase } from './supabase'

export const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '30d' })
}

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET)
  } catch (error) {
    return null
  }
}

export const validateApiKey = (req) => {
  const apiKey = req.headers['x-api-key']
  return apiKey === process.env.API_KEY
}

export const rateLimit = () => {
  const limits = new Map()

  return (req, res, next) => {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
    const now = Date.now()
    const windowStart = now - 60000 // 1 minute window

    if (!limits.has(ip)) {
      limits.set(ip, [])
    }

    const requests = limits.get(ip).filter(time => time > windowStart)
    requests.push(now)
    limits.set(ip, requests)

    if (requests.length > 100) { // 100 requests per minute
      return res.status(429).json({
        success: false,
        error: 'Too many requests'
      })
    }

    next()
  }
}
