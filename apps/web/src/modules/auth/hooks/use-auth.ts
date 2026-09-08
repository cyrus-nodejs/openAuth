'use client';

import {
  useAuthStore,
} from '../state/auth-store';

export function useAuth() {
  return useAuthStore();
}