import { fetchUserProfile } from '@/modules/email/services/gmailService';
import { getOAuth2Client } from '@/lib/google/gmail';
import { google } from 'googleapis';
import type { Credentials } from 'google-auth-library';

// Mock Gmail OAuth utilities
jest.mock('@/lib/google/gmail', () => ({
  getOAuth2Client: jest.fn(),
}));

// Mock googleapis
jest.mock('googleapis', () => ({
  google: {
    gmail: jest.fn(),
  },
}));

describe('gmailService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchUserProfile', () => {
    const mockTokens: Credentials = {
      access_token: 'test-access-token',
      refresh_token: 'test-refresh-token',
      expiry_date: Date.now() + 3600000,
    };

    it('successfully fetches user profile', async () => {
      const mockOAuth2Client = {
        setCredentials: jest.fn(),
      };
      const mockGmailClient = {
        users: {
          getProfile: jest.fn().mockResolvedValue({
            data: {
              emailAddress: 'test@gmail.com',
              messagesTotal: 100,
              threadsTotal: 50,
              historyId: '12345',
            },
          }),
        },
      };

      jest.mocked(getOAuth2Client).mockReturnValue(mockOAuth2Client as any);
      jest.mocked(google.gmail).mockReturnValue(mockGmailClient as any);

      const profile = await fetchUserProfile(mockTokens);

      expect(getOAuth2Client).toHaveBeenCalled();
      expect(mockOAuth2Client.setCredentials).toHaveBeenCalledWith({
        access_token: 'test-access-token',
        refresh_token: 'test-refresh-token',
      });
      expect(google.gmail).toHaveBeenCalledWith({
        version: 'v1',
        auth: mockOAuth2Client,
      });
      expect(mockGmailClient.users.getProfile).toHaveBeenCalledWith({
        userId: 'me',
      });
      expect(profile).toEqual({
        emailAddress: 'test@gmail.com',
        messagesTotal: 100,
        threadsTotal: 50,
        historyId: '12345',
      });
    });

    it('sets OAuth2 client credentials correctly', async () => {
      const mockOAuth2Client = {
        setCredentials: jest.fn(),
      };
      const mockGmailClient = {
        users: {
          getProfile: jest.fn().mockResolvedValue({
            data: {
              emailAddress: 'test@gmail.com',
            },
          }),
        },
      };

      jest.mocked(getOAuth2Client).mockReturnValue(mockOAuth2Client as any);
      jest.mocked(google.gmail).mockReturnValue(mockGmailClient as any);

      const tokens: Credentials = {
        access_token: 'custom-access-token',
        refresh_token: 'custom-refresh-token',
      };

      await fetchUserProfile(tokens);

      expect(mockOAuth2Client.setCredentials).toHaveBeenCalledWith({
        access_token: 'custom-access-token',
        refresh_token: 'custom-refresh-token',
      });
    });

    it('returns null when profile fetch fails', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const mockOAuth2Client = {
        setCredentials: jest.fn(),
      };
      const mockGmailClient = {
        users: {
          getProfile: jest.fn().mockRejectedValue(new Error('API Error')),
        },
      };

      jest.mocked(getOAuth2Client).mockReturnValue(mockOAuth2Client as any);
      jest.mocked(google.gmail).mockReturnValue(mockGmailClient as any);

      const profile = await fetchUserProfile(mockTokens);

      expect(profile).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error fetching gmail profile. ',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });

    it('returns null when profile has no emailAddress', async () => {
      const mockOAuth2Client = {
        setCredentials: jest.fn(),
      };
      const mockGmailClient = {
        users: {
          getProfile: jest.fn().mockResolvedValue({
            data: {
              messagesTotal: 100,
              // emailAddress is missing
            },
          }),
        },
      };

      jest.mocked(getOAuth2Client).mockReturnValue(mockOAuth2Client as any);
      jest.mocked(google.gmail).mockReturnValue(mockGmailClient as any);

      const profile = await fetchUserProfile(mockTokens);

      expect(profile).toEqual({
        messagesTotal: 100,
      });
    });

    it('handles tokens without refresh_token', async () => {
      const mockOAuth2Client = {
        setCredentials: jest.fn(),
      };
      const mockGmailClient = {
        users: {
          getProfile: jest.fn().mockResolvedValue({
            data: {
              emailAddress: 'test@gmail.com',
            },
          }),
        },
      };

      jest.mocked(getOAuth2Client).mockReturnValue(mockOAuth2Client as any);
      jest.mocked(google.gmail).mockReturnValue(mockGmailClient as any);

      const tokensWithoutRefresh: Credentials = {
        access_token: 'test-access-token',
      };

      await fetchUserProfile(tokensWithoutRefresh);

      expect(mockOAuth2Client.setCredentials).toHaveBeenCalledWith({
        access_token: 'test-access-token',
        refresh_token: undefined,
      });
    });
  });
});
