'use client';

import {
  useEffect,
  useRef,
} from 'react';

import {
  useRouter,
} from 'next/navigation';

import {
  useAuth,
} from '../hooks/use-auth';

export function SessionExpiryHandler() {
  const router = useRouter();

  const {
    status,
    hydrate,
  } = useAuth();

  const previous =
    useRef(status);

  useEffect(() => {
    if (
      previous.current ===
        'authenticated' &&
      status ===
        'unauthenticated'
    ) {
      router.replace(
        '/login?reason=session_expired',
      );
    }

    previous.current =
      status;
  }, [status, router]);

  useEffect(() => {
    const interval =
      window.setInterval(
        () => {
          void hydrate();
        },
        60_000,
      );

    return () =>
      window.clearInterval(
        interval,
      );
  }, [hydrate]);

  return null;
}