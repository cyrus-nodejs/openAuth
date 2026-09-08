import {
    NextRequest,
    NextResponse,
  } from 'next/server';
  
  import {
    cookies,
  } from 'next/headers';
  
  import {
    createRequestId,
  } from '@/lib/security/request-id';
  
  import {
    authFortClient,
  } from '@/lib/auth/authfort-client';
  
  const OAUTH_STATE =
    'google-oauth-state';
  
  const RETURN_TO =
    'google-oauth-return-to';
  
  function safeReturnTo(
    value: string | undefined,
  ): string {
    if (
      !value ||
      !value.startsWith('/') ||
      value.startsWith('//')
    ) {
      return '/dashboard';
    }
  
    return value;
  }
  
  export async function GET(
    request: NextRequest,
  ) {
    const requestId =
      createRequestId(
        request.headers.get(
          'x-request-id',
        ),
      );
  
    const params =
      request.nextUrl.searchParams;
  
    const code =
      params.get('code');
  
    const state =
      params.get('state');
  
    const oauthError =
      params.get('error');
  
    if (oauthError) {
      return redirectError(
        request,
        'google_denied',
        requestId,
      );
    }
  
    if (!code || !state) {
      return redirectError(
        request,
        'invalid_google_callback',
        requestId,
      );
    }
  
    const cookieStore =
      await cookies();
  
    const storedState =
      cookieStore.get(
        OAUTH_STATE,
      )?.value;
  
    const returnTo =
      safeReturnTo(
        cookieStore.get(
          RETURN_TO,
        )?.value,
      );
  
    /*
     * State is single-use. Delete it before exchanging
     * the authorization code so replay cannot reuse it.
     */
    cookieStore.delete(
      OAUTH_STATE,
    );
  
    cookieStore.delete(
      RETURN_TO,
    );
  
    if (
      !storedState ||
      storedState !== state
    ) {
      return redirectError(
        request,
        'invalid_oauth_state',
        requestId,
      );
    }
  
    try {
      const response =
        await authFortClient.request(
          '/auth/google/callback',
          {
            method: 'POST',
            headers: {
              'content-type':
                'application/json',
              'x-request-id':
                requestId,
            },
            body: JSON.stringify({
              code,
              state,
            }),
          },
        );
  
      if (!response.ok) {
        return redirectError(
          request,
          'google_authentication_failed',
          requestId,
        );
      }
  
      const result =
        NextResponse.redirect(
          new URL(
            returnTo,
            request.url,
          ),
        );
  
      result.headers.set(
        'x-request-id',
        requestId,
      );
  
      return result;
    } catch {
      return redirectError(
        request,
        'google_authentication_failed',
        requestId,
      );
    }
  }
  
  function redirectError(
    request: NextRequest,
    reason: string,
    requestId: string,
  ) {
    const url =
      new URL(
        '/login',
        request.url,
      );
  
    url.searchParams.set(
      'reason',
      reason,
    );
  
    const response =
      NextResponse.redirect(
        url,
      );
  
    response.headers.set(
      'x-request-id',
      requestId,
    );
  
    return response;
  }