import { createMailAccount } from '@/lib/repository/mailAccount';
import { db } from '@/db';
import { and, eq } from 'drizzle-orm';
import { NewMailAccount } from '@/lib/types/mail';

// Mock database
jest.mock('@/db', () => ({
  db: {
    $count: jest.fn(),
    insert: jest.fn(),
  },
}));

// Mock schema to avoid importing actual schema with drizzle dependencies
jest.mock('@/db/schema', () => ({
  mailAccount: {},
}));

// Mock drizzle-orm
jest.mock('drizzle-orm', () => ({
  and: jest.fn(),
  eq: jest.fn(),
}));

describe('createMailAccount', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockAccount: NewMailAccount = {
    userId: 'user-123',
    provider: 'gmail',
    providerAccountId: 'test@gmail.com',
    address: 'test@gmail.com',
    accessToken: 'access-token-123',
    refreshToken: 'refresh-token-123',
    accessTokenExpiresAt: new Date(Date.now() + 3600000),
    refreshTokenExpiresAt: null,
  };

  describe('Unit Tests', () => {
    it('successfully creates a mail account', async () => {
      const mockInsertResponse = {
        values: jest.fn().mockReturnThis(),
        returning: jest
          .fn()
          .mockResolvedValue([{ mailAccountId: 'account-123' }]),
      };
      const mockInsert = jest.fn().mockReturnValue(mockInsertResponse);

      jest.mocked(db.$count).mockResolvedValue(0); // No duplicate
      jest.mocked(db.insert).mockReturnValue(mockInsertResponse as any);
      jest.mocked(and).mockReturnValue({} as any);
      jest.mocked(eq).mockReturnValue({} as any);

      const result = await createMailAccount(mockAccount);

      expect(db.$count).toHaveBeenCalled();
      expect(db.insert).toHaveBeenCalled();
      expect(mockInsertResponse.values).toHaveBeenCalledWith({
        userId: 'user-123',
        provider: 'gmail',
        providerAccountId: 'test@gmail.com',
        address: 'test@gmail.com',
        accessToken: 'access-token-123',
        refreshToken: 'refresh-token-123',
        accessTokenExpiresAt: mockAccount.accessTokenExpiresAt,
        refreshTokenExpiresAt: undefined,
      });
      expect(result).toBe('account-123');
    });

    it('returns null when duplicate account exists', async () => {
      jest.mocked(db.$count).mockResolvedValue(1); // Duplicate exists
      jest.mocked(and).mockReturnValue({} as any);
      jest.mocked(eq).mockReturnValue({} as any);

      const result = await createMailAccount(mockAccount);

      expect(db.$count).toHaveBeenCalled();
      expect(db.insert).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('checks for duplicates using provider and providerAccountId', async () => {
      jest.mocked(db.$count).mockResolvedValue(0);
      const mockInsertResponse = {
        values: jest.fn().mockReturnThis(),
        returning: jest
          .fn()
          .mockResolvedValue([{ mailAccountId: 'account-123' }]),
      };
      jest.mocked(db.insert).mockReturnValue(mockInsertResponse as any);
      jest.mocked(and).mockReturnValue({} as any);
      jest.mocked(eq).mockReturnValue({} as any);

      await createMailAccount(mockAccount);

      expect(and).toHaveBeenCalledWith(
        expect.anything(), // eq(mailAccount.provider, 'gmail')
        expect.anything() // eq(mailAccount.providerAccountId, 'test@gmail.com')
      );
    });

    it('handles missing refreshToken', async () => {
      const accountWithoutRefresh: NewMailAccount = {
        ...mockAccount,
        refreshToken: null,
      };

      const mockInsertResponse = {
        values: jest.fn().mockReturnThis(),
        returning: jest
          .fn()
          .mockResolvedValue([{ mailAccountId: 'account-123' }]),
      };
      jest.mocked(db.$count).mockResolvedValue(0);
      jest.mocked(db.insert).mockReturnValue(mockInsertResponse as any);
      jest.mocked(and).mockReturnValue({} as any);
      jest.mocked(eq).mockReturnValue({} as any);

      await createMailAccount(accountWithoutRefresh);

      expect(mockInsertResponse.values).toHaveBeenCalledWith(
        expect.objectContaining({
          refreshToken: undefined,
        })
      );
    });

    it('handles missing accessTokenExpiresAt', async () => {
      const accountWithoutExpiry: NewMailAccount = {
        ...mockAccount,
        accessTokenExpiresAt: undefined,
      };

      const mockInsertResponse = {
        values: jest.fn().mockReturnThis(),
        returning: jest
          .fn()
          .mockResolvedValue([{ mailAccountId: 'account-123' }]),
      };
      jest.mocked(db.$count).mockResolvedValue(0);
      jest.mocked(db.insert).mockReturnValue(mockInsertResponse as any);
      jest.mocked(and).mockReturnValue({} as any);
      jest.mocked(eq).mockReturnValue({} as any);

      await createMailAccount(accountWithoutExpiry);

      expect(mockInsertResponse.values).toHaveBeenCalledWith(
        expect.objectContaining({
          accessTokenExpiresAt: undefined,
        })
      );
    });

    it('returns null when insert returns empty array', async () => {
      const mockInsertResponse = {
        values: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([]),
      };
      jest.mocked(db.$count).mockResolvedValue(0);
      jest.mocked(db.insert).mockReturnValue(mockInsertResponse as any);
      jest.mocked(and).mockReturnValue({} as any);
      jest.mocked(eq).mockReturnValue({} as any);

      const result = await createMailAccount(mockAccount);

      expect(result).toBeNull();
    });

    it('returns null when insert returns data without mailAccountId', async () => {
      const mockInsertResponse = {
        values: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([{}]),
      };
      jest.mocked(db.$count).mockResolvedValue(0);
      jest.mocked(db.insert).mockReturnValue(mockInsertResponse as any);
      jest.mocked(and).mockReturnValue({} as any);
      jest.mocked(eq).mockReturnValue({} as any);

      const result = await createMailAccount(mockAccount);

      expect(result).toBeNull();
    });

    it('handles database errors gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const dbError = new Error('Database connection failed');

      jest.mocked(db.$count).mockRejectedValue(dbError);
      jest.mocked(and).mockReturnValue({} as any);
      jest.mocked(eq).mockReturnValue({} as any);

      const result = await createMailAccount(mockAccount);

      expect(result).toBeUndefined();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error inserting mail account into db, ',
        dbError
      );

      consoleErrorSpy.mockRestore();
    });

    it('handles insert errors gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const insertError = new Error('Insert failed');

      const mockInsertResponse = {
        values: jest.fn().mockReturnThis(),
        returning: jest.fn().mockRejectedValue(insertError),
      };
      jest.mocked(db.$count).mockResolvedValue(0);
      jest.mocked(db.insert).mockReturnValue(mockInsertResponse as any);
      jest.mocked(and).mockReturnValue({} as any);
      jest.mocked(eq).mockReturnValue({} as any);

      const result = await createMailAccount(mockAccount);

      expect(result).toBeUndefined();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error inserting mail account into db, ',
        insertError
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Integration Tests', () => {
    // Note: Integration tests would require a test database setup
    // For now, these are placeholders that can be implemented when
    // a test database is configured
    it.skip('creates account in test database', async () => {
      // This would require:
      // 1. Test database connection
      // 2. Database cleanup before/after tests
      // 3. Real database operations
    });

    it.skip('prevents duplicate accounts in test database', async () => {
      // Integration test for duplicate prevention
    });
  });
});
