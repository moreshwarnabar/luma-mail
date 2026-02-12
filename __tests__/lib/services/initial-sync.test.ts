import { performInitialSync } from '@/lib/services/initial-sync';
import {
  findEmailAccountById,
  updateDeltaTokenById,
} from '@/lib/repository/mail-account';
import { AurinkoEmailClient } from '@/lib/clients/aurinko-email-client';
import { syncEmails } from '@/lib/services/sync-emails';

jest.mock('@/lib/repository/mail-account');
jest.mock('@/lib/clients/aurinko-email-client');
jest.mock('@/lib/services/sync-emails');

jest.spyOn(console, 'error').mockImplementation(() => {});
jest.spyOn(console, 'log').mockImplementation(() => {});

const mockedFindAccount = findEmailAccountById as jest.MockedFunction<typeof findEmailAccountById>;
const mockedUpdateDelta = updateDeltaTokenById as jest.MockedFunction<typeof updateDeltaTokenById>;
const mockedSyncEmails = syncEmails as jest.MockedFunction<typeof syncEmails>;

const mockPerformInitialSync = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();

  (AurinkoEmailClient as jest.MockedClass<typeof AurinkoEmailClient>).mockImplementation(
    () =>
      ({
        performInitialSync: mockPerformInitialSync,
      }) as any
  );
});

describe('performInitialSync', () => {
  const account = {
    id: 'acc-1',
    userId: 'user-1',
    aurinkoId: 123,
    accessToken: 'access-tok',
    emailAddress: 'a@b.com',
    name: 'Test',
    linkedAt: new Date(),
  };

  it('returns { success: true } on full flow', async () => {
    mockedFindAccount.mockResolvedValue(account);
    mockPerformInitialSync.mockResolvedValue({
      emails: [{ id: 'e1' }],
      deltaToken: 'dt1',
    });
    mockedUpdateDelta.mockResolvedValue('acc-1');
    mockedSyncEmails.mockResolvedValue(undefined);

    const result = await performInitialSync('acc-1', 'user-1');
    expect(result).toEqual({ success: true });
  });

  it('throws when account not found', async () => {
    mockedFindAccount.mockResolvedValue(undefined as any);

    await expect(performInitialSync('acc-1', 'user-1')).rejects.toThrow(
      'Account not found'
    );
  });

  it('throws when sync returns undefined', async () => {
    mockedFindAccount.mockResolvedValue(account);
    mockPerformInitialSync.mockResolvedValue(undefined);

    await expect(performInitialSync('acc-1', 'user-1')).rejects.toThrow(
      'Failed to sync account'
    );
  });

  it('passes correct accessToken to AurinkoEmailClient', async () => {
    mockedFindAccount.mockResolvedValue(account);
    mockPerformInitialSync.mockResolvedValue({
      emails: [],
      deltaToken: 'dt',
    });
    mockedUpdateDelta.mockResolvedValue('acc-1');
    mockedSyncEmails.mockResolvedValue(undefined);

    await performInitialSync('acc-1', 'user-1');

    expect(AurinkoEmailClient).toHaveBeenCalledWith('access-tok');
  });

  it('updates delta token before syncing emails', async () => {
    const callOrder: string[] = [];
    mockedFindAccount.mockResolvedValue(account);
    mockPerformInitialSync.mockResolvedValue({
      emails: [{ id: 'e1' }],
      deltaToken: 'dt1',
    });
    mockedUpdateDelta.mockImplementation(async () => {
      callOrder.push('updateDelta');
      return 'acc-1';
    });
    mockedSyncEmails.mockImplementation(async () => {
      callOrder.push('syncEmails');
    });

    await performInitialSync('acc-1', 'user-1');

    expect(callOrder).toEqual(['updateDelta', 'syncEmails']);
  });
});
