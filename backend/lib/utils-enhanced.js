import logger from './logger'

export const asyncHandler = (fn) => (req, res) => {
  Promise.resolve(fn(req, res)).catch((error) => {
    logger.error('Async handler error', error, {
      url: req.url,
      method: req.method,
      query: req.query,
      body: req.body
    })
    
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      requestId: req.headers['x-request-id']
    })
  })
}

export const validateRequest = (schema) => (req, res, next) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params
    })
    next()
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: error.errors
    })
  }
}

export const cacheResponse = (duration = 60) => (req, res, next) => {
  res.setHeader('Cache-Control', `public, max-age=${duration}`)
  next()
}
