import { GET } from '@/app/api/auth/google/route';
import { NextRequest, NextResponse } from 'next/server';
import { getAuthUrl } from '@/lib/google/gmail';
import { getActiveUserId } from '@/lib/auth/auth';
import crypto from 'crypto';

// Mock dependencies
jest.mock('@/lib/google/gmail', () => ({
  getAuthUrl: jest.fn(),
}));

jest.mock('@/lib/auth/auth', () => ({
  getActiveUserId: jest.fn(),
}));

jest.mock('crypto', () => ({
  randomBytes: jest.fn(),
}));

// Mock NextResponse
jest.mock('next/server', () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    redirect: jest.fn(),
  },
}));

describe('GET /api/auth/google', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('redirects to OAuth URL when user is authenticated', async () => {
    const mockBuffer = Buffer.alloc(16, 'a'); // Create a buffer with 16 bytes
    const mockStateHex = mockBuffer.toString('hex');
    const mockAuthUrl = `https://accounts.google.com/oauth/authorize?state=${mockStateHex}`;
    const mockRequest = {
      url: 'http://localhost:3000/api/auth/google',
      nextUrl: {
        searchParams: new URLSearchParams(),
      },
    } as unknown as NextRequest;

    jest.mocked(getActiveUserId).mockResolvedValue('user-123');
    jest.mocked(crypto.randomBytes).mockReturnValue(mockBuffer);
    jest.mocked(getAuthUrl).mockResolvedValue(mockAuthUrl);

    const mockRedirect = jest.fn().mockReturnValue({
      cookies: {
        set: jest.fn(),
      },
    });
    jest.mocked(NextResponse.redirect).mockImplementation(mockRedirect as any);

    const response = await GET(mockRequest);

    expect(getActiveUserId).toHaveBeenCalled();
    expect(crypto.randomBytes).toHaveBeenCalledWith(16);
    expect(getAuthUrl).toHaveBeenCalledWith(mockStateHex);
    expect(NextResponse.redirect).toHaveBeenCalledWith(mockAuthUrl);
  });

  it('sets state cookie with correct options', async () => {
    const mockStateHex = '72616e646f6d2d73746174652d76616c7565'; // 'random-state-value' in hex
    const mockAuthUrl = 'https://accounts.google.com/oauth/authorize';
    const mockRequest = {
      url: 'http://localhost:3000/api/auth/google',
      nextUrl: {
        searchParams: new URLSearchParams(),
      },
    } as unknown as NextRequest;

    const mockCookiesSet = jest.fn();
    const mockRedirectResponse = {
      cookies: {
        set: mockCookiesSet,
      },
    };

    jest.mocked(getActiveUserId).mockResolvedValue('user-123');
    // Create a buffer that when converted to hex will give us the expected value
    const mockBuffer = Buffer.alloc(16);
    mockBuffer.write(mockStateHex.slice(0, 32), 'hex');
    jest.mocked(crypto.randomBytes).mockReturnValue(mockBuffer);
    jest.mocked(getAuthUrl).mockResolvedValue(mockAuthUrl);
    jest
      .mocked(NextResponse.redirect)
      .mockReturnValue(mockRedirectResponse as any);

    await GET(mockRequest);

    // The state will be the hex representation of the random bytes
    const expectedState = mockBuffer.toString('hex');
    expect(mockCookiesSet).toHaveBeenCalledWith(
      'gmail_oauth_state',
      expectedState,
      {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        path: '/api/auth/google/callback',
        maxAge: 5 * 60, // 5 minutes
      }
    );
  });

  it('calls redirect when user is not authenticated (note: actual code has missing return)', async () => {
    const mockRequest = {
      url: 'http://localhost:3000/api/auth/google',
      nextUrl: {
        searchParams: new URLSearchParams(),
      },
    } as unknown as NextRequest;

    jest.mocked(getActiveUserId).mockResolvedValue(null);
    const mockRedirect = jest.fn().mockReturnValue({
      cookies: { set: jest.fn() },
    });
    jest.mocked(NextResponse.redirect).mockImplementation(mockRedirect as any);

    await GET(mockRequest);

    expect(getActiveUserId).toHaveBeenCalled();
    // Note: The actual code calls redirect but doesn't return, so execution continues
    // This is a bug in the actual code, but we test what it does
    expect(NextResponse.redirect).toHaveBeenCalledWith(
      new URL('/sign-in', mockRequest.url)
    );
  });

  it('generates random state value', async () => {
    const mockRequest = {
      url: 'http://localhost:3000/api/auth/google',
      nextUrl: {
        searchParams: new URLSearchParams(),
      },
    } as unknown as NextRequest;

    const mockBuffer = Buffer.alloc(16, 'b'); // Create a buffer with 16 bytes
    const expectedStateHex = mockBuffer.toString('hex');
    jest.mocked(getActiveUserId).mockResolvedValue('user-123');
    jest.mocked(crypto.randomBytes).mockReturnValue(mockBuffer);
    jest
      .mocked(getAuthUrl)
      .mockResolvedValue('https://accounts.google.com/oauth/authorize');
    jest.mocked(NextResponse.redirect).mockReturnValue({
      cookies: { set: jest.fn() },
    } as any);

    await GET(mockRequest);

    expect(crypto.randomBytes).toHaveBeenCalledWith(16);
    expect(getAuthUrl).toHaveBeenCalledWith(expectedStateHex);
  });

  it('uses correct redirect URL base from request', async () => {
    const mockRequest = {
      url: 'https://example.com/api/auth/google',
      nextUrl: {
        searchParams: new URLSearchParams(),
      },
    } as unknown as NextRequest;

    jest.mocked(getActiveUserId).mockResolvedValue(null);
    const mockRedirect = jest.fn().mockReturnValue({
      cookies: { set: jest.fn() },
    });
    jest.mocked(NextResponse.redirect).mockImplementation(mockRedirect as any);

    await GET(mockRequest);

    expect(NextResponse.redirect).toHaveBeenCalledWith(
      new URL('/sign-in', 'https://example.com/api/auth/google')
    );
  });
});
