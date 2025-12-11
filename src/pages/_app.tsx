import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { createClient } from '@supabase/supabase-js'
import { SessionContextProvider } from '@supabase/auth-helpers-react'
import type { Session } from '@supabase/supabase-js'
import { useState } from 'react'

const sc_url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const sc_key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export default function App({
    Component,
    pageProps
}: AppProps<{ initialSession: Session }>) {
    // Manual client creation to bypass helper issues
    const [supabaseClient] = useState(() => createClient(sc_url, sc_key))

    return (
        <SessionContextProvider
            supabaseClient={supabaseClient}
            initialSession={pageProps.initialSession}
        >
            <Component {...pageProps} />
        </SessionContextProvider>
    )
}
