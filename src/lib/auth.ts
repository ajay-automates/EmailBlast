import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from './supabase'

export async function getAuthUser(req: NextApiRequest) {
  // TODO: Re-enable real auth when login pages are built (Week 9-10)
  // For now, return a mock user to allow testing the app
  return {
    id: '11111111-1111-1111-1111-111111111111',
    email: 'test@example.com'
  }
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
