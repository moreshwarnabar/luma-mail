import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';

/**
 * Creates a mock NextRequest for testing API routes
 */
export function createMockRequest(
  url: string,
  options?: {
    method?: string;
    headers?: Record<string, string>;
    searchParams?: Record<string, string>;
  }
): NextRequest {
  const { method = 'GET', headers = {}, searchParams = {} } = options || {};
  const urlObj = new URL(url);

  // Add search params
  Object.entries(searchParams).forEach(([key, value]) => {
    urlObj.searchParams.set(key, value);
  });

  const request = new NextRequest(urlObj.toString(), {
    method,
    headers: new Headers(headers),
  });

  return request;
}

/**
 * Creates a mock cookie store for testing
 */
export function createMockCookieStore(cookies: Record<string, string> = {}): {
  get: jest.Mock;
  set: jest.Mock;
  delete: jest.Mock;
  has: jest.Mock;
  getAll: jest.Mock;
} {
  const cookieMap = new Map<string, string>(Object.entries(cookies));

  return {
    get: jest.fn((name: string) => {
      const value = cookieMap.get(name);
      return value ? { name, value } : undefined;
    }),
    set: jest.fn((name: string, value: string) => {
      cookieMap.set(name, value);
    }),
    delete: jest.fn((name: string) => {
      cookieMap.delete(name);
    }),
    has: jest.fn((name: string) => cookieMap.has(name)),
    getAll: jest.fn(() =>
      Array.from(cookieMap.entries()).map(([name, value]) => ({ name, value }))
    ),
  };
}

/**
 * Mock data factories for testing
 */
export const testData = {
  mailAccount: {
    userId: 'user-123',
    provider: 'gmail' as const,
    providerAccountId: 'test@gmail.com',
    address: 'test@gmail.com',
    accessToken: 'access-token-123',
    refreshToken: 'refresh-token-123',
    accessTokenExpiresAt: new Date(Date.now() + 3600000), // 1 hour from now
    refreshTokenExpiresAt: null,
  },
  emailAddress: {
    address: 'test@gmail.com',
    accountId: 'account-123',
  },
  session: {
    id: 'session-123',
    userId: 'user-123',
    token: 'token-123',
    expiresAt: new Date(Date.now() + 86400000), // 24 hours from now
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
};
