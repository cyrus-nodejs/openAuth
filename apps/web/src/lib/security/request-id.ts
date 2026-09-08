import { randomUUID } from 'node:crypto';

export function createRequestId(
  incoming?: string | null,
): string {
  if (
    incoming &&
    /^[A-Za-z0-9._:-]{8,128}$/.test(incoming)
  ) {
    return incoming;
  }

  return randomUUID();
}