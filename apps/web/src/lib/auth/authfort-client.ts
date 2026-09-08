import 'server-only';

import {
  authConfig,
} from './config';

import {
  getAccessToken,
  getRefreshToken,
} from './cookies';

import type {
  ApiResponse,
  TokenResponse,
} from './contracts';

export class AuthFortApiError
  extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly requestId?: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name =
      'AuthFortApiError';
  }
}

interface RequestOptions
  extends RequestInit {
  authenticated?: boolean;
  refreshable?: boolean;
}

export class AuthFortClient {
  async request<T>(
    path: string,
    options: RequestOptions = {},
  ): Promise<T> {
    const {
      authenticated = false,
      refreshable = true,
      headers,
      ...init
    } = options;

    const requestHeaders =
      new Headers(headers);

    requestHeaders.set(
      'content-type',
      'application/json',
    );

    if (authenticated) {
      const token =
        await getAccessToken();

      if (!token) {
        throw new AuthFortApiError(
          401,
          'AUTHENTICATION_REQUIRED',
          'Authentication required',
        );
      }

      requestHeaders.set(
        'authorization',
        `Bearer ${token}`,
      );
    }

    const response =
      await fetch(
        `${authConfig.apiBaseUrl}${path}`,
        {
          ...init,
          headers: requestHeaders,
          cache: 'no-store',
        },
      );

    const payload =
      (await response.json()) as
        | ApiResponse<T>
        | undefined;

    if (
      response.ok &&
      payload?.success
    ) {
      return payload.data;
    }

    const failure =
      payload && !payload.success
        ? payload
        : undefined;

    throw new AuthFortApiError(
      response.status,
      failure?.error.code ??
        'AUTHFORT_API_ERROR',
      failure?.error.message ??
        'Authentication request failed',
      failure?.error.requestId ??
        response.headers.get(
          'x-request-id',
        ) ??
        undefined,
      failure?.error.details,
    );
  }

  async refresh() {
    const token =
      await getRefreshToken();

    if (!token) {
      throw new AuthFortApiError(
        401,
        'REFRESH_TOKEN_MISSING',
        'Refresh token missing',
      );
    }

    return this.request<TokenResponse>(
      '/auth/token/refresh',
      {
        method: 'POST',
        body: JSON.stringify({
          refreshToken: token,
        }),
        refreshable: false,
      },
    );
  }

  async authenticatedRequest<T>(
    path: string,
    options: Omit<
      RequestOptions,
      'authenticated'
    > = {},
  ) {
    try {
      return await this.request<T>(
        path,
        {
          ...options,
          authenticated: true,
        },
      );
    } catch (error) {
      if (
        error instanceof
          AuthFortApiError &&
        error.status === 401
      ) {
        if (options.refreshable === false) {
          throw error;
        }

        await this.refresh();

        return this.request<T>(
          path,
          {
            ...options,
            authenticated: true,
            refreshable: false,
          },
        );
      }

      throw error;
    }
  }
}

export const authFortClient =
  new AuthFortClient();