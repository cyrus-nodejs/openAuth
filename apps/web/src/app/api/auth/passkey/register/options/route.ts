import {
    authFortClient,
  } from '@/lib/auth/authfort-client';
  
  import {
    error,
    json,
  } from '@/lib/auth/bff-response';
  
  export async function POST() {
    try {
      const result =
        await authFortClient.authenticatedRequest(
          '/auth/passkey/register/options',
          {
            method: 'POST',
            body: JSON.stringify({}),
          },
        );
  
      return json(result);
    } catch (cause) {
      return error(cause);
    }
  }