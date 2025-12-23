import { NextApiRequest, NextApiResponse } from 'next'
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs'

export async function getAuthUser(req: NextApiRequest, res: NextApiResponse) {
  const supabase = createPagesServerClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    throw new Error('Unauthorized')
  }

  return {
    id: session.user.id,
    email: session.user.email
  }
}

export async function requireAuth(
  req: NextApiRequest,
  res: NextApiResponse,
  handler: (user: any) => Promise<void>
) {
  try {
    const user = await getAuthUser(req, res)
    await handler(user)
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized' })
  }
}
