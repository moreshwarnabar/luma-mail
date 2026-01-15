import { redirect } from 'next/navigation';
import Page from '@/app/page';

it('redirects to dashboard when session exists', async () => {
  await Page();
  expect(redirect).toHaveBeenCalledWith('/dashboard');
});
