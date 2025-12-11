import { getOAuth2Client, getAuthUrl } from '@/lib/google/gmail';
import { google } from 'googleapis';

// Mock googleapis
jest.mock('googleapis', () => ({
  google: {
    auth: {
      OAuth2: jest.fn(),
    },
  },
}));

describe('Gmail OAuth Utilities', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = {
      ...originalEnv,
      GOOGLE_CLIENT_ID: 'test-client-id',
      GOOGLE_CLIENT_SECRET: 'test-client-secret',
      GOOGLE_REDIRECT_URI: 'http://localhost:3000/api/auth/google/callback',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('getOAuth2Client', () => {
    it('creates OAuth2 client with correct credentials', () => {
      const mockOAuth2Client = {
        generateAuthUrl: jest.fn(),
        setCredentials: jest.fn(),
        getToken: jest.fn(),
      };
      jest.mocked(google.auth.OAuth2).mockReturnValue(mockOAuth2Client as any);

      const client = getOAuth2Client();

      expect(google.auth.OAuth2).toHaveBeenCalledWith(
        'test-client-id',
        'test-client-secret',
        'http://localhost:3000/api/auth/google/callback'
      );
      expect(client).toBe(mockOAuth2Client);
    });

    it('uses environment variables for configuration', () => {
      const mockOAuth2Client = {
        generateAuthUrl: jest.fn(),
        setCredentials: jest.fn(),
        getToken: jest.fn(),
      };
      jest.mocked(google.auth.OAuth2).mockReturnValue(mockOAuth2Client as any);

      getOAuth2Client();

      expect(google.auth.OAuth2).toHaveBeenCalledWith(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
      );
    });
  });

  describe('getAuthUrl', () => {
    it('generates auth URL with correct parameters', async () => {
      const mockGenerateAuthUrl = jest
        .fn()
        .mockReturnValue(
          'https://accounts.google.com/oauth/authorize?state=test-state'
        );
      const mockOAuth2Client = {
        generateAuthUrl: mockGenerateAuthUrl,
        setCredentials: jest.fn(),
        getToken: jest.fn(),
      };
      jest.mocked(google.auth.OAuth2).mockReturnValue(mockOAuth2Client as any);

      const state = 'test-state-123';
      const url = await getAuthUrl(state);

      expect(mockGenerateAuthUrl).toHaveBeenCalledWith({
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/gmail.readonly'],
        state: 'test-state-123',
      });
      expect(url).toBe(
        'https://accounts.google.com/oauth/authorize?state=test-state'
      );
    });

    it('includes state parameter in auth URL', async () => {
      const mockGenerateAuthUrl = jest
        .fn()
        .mockReturnValue('https://accounts.google.com/oauth/authorize');
      const mockOAuth2Client = {
        generateAuthUrl: mockGenerateAuthUrl,
        setCredentials: jest.fn(),
        getToken: jest.fn(),
      };
      jest.mocked(google.auth.OAuth2).mockReturnValue(mockOAuth2Client as any);

      const state = 'random-state-value';
      await getAuthUrl(state);

      expect(mockGenerateAuthUrl).toHaveBeenCalledWith(
        expect.objectContaining({
          state: 'random-state-value',
        })
      );
    });

    it('configures correct scope for Gmail readonly access', async () => {
      const mockGenerateAuthUrl = jest
        .fn()
        .mockReturnValue('https://accounts.google.com/oauth/authorize');
      const mockOAuth2Client = {
        generateAuthUrl: mockGenerateAuthUrl,
        setCredentials: jest.fn(),
        getToken: jest.fn(),
      };
      jest.mocked(google.auth.OAuth2).mockReturnValue(mockOAuth2Client as any);

      await getAuthUrl('test-state');

      expect(mockGenerateAuthUrl).toHaveBeenCalledWith(
        expect.objectContaining({
          scope: ['https://www.googleapis.com/auth/gmail.readonly'],
        })
      );
    });

    it('sets access_type to offline for refresh tokens', async () => {
      const mockGenerateAuthUrl = jest
        .fn()
        .mockReturnValue('https://accounts.google.com/oauth/authorize');
      const mockOAuth2Client = {
        generateAuthUrl: mockGenerateAuthUrl,
        setCredentials: jest.fn(),
        getToken: jest.fn(),
      };
      jest.mocked(google.auth.OAuth2).mockReturnValue(mockOAuth2Client as any);

      await getAuthUrl('test-state');

      expect(mockGenerateAuthUrl).toHaveBeenCalledWith(
        expect.objectContaining({
          access_type: 'offline',
        })
      );
    });
  });
});
