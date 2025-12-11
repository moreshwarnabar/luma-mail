import { headers } from 'next/headers';

// Unmock the auth module to test the actual implementation
jest.unmock('@/lib/auth/auth');
import { getActiveUserId, auth } from '@/lib/auth/auth';

// Mock next/headers
jest.mock('next/headers', () => ({
  headers: jest.fn(),
}));

describe('getActiveUserId', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns user id when session exists', async () => {
    const mockHeaders = new Headers();
    jest.mocked(headers).mockResolvedValue(mockHeaders);
    jest.mocked(auth.api.getSession).mockResolvedValue({
      session: {
        id: 'session-123',
        userId: 'user-123',
        token: 'token-123',
        expiresAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      user: {
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    const userId = await getActiveUserId();

    expect(userId).toBe('user-123');
    expect(auth.api.getSession).toHaveBeenCalledWith({ headers: mockHeaders });
  });

  it('returns null when session does not exist', async () => {
    const mockHeaders = new Headers();
    jest.mocked(headers).mockResolvedValue(mockHeaders);
    jest.mocked(auth.api.getSession).mockResolvedValue(null);

    const userId = await getActiveUserId();

    expect(userId).toBeNull();
    expect(auth.api.getSession).toHaveBeenCalledWith({ headers: mockHeaders });
  });

  it('returns null when session exists but user is missing', async () => {
    const mockHeaders = new Headers();
    jest.mocked(headers).mockResolvedValue(mockHeaders);
    jest.mocked(auth.api.getSession).mockResolvedValue({
      session: {
        id: 'session-123',
        userId: 'user-123',
        token: 'token-123',
        expiresAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      user: null,
    });

    const userId = await getActiveUserId();

    expect(userId).toBeNull();
  });

  it('returns null when session exists but user id is missing', async () => {
    const mockHeaders = new Headers();
    jest.mocked(headers).mockResolvedValue(mockHeaders);
    jest.mocked(auth.api.getSession).mockResolvedValue({
      session: {
        id: 'session-123',
        userId: 'user-123',
        token: 'token-123',
        expiresAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      user: {
        id: '',
        name: 'Test User',
        email: 'test@example.com',
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    const userId = await getActiveUserId();

    expect(userId).toBeNull();
  });

  it('returns null and logs error when getSession throws', async () => {
    const mockHeaders = new Headers();
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    jest.mocked(headers).mockResolvedValue(mockHeaders);
    jest
      .mocked(auth.api.getSession)
      .mockRejectedValue(new Error('Database error'));

    const userId = await getActiveUserId();

    expect(userId).toBeNull();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error when fetching userId, ',
      expect.any(Error)
    );

    consoleErrorSpy.mockRestore();
  });
});
