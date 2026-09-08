import {
    NextRequest,
  } from 'next/server';
  
  import {
    authFortClient,
  } from '@/lib/auth/authfort-client';
  
  import {
    body,
  } from '@/lib/auth/request';
  
  import {
    error,
    json,
  } from '@/lib/auth/bff-response';
  
  interface OtpRequest {
    attemptId: string;
  }
  
  export async function POST(
    request: NextRequest,
  ) {
    try {
      const input =
        await body<OtpRequest>(
          request,
        );
  
      const result =
        await authFortClient.request(
          '/auth/otp/request',
          {
            method: 'POST',
            body: JSON.stringify(
              input,
            ),
          },
        );
  
      return json(result);
    } catch (cause) {
      return error(cause);
    }
  }