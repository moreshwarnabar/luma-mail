import { saveEmailAddress } from '@/lib/repository/emailAddress';
import { db } from '@/db';
import { emailAddress } from '@/db/schema';
import { NewEmailAddress } from '@/lib/types/mail';

// Mock database
jest.mock('@/db', () => ({
  db: {
    insert: jest.fn(),
  },
}));

describe('saveEmailAddress', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockEmailAddress: NewEmailAddress = {
    address: 'test@gmail.com',
    accountId: 'account-123',
  };

  describe('Unit Tests', () => {
    it('successfully saves an email address', async () => {
      const mockInsertResponse = {
        values: jest.fn().mockResolvedValue(undefined),
      };
      jest.mocked(db.insert).mockReturnValue(mockInsertResponse as any);

      await saveEmailAddress(mockEmailAddress);

      expect(db.insert).toHaveBeenCalledWith(emailAddress);
      expect(mockInsertResponse.values).toHaveBeenCalledWith({
        address: 'test@gmail.com',
        accountId: 'account-123',
      });
    });

    it('handles different email addresses', async () => {
      const mockInsertResponse = {
        values: jest.fn().mockResolvedValue(undefined),
      };
      jest.mocked(db.insert).mockReturnValue(mockInsertResponse as any);

      const differentEmail: NewEmailAddress = {
        address: 'another@example.com',
        accountId: 'account-456',
      };

      await saveEmailAddress(differentEmail);

      expect(mockInsertResponse.values).toHaveBeenCalledWith({
        address: 'another@example.com',
        accountId: 'account-456',
      });
    });

    it('handles database errors gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const dbError = new Error('Database connection failed');

      const mockInsertResponse = {
        values: jest.fn().mockRejectedValue(dbError),
      };
      jest.mocked(db.insert).mockReturnValue(mockInsertResponse as any);

      await saveEmailAddress(mockEmailAddress);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error while saving email address, ',
        dbError
      );

      consoleErrorSpy.mockRestore();
    });

    it('handles unique constraint violations', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const uniqueError = new Error(
        'duplicate key value violates unique constraint'
      );

      const mockInsertResponse = {
        values: jest.fn().mockRejectedValue(uniqueError),
      };
      jest.mocked(db.insert).mockReturnValue(mockInsertResponse as any);

      await saveEmailAddress(mockEmailAddress);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error while saving email address, ',
        uniqueError
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Integration Tests', () => {
    // Note: Integration tests would require a test database setup
    it.skip('saves email address in test database', async () => {
      // This would require:
      // 1. Test database connection
      // 2. Database cleanup before/after tests
      // 3. Real database operations
    });

    it.skip('enforces unique constraint in test database', async () => {
      // Integration test for unique constraint
    });
  });
});
