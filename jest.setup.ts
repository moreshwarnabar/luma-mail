import '@testing-library/jest-dom';
import React from 'react';

// Mock database
jest.mock('@/db', () => ({
  db: {},
}));

// Mock next/headers
jest.mock('next/headers', () => ({
  headers: jest.fn(() => Promise.resolve(new Headers())),
}));

// Mock next/navigation
const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockRefresh = jest.fn();

jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    refresh: mockRefresh,
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
  useParams: () => ({}),
}));

// Make mock functions available globally for tests
(
  global as typeof globalThis & {
    __mockPush: jest.Mock;
    __mockReplace: jest.Mock;
    __mockRefresh: jest.Mock;
  }
).__mockPush = mockPush;
(
  global as typeof globalThis & {
    __mockPush: jest.Mock;
    __mockReplace: jest.Mock;
    __mockRefresh: jest.Mock;
  }
).__mockReplace = mockReplace;
(
  global as typeof globalThis & {
    __mockPush: jest.Mock;
    __mockReplace: jest.Mock;
    __mockRefresh: jest.Mock;
  }
).__mockRefresh = mockRefresh;

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: function Image(props: {
    src: string;
    alt: string;
    width: number;
    height: number;
  }) {
    return React.createElement('img', {
      src: props.src,
      alt: props.alt,
      width: props.width,
      height: props.height,
    });
  },
}));

// Mock better-auth
jest.mock('better-auth', () => ({
  betterAuth: jest.fn(() => ({
    api: {
      getSession: jest.fn(() =>
        Promise.resolve({ user: { id: '1', name: 'Test User' } })
      ),
    },
  })),
}));

jest.mock('better-auth/adapters/drizzle', () => ({
  drizzleAdapter: jest.fn(),
}));

// Mock getSession api
jest.mock('@/lib/auth/auth', () => ({
  auth: {
    api: {
      getSession: jest.fn(() =>
        Promise.resolve({
          session: {
            id: 'session-1',
            userId: '1',
            token: 'token-1',
            expiresAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          user: {
            id: '1',
            name: 'Test User',
            email: 'test@example.com',
            emailVerified: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        })
      ),
    },
  },
}));

// Mock auth client
jest.mock('@/lib/auth/auth-client', () => ({
  signIn: {
    email: jest.fn(),
    social: jest.fn(),
  },
  signUp: {
    email: jest.fn(),
  },
}));
