import { supabase, corsHeaders, validateAuth } from '../../../../lib/utils'

export default async function handler(req, res) {
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value)
  })

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  const user = await validateAuth(req)
  if (!user) {
    return res.status(401).json({ success: false, error: 'Unauthorized' })
  }

  try {
    if (req.method === 'GET') {
      const { unread_only = false } = req.query

      let query = supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (unread_only) {
        query = query.eq('read', false)
      }

      const { data: notifications, error } = await query

      if (error) throw error

      res.status(200).json({
        success: true,
        data: notifications
      })

    } else if (req.method === 'POST') {
      const { title, message, type = 'info' } = req.body

      if (!title || !message) {
        return res.status(400).json({
          success: false,
          error: 'Title and message are required'
        })
      }

      const { data: notification, error } = await supabase
        .from('notifications')
        .insert({
          user_id: user.id,
          title,
          message,
          type,
          read: false,
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error

      res.status(201).json({
        success: true,
        data: notification,
        message: 'Notification created'
      })

    } else if (req.method === 'PUT') {
      const { notificationIds, mark_all = false } = req.body

      let query = supabase
        .from('notifications')
        .update({ read: true, read_at: new Date().toISOString() })
        .eq('user_id', user.id)

      if (!mark_all && notificationIds) {
        query = query.in('id', notificationIds)
      } else if (!mark_all) {
        return res.status(400).json({
          success: false,
          error: 'Notification IDs or mark_all required'
        })
      }

      const { error } = await query

      if (error) throw error

      res.status(200).json({
        success: true,
        message: mark_all ? 'All notifications marked as read' : 'Notifications marked as read'
      })

    } else {
      res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    console.error('Notifications error:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
}
