'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Link from 'next/link';

const Dashboard = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Link Account</CardTitle>
        <CardDescription>
          Click the button to link your gmail account to Luma Mail.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Link href="/api/auth/google">
          <Button>Connect to Gmail</Button>
        </Link>
      </CardContent>
    </Card>
  );
};

export default Dashboard;
