'use client';

import { useSession } from '@/lib/auth-client';
import { redirect } from 'next/navigation';

export default function Home() {
  const { data: session } = useSession();

  if (!session) redirect('/sign-in');

  return (
    <div>
      <h1 className="text-3xl font-bold underline">Hello World</h1>
    </div>
  );
}
