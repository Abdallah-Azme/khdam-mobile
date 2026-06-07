import { preferenceStorage } from '@/services/storage/preference-storage';
import { secureStorage } from '@/services/storage/secure-storage';
import { sessionEvents } from '@/services/session/session-events';

import { apiRequest } from './client';

jest.mock('@/services/storage/preference-storage', () => ({
  preferenceStorage: { get: jest.fn() },
}));

jest.mock('@/services/storage/secure-storage', () => ({
  secureStorage: { get: jest.fn() },
}));

describe('apiRequest', () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = fetchMock;
    jest.spyOn(sessionEvents, 'emitExpired');
    jest.mocked(secureStorage.get).mockResolvedValue('secret-token');
    jest.mocked(preferenceStorage.get).mockResolvedValue('en');
  });

  it('injects authentication and language headers', async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ status: true }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );

    await apiRequest('/profile');

    expect(fetchMock).toHaveBeenCalledWith(
      'https://portal.khdm.net/api/profile',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer secret-token',
          'Accept-Language': 'en',
          lang: 'en',
        }),
      }),
    );
  });

  it('emits session expiry after an authenticated 401 response', async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ message: 'Unauthenticated' }), {
        status: 401,
        headers: { 'content-type': 'application/json' },
      }),
    );

    await expect(apiRequest('/profile')).rejects.toMatchObject({ status: 401 });
    expect(sessionEvents.emitExpired).toHaveBeenCalledTimes(1);
  });
});
