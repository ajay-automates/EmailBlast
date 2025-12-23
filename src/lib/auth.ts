import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from './supabase'

import { getToken } from 'next-auth/jwt'

export async function getAuthUser(req: NextApiRequest) {
  const token = await getToken({ req })

  if (!token || !token.sub) {
    throw new Error('Unauthorized')
  }

  return {
    id: token.sub, // The user ID from NextAuth
    email: token.email
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
