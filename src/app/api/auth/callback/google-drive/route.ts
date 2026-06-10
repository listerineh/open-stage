import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state'); // Contains bandId
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(
      new URL(`/bands/${state}/settings?error=drive_auth_failed`, request.url)
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      new URL(`/bands/${state}/settings?error=missing_params`, request.url)
    );
  }

  try {
    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: process.env.NEXT_PUBLIC_GOOGLE_DRIVE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_DRIVE_CLIENT_SECRET!,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback/google-drive`,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('Token exchange failed:', errorData);
      return NextResponse.redirect(
        new URL(`/bands/${state}/settings?error=token_exchange_failed`, request.url)
      );
    }

    const tokens = await tokenResponse.json();
    const { access_token, refresh_token } = tokens;

    // Store tokens securely in Supabase
    // We'll store the refresh token encrypted in the band settings
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.redirect(
        new URL(`/bands/${state}/settings?error=not_authenticated`, request.url)
      );
    }

    // Get band by slug (state contains the slug)
    const { data: band } = await supabase.from('bands').select('id').eq('slug', state).single();

    if (!band) {
      return NextResponse.redirect(
        new URL(`/bands/${state}/settings?error=band_not_found`, request.url)
      );
    }

    // Store the refresh token in a secure table (we'll create this)
    // For now, we'll just mark the band as connected
    // In production, you'd want to encrypt the refresh_token

    // TODO: Create a secure storage for OAuth tokens
    // For MVP, we'll store connection status only and use access_token in session

    // Redirect back to settings with success
    // We'll pass the access_token via a secure cookie for the folder picker
    const response = NextResponse.redirect(
      new URL(`/bands/${state}/settings?drive=connected&step=select_folder`, request.url)
    );

    // Set a short-lived cookie with the access token for folder selection
    response.cookies.set('drive_access_token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 3600, // 1 hour
      path: '/',
    });

    // Store refresh token for later use (encrypted in production)
    if (refresh_token) {
      response.cookies.set('drive_refresh_token', refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/',
      });
    }

    return response;
  } catch (err) {
    console.error('Google Drive OAuth error:', err);
    return NextResponse.redirect(
      new URL(`/bands/${state}/settings?error=oauth_error`, request.url)
    );
  }
}
