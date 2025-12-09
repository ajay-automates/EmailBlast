import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from './supabase'

export async function getAuthUser(req: NextApiRequest) {
  const token = req.headers.authorization?.split('Bearer ')[1]
  
  if (!token) {
    throw new Error('No authorization token')
  }

  const { data: { user }, error } = await supabase.auth.getUser(token)
  
  if (error || !user) {
    throw new Error('Invalid token')
  }

  return user
}

export async function requireAuth(
  req: NextApiRequest,
  res: NextApiResponse,
  handler: (user: any) => Promise<void>
) {
  try {
    const user = await getAuthUser(req)
    await handler(user)
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized' })
  }
}
