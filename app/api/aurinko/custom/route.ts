import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

import { auth } from '@/lib/auth/auth';

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const params = req.nextUrl.searchParams;
  console.log('SENDING PARAMS TO AURINKO CALLBACK');
  return NextResponse.redirect(
    new URL(`https://api.aurinko.io/v1/auth/callback?${params.toString()}`)
  );
}
