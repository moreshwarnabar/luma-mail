import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { redirect } from 'next/navigation';

import Page from '@/app/page';
import { auth } from '@/lib/auth';

describe('Page', () => {
  it('renders a heading', async () => {
    render(await Page());

    const heading = await screen.findByRole('heading', { level: 1 });

    expect(heading).toBeInTheDocument();
  });

  it('redirects when no session', async () => {
    jest.mocked(auth.api.getSession).mockResolvedValue(null);

    await Page();

    expect(redirect).toHaveBeenCalledWith('/sign-in');
  });
});
