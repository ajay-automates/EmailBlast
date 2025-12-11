import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
    const res = NextResponse.next()
    const supabase = createMiddlewareClient({ req, res })

    const {
        data: { session },
    } = await supabase.auth.getSession()

    // Protect Dashboard Routes
    if (req.nextUrl.pathname.startsWith('/dashboard')) {
        if (!session) {
            return NextResponse.redirect(new URL('/auth/login', req.url))
        }
    }

    // Redirect if already logged in
    if (req.nextUrl.pathname.startsWith('/auth') && session) {
        return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    return res
}

export const config = {
    matcher: [
        '/dashboard/:path*',
        '/auth/:path*',
        '/api/campaigns/:path*',
        '/api/user/:path*'
    ],
}
