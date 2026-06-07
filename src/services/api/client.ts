import { env } from '@/config/env';
import { storageKeys } from '@/services/storage/keys';
import { preferenceStorage } from '@/services/storage/preference-storage';
import { secureStorage } from '@/services/storage/secure-storage';
import { sessionEvents } from '@/services/session/session-events';

import { ApiError } from './errors';

type ApiRequestOptions = RequestInit & {
  authenticated?: boolean;
};

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { authenticated = true, headers, ...requestOptions } = options;
  const [token, language] = await Promise.all([
    authenticated ? secureStorage.get(storageKeys.token) : null,
    preferenceStorage.get(storageKeys.language),
  ]);

  const response = await fetch(`${env.apiBaseUrl}${path}`, {
    ...requestOptions,
    headers: {
      Accept: 'application/json',
      'Accept-Language': language ?? 'ar',
      lang: language ?? 'ar',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  const payload = await parseResponse(response);

  if (response.status === 401 && authenticated) {
    sessionEvents.emitExpired();
  }

  if (!response.ok) {
    throw new ApiError(
      getErrorMessage(payload, response.status),
      response.status,
      payload,
    );
  }

  return payload as T;
}

async function parseResponse(response: Response): Promise<unknown> {
  const contentType = response.headers.get('content-type') ?? '';
  if (response.status === 204) return null;
  if (contentType.includes('application/json')) return response.json();
  return response.text();
}

function getErrorMessage(payload: unknown, status: number): string {
  if (
    typeof payload === 'object' &&
    payload !== null &&
    'message' in payload &&
    typeof payload.message === 'string'
  ) {
    return payload.message;
  }
  return `Request failed with status ${status}`;
}
