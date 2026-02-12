import '@testing-library/jest-dom';
import { redirect } from 'next/navigation';

import Page from '@/app/page';
import { auth } from '@/lib/auth/auth';
import { findAllMailAccountsByUserId } from '@/lib/repository/mail-account';

jest.mock('@/lib/repository/mail-account');

const mockedRedirect = redirect as unknown as jest.Mock;
const mockedFindAccounts = findAllMailAccountsByUserId as jest.MockedFunction<
  typeof findAllMailAccountsByUserId
>;

const redirectError = new Error('NEXT_REDIRECT');

describe('Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedRedirect.mockImplementation(() => {
      throw redirectError;
    });
  });

  it('redirects to sign-in when no session', async () => {
    jest.mocked(auth.api.getSession).mockResolvedValue(null);

    await expect(Page()).rejects.toThrow(redirectError);

    expect(mockedRedirect).toHaveBeenCalledWith('/sign-in');
  });

  it('redirects to /dashboard when session exists but no accounts', async () => {
    jest.mocked(auth.api.getSession).mockResolvedValue({
      session: { id: 's1', userId: '1', token: 't', expiresAt: new Date(), createdAt: new Date(), updatedAt: new Date() },
      user: { id: '1', name: 'Test', email: 'test@example.com', emailVerified: false, createdAt: new Date(), updatedAt: new Date() },
    });
    mockedFindAccounts.mockResolvedValue([]);

    await expect(Page()).rejects.toThrow(redirectError);

    expect(mockedRedirect).toHaveBeenCalledWith('/dashboard');
  });

  it('redirects to account inbox when accounts exist', async () => {
    jest.mocked(auth.api.getSession).mockResolvedValue({
      session: { id: 's1', userId: '1', token: 't', expiresAt: new Date(), createdAt: new Date(), updatedAt: new Date() },
      user: { id: '1', name: 'Test', email: 'test@example.com', emailVerified: false, createdAt: new Date(), updatedAt: new Date() },
    });
    mockedFindAccounts.mockResolvedValue([
      {
        id: 'acc-1',
        userId: '1',
        aurinkoId: 1,
        accessToken: 'tok',
        emailAddress: 'test@example.com',
        name: 'Test',
        linkedAt: new Date(),
      },
    ]);

    await expect(Page()).rejects.toThrow(redirectError);

    expect(mockedRedirect).toHaveBeenCalledWith(
      '/dashboard/acc-1/inbox?page=1'
    );
  });
});
