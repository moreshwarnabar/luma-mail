import '@testing-library/jest-dom';
import { redirect } from 'next/navigation';

import Page from '@/app/page';
import { auth } from '@/lib/auth';

describe('Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(auth.api.getSession).mockClear();
  });

  it('redirects to dashboard when session exists', async () => {
    await Page();

    expect(redirect).toHaveBeenCalledWith('/dashboard');
  });

  it('redirects to sign-in when no session', async () => {
    jest.mocked(auth.api.getSession).mockResolvedValue(null);

    await Page();

    expect(redirect).toHaveBeenCalledWith('/sign-in');
  });
});
