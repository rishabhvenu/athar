import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/today'

  if (code) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder",
      {
        cookies: {
          getAll() {
            return request.headers.get('cookie') ? 
              request.headers.get('cookie')?.split(';').map(c => {
                const [name, ...rest] = c.trim().split('=')
                return { name: name || '', value: rest.join('=') }
              }) ?? [] 
              : []
          },
          setAll(cookiesToSet) {
            // This is handled by middleware, but we need to provide the interface
          },
        },
      }
    )
    
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=Could not authenticate user`)
}
