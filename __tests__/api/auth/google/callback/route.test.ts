import { GET } from '@/app/api/auth/google/callback/route';
import { NextRequest, NextResponse } from 'next/server';
import { getOAuth2Client } from '@/lib/google/gmail';
import { fetchUserProfile } from '@/modules/email/services/gmailService';
import { getActiveUserId } from '@/lib/auth/auth';
import { createMailAccount } from '@/lib/repository/mailAccount';
import { saveEmailAddress } from '@/lib/repository/emailAddress';
import { cookies } from 'next/headers';

// Mock dependencies
jest.mock('@/lib/google/gmail', () => ({
  getOAuth2Client: jest.fn(),
}));

jest.mock('@/modules/email/services/gmailService', () => ({
  fetchUserProfile: jest.fn(),
}));

jest.mock('@/lib/auth/auth', () => ({
  getActiveUserId: jest.fn(),
}));

jest.mock('@/lib/repository/mailAccount', () => ({
  createMailAccount: jest.fn(),
}));

jest.mock('@/lib/repository/emailAddress', () => ({
  saveEmailAddress: jest.fn(),
}));

jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}));

// Mock NextResponse
jest.mock('next/server', () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    redirect: jest.fn(),
  },
}));

describe('GET /api/auth/google/callback', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createMockRequest = (params: { code?: string; state?: string }) => {
    const url = new URL('http://localhost:3000/api/auth/google/callback');
    if (params.code) url.searchParams.set('code', params.code);
    if (params.state) url.searchParams.set('state', params.state);

    return {
      url: url.toString(),
      nextUrl: {
        searchParams: url.searchParams,
      },
    } as unknown as NextRequest;
  };

  describe('State Validation', () => {
    it('redirects to sign-in with error when state is missing', async () => {
      const mockRequest = createMockRequest({ code: 'auth-code' });
      const mockCookieStore = {
        get: jest.fn().mockReturnValue({ value: 'stored-state' }),
        delete: jest.fn(),
      };
      jest.mocked(cookies).mockResolvedValue(mockCookieStore as any);
      const mockRedirect = jest.fn().mockReturnValue({
        cookies: { delete: jest.fn() },
      });
      jest
        .mocked(NextResponse.redirect)
        .mockImplementation(mockRedirect as any);

      const response = await GET(mockRequest);

      expect(NextResponse.redirect).toHaveBeenCalledWith(
        new URL('/sign-in?error=oauth_state', mockRequest.url)
      );
      expect(mockRedirect().cookies.delete).toHaveBeenCalledWith(
        'gmail_oauth_state'
      );
    });

    it('redirects to sign-in with error when stored state is missing', async () => {
      const mockRequest = createMockRequest({
        code: 'auth-code',
        state: 'state-value',
      });
      const mockCookieStore = {
        get: jest.fn().mockReturnValue(undefined),
        delete: jest.fn(),
      };
      jest.mocked(cookies).mockResolvedValue(mockCookieStore as any);
      const mockRedirect = jest.fn().mockReturnValue({
        cookies: { delete: jest.fn() },
      });
      jest
        .mocked(NextResponse.redirect)
        .mockImplementation(mockRedirect as any);

      await GET(mockRequest);

      expect(NextResponse.redirect).toHaveBeenCalledWith(
        new URL('/sign-in?error=oauth_state', mockRequest.url)
      );
    });

    it('redirects to sign-in with error when states do not match', async () => {
      const mockRequest = createMockRequest({
        code: 'auth-code',
        state: 'state-value',
      });
      const mockCookieStore = {
        get: jest.fn().mockReturnValue({ value: 'different-state' }),
        delete: jest.fn(),
      };
      jest.mocked(cookies).mockResolvedValue(mockCookieStore as any);
      const mockRedirect = jest.fn().mockReturnValue({
        cookies: { delete: jest.fn() },
      });
      jest
        .mocked(NextResponse.redirect)
        .mockImplementation(mockRedirect as any);

      await GET(mockRequest);

      expect(NextResponse.redirect).toHaveBeenCalledWith(
        new URL('/sign-in?error=oauth_state', mockRequest.url)
      );
    });

    it('deletes state cookie when states match', async () => {
      const mockRequest = createMockRequest({
        code: 'auth-code',
        state: 'state-value',
      });
      const mockCookieStore = {
        get: jest.fn().mockReturnValue({ value: 'state-value' }),
        delete: jest.fn(),
      };
      jest.mocked(cookies).mockResolvedValue(mockCookieStore as any);
      const mockOAuthClient = {
        getToken: jest.fn().mockResolvedValue({
          tokens: { access_token: 'access-token' },
        }),
      };
      jest.mocked(getOAuth2Client).mockReturnValue(mockOAuthClient as any);
      jest
        .mocked(fetchUserProfile)
        .mockResolvedValue({ emailAddress: 'test@gmail.com' });
      jest.mocked(getActiveUserId).mockResolvedValue('user-123');
      jest.mocked(createMailAccount).mockResolvedValue('account-123');
      jest.mocked(saveEmailAddress).mockResolvedValue(undefined);
      jest.mocked(NextResponse.redirect).mockReturnValue({
        cookies: { delete: jest.fn() },
      } as any);

      await GET(mockRequest);

      expect(mockCookieStore.delete).toHaveBeenCalledWith('gmail_oauth_state');
    });
  });

  describe('Code Parameter', () => {
    it('redirects to sign-in when code is missing', async () => {
      const mockRequest = createMockRequest({ state: 'state-value' });
      const mockCookieStore = {
        get: jest.fn().mockReturnValue({ value: 'state-value' }),
        delete: jest.fn(),
      };
      jest.mocked(cookies).mockResolvedValue(mockCookieStore as any);
      const mockRedirect = jest.fn();
      jest
        .mocked(NextResponse.redirect)
        .mockImplementation(mockRedirect as any);

      await GET(mockRequest);

      expect(NextResponse.redirect).toHaveBeenCalledWith(
        new URL('/sign-in', mockRequest.url)
      );
    });
  });

  describe('Successful OAuth Flow', () => {
    it('successfully completes OAuth callback flow', async () => {
      const mockRequest = createMockRequest({
        code: 'auth-code',
        state: 'state-value',
      });
      const mockCookieStore = {
        get: jest.fn().mockReturnValue({ value: 'state-value' }),
        delete: jest.fn(),
      };
      jest.mocked(cookies).mockResolvedValue(mockCookieStore as any);

      const mockTokens = {
        access_token: 'access-token-123',
        refresh_token: 'refresh-token-123',
        expiry_date: Date.now() + 3600000,
      };
      const mockOAuthClient = {
        getToken: jest.fn().mockResolvedValue({ tokens: mockTokens }),
      };
      const mockProfile = {
        emailAddress: 'test@gmail.com',
        messagesTotal: 100,
      };

      jest.mocked(getOAuth2Client).mockReturnValue(mockOAuthClient as any);
      jest.mocked(fetchUserProfile).mockResolvedValue(mockProfile);
      jest.mocked(getActiveUserId).mockResolvedValue('user-123');
      jest.mocked(createMailAccount).mockResolvedValue('account-123');
      jest.mocked(saveEmailAddress).mockResolvedValue(undefined);

      const mockRedirectResponse = {
        cookies: { delete: jest.fn() },
      };
      jest
        .mocked(NextResponse.redirect)
        .mockReturnValue(mockRedirectResponse as any);

      const response = await GET(mockRequest);

      expect(mockOAuthClient.getToken).toHaveBeenCalledWith('auth-code');
      expect(fetchUserProfile).toHaveBeenCalledWith(mockTokens);
      expect(getActiveUserId).toHaveBeenCalled();
      expect(createMailAccount).toHaveBeenCalledWith({
        userId: 'user-123',
        accessToken: 'access-token-123',
        refreshToken: 'refresh-token-123',
        accessTokenExpiresAt: expect.any(Date),
        refreshTokenExpiresAt: null,
        provider: 'gmail',
        providerAccountId: 'test@gmail.com',
        address: 'test@gmail.com',
      });
      expect(saveEmailAddress).toHaveBeenCalledWith({
        address: 'test@gmail.com',
        accountId: 'account-123',
      });
      expect(NextResponse.redirect).toHaveBeenCalledWith(
        new URL('/dashboard?connected=gmail', mockRequest.url)
      );
    });

    it('handles tokens without expiry_date', async () => {
      const mockRequest = createMockRequest({
        code: 'auth-code',
        state: 'state-value',
      });
      const mockCookieStore = {
        get: jest.fn().mockReturnValue({ value: 'state-value' }),
        delete: jest.fn(),
      };
      jest.mocked(cookies).mockResolvedValue(mockCookieStore as any);

      const mockTokens = {
        access_token: 'access-token-123',
        refresh_token: 'refresh-token-123',
      };
      const mockOAuthClient = {
        getToken: jest.fn().mockResolvedValue({ tokens: mockTokens }),
      };

      jest.mocked(getOAuth2Client).mockReturnValue(mockOAuthClient as any);
      jest
        .mocked(fetchUserProfile)
        .mockResolvedValue({ emailAddress: 'test@gmail.com' });
      jest.mocked(getActiveUserId).mockResolvedValue('user-123');
      jest.mocked(createMailAccount).mockResolvedValue('account-123');
      jest.mocked(saveEmailAddress).mockResolvedValue(undefined);
      jest.mocked(NextResponse.redirect).mockReturnValue({
        cookies: { delete: jest.fn() },
      } as any);

      await GET(mockRequest);

      expect(createMailAccount).toHaveBeenCalledWith(
        expect.objectContaining({
          accessTokenExpiresAt: undefined,
        })
      );
    });
  });

  describe('Error Handling', () => {
    it('returns null when access_token is missing', async () => {
      const mockRequest = createMockRequest({
        code: 'auth-code',
        state: 'state-value',
      });
      const mockCookieStore = {
        get: jest.fn().mockReturnValue({ value: 'state-value' }),
        delete: jest.fn(),
      };
      jest.mocked(cookies).mockResolvedValue(mockCookieStore as any);

      const mockOAuthClient = {
        getToken: jest.fn().mockResolvedValue({
          tokens: { refresh_token: 'refresh-token' }, // No access_token
        }),
      };

      jest.mocked(getOAuth2Client).mockReturnValue(mockOAuthClient as any);

      const response = await GET(mockRequest);

      expect(response).toBeNull();
      expect(fetchUserProfile).not.toHaveBeenCalled();
    });

    it('returns null when profile is missing', async () => {
      const mockRequest = createMockRequest({
        code: 'auth-code',
        state: 'state-value',
      });
      const mockCookieStore = {
        get: jest.fn().mockReturnValue({ value: 'state-value' }),
        delete: jest.fn(),
      };
      jest.mocked(cookies).mockResolvedValue(mockCookieStore as any);

      const mockOAuthClient = {
        getToken: jest.fn().mockResolvedValue({
          tokens: { access_token: 'access-token' },
        }),
      };

      jest.mocked(getOAuth2Client).mockReturnValue(mockOAuthClient as any);
      jest.mocked(fetchUserProfile).mockResolvedValue(null);

      const response = await GET(mockRequest);

      expect(response).toBeNull();
      expect(getActiveUserId).not.toHaveBeenCalled();
    });

    it('returns null when profile emailAddress is missing', async () => {
      const mockRequest = createMockRequest({
        code: 'auth-code',
        state: 'state-value',
      });
      const mockCookieStore = {
        get: jest.fn().mockReturnValue({ value: 'state-value' }),
        delete: jest.fn(),
      };
      jest.mocked(cookies).mockResolvedValue(mockCookieStore as any);

      const mockOAuthClient = {
        getToken: jest.fn().mockResolvedValue({
          tokens: { access_token: 'access-token' },
        }),
      };

      jest.mocked(getOAuth2Client).mockReturnValue(mockOAuthClient as any);
      jest.mocked(fetchUserProfile).mockResolvedValue({ messagesTotal: 100 }); // No emailAddress

      const response = await GET(mockRequest);

      expect(response).toBeNull();
      expect(getActiveUserId).not.toHaveBeenCalled();
    });

    it('returns null when user is not authenticated', async () => {
      const mockRequest = createMockRequest({
        code: 'auth-code',
        state: 'state-value',
      });
      const mockCookieStore = {
        get: jest.fn().mockReturnValue({ value: 'state-value' }),
        delete: jest.fn(),
      };
      jest.mocked(cookies).mockResolvedValue(mockCookieStore as any);

      const mockOAuthClient = {
        getToken: jest.fn().mockResolvedValue({
          tokens: { access_token: 'access-token' },
        }),
      };

      jest.mocked(getOAuth2Client).mockReturnValue(mockOAuthClient as any);
      jest
        .mocked(fetchUserProfile)
        .mockResolvedValue({ emailAddress: 'test@gmail.com' });
      jest.mocked(getActiveUserId).mockResolvedValue(null);

      const response = await GET(mockRequest);

      expect(response).toBeNull();
      expect(createMailAccount).not.toHaveBeenCalled();
    });

    it('returns null when mail account creation fails', async () => {
      const mockRequest = createMockRequest({
        code: 'auth-code',
        state: 'state-value',
      });
      const mockCookieStore = {
        get: jest.fn().mockReturnValue({ value: 'state-value' }),
        delete: jest.fn(),
      };
      jest.mocked(cookies).mockResolvedValue(mockCookieStore as any);

      const mockOAuthClient = {
        getToken: jest.fn().mockResolvedValue({
          tokens: { access_token: 'access-token' },
        }),
      };

      jest.mocked(getOAuth2Client).mockReturnValue(mockOAuthClient as any);
      jest
        .mocked(fetchUserProfile)
        .mockResolvedValue({ emailAddress: 'test@gmail.com' });
      jest.mocked(getActiveUserId).mockResolvedValue('user-123');
      jest.mocked(createMailAccount).mockResolvedValue(null); // Creation failed

      const response = await GET(mockRequest);

      expect(response).toBeNull();
      expect(saveEmailAddress).not.toHaveBeenCalled();
    });

    it('handles OAuth client errors gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const mockRequest = createMockRequest({
        code: 'auth-code',
        state: 'state-value',
      });
      const mockCookieStore = {
        get: jest.fn().mockReturnValue({ value: 'state-value' }),
        delete: jest.fn(),
      };
      jest.mocked(cookies).mockResolvedValue(mockCookieStore as any);

      const oauthError = new Error('OAuth error');
      const mockOAuthClient = {
        getToken: jest.fn().mockRejectedValue(oauthError),
      };

      jest.mocked(getOAuth2Client).mockReturnValue(mockOAuthClient as any);

      const response = await GET(mockRequest);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Encountered an error, ',
        oauthError
      );
      expect(response).toBeUndefined();

      consoleErrorSpy.mockRestore();
    });

    it('handles profile fetch errors gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const mockRequest = createMockRequest({
        code: 'auth-code',
        state: 'state-value',
      });
      const mockCookieStore = {
        get: jest.fn().mockReturnValue({ value: 'state-value' }),
        delete: jest.fn(),
      };
      jest.mocked(cookies).mockResolvedValue(mockCookieStore as any);

      const mockOAuthClient = {
        getToken: jest.fn().mockResolvedValue({
          tokens: { access_token: 'access-token' },
        }),
      };
      const profileError = new Error('Profile fetch error');

      jest.mocked(getOAuth2Client).mockReturnValue(mockOAuthClient as any);
      jest.mocked(fetchUserProfile).mockRejectedValue(profileError);

      const response = await GET(mockRequest);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Encountered an error, ',
        profileError
      );

      consoleErrorSpy.mockRestore();
    });
  });
});
