import { redirect } from 'next/navigation';

import Page from '@/app/page';
import { auth } from '@/lib/auth/auth';

describe('Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('redirects to sign-in when no session', async () => {
    jest.mocked(auth.api.getSession).mockResolvedValue(null);

    await Page();

    expect(redirect).toHaveBeenCalledWith('/sign-in');
  });

  it('redirects to dashboard when session exists', async () => {
    jest.mocked(auth.api.getSession).mockResolvedValue({
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
    });

    await Page();

    expect(redirect).toHaveBeenCalledWith('/dashboard');
  });
});
