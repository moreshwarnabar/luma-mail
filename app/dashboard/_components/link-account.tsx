'use client';

import { Button } from '@/components/ui/button';
import { getAurinkoAuthUrl } from '@/lib/aurinko';

const LinkAccount = () => {
  return (
    <div>
      <Button
        onClick={async () => {
          const aurinkoUrl = await getAurinkoAuthUrl('Google');
          window.location.href = aurinkoUrl;
        }}
      >
        Link Account
      </Button>
    </div>
  );
};

export default LinkAccount;
