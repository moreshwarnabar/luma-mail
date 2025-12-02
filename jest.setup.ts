import '@testing-library/jest-dom';

// Mock database
jest.mock('@/db', () => ({
  db: {},
}));

// Mock next/headers
jest.mock('next/headers', () => ({
  headers: jest.fn(() => Promise.resolve(new Headers())),
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
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
jest.mock('@/lib/auth', () => ({
  auth: {
    api: {
      getSession: jest.fn(() =>
        Promise.resolve({ user: { id: '1', name: 'Test User' } })
      ),
    },
  },
}));
