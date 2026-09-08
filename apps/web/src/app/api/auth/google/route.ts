import {
    NextRequest,
    NextResponse,
  } from 'next/server';
  
  import {
    cookies,
  } from 'next/headers';
  
  import {
    randomBytes,
  } from 'node:crypto';
  
  const STATE =
    'google-oauth-state';
  
  const RETURN_TO =
    'google-oauth-return-to';
  
  export async function GET(
    request: NextRequest,
  ) {
    const state =
      randomBytes(32).toString(
        'base64url',
      );
  
    const requested =
      request.nextUrl.searchParams.get(
        'returnTo',
      );
  
    const returnTo =
      requested &&
      requested.startsWith('/') &&
      !requested.startsWith('//')
        ? requested
        : '/dashboard';
  
    const cookieStore =
      await cookies();
  
    cookieStore.set(
      STATE,
      state,
      {
        httpOnly: true,
        secure:
          process.env.NODE_ENV ===
          'production',
        sameSite: 'lax',
        path: '/api/auth/google',
        maxAge: 600,
      },
    );
  
    cookieStore.set(
      RETURN_TO,
      returnTo,
      {
        httpOnly: true,
        secure:
          process.env.NODE_ENV ===
          'production',
        sameSite: 'lax',
        path: '/api/auth/google',
        maxAge: 600,
      },
    );
  
    const api =
      new URL(
        process.env.AUTHFORT_API_URL!,
      );
  
    api.pathname =
      '/auth/google/authorize';
  
    api.searchParams.set(
      'state',
      state,
    );
  
    return NextResponse.redirect(
      api,
    );
  }