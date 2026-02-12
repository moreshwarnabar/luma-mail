import { db } from '@/db';
import { saveEmailAddress } from '@/lib/repository/email-address';

jest.spyOn(console, 'error').mockImplementation(() => {});

function mockDbChain(terminalValue: unknown) {
  const chain: Record<string, jest.Mock> = {};
  const methods = [
    'insert',
    'values',
    'onConflictDoUpdate',
    'returning',
  ];
  for (const m of methods) chain[m] = jest.fn().mockReturnValue(chain);
  chain.returning = jest.fn().mockResolvedValue(terminalValue);
  return chain;
}

describe('saveEmailAddress', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('upserts and returns { addressId, address }', async () => {
    const chain = mockDbChain([
      { addressId: 'addr-1', address: 'alice@test.com' },
    ]);
    (db as any).insert = chain.insert;

    const result = await saveEmailAddress(
      { name: 'Alice', address: 'alice@test.com', raw: 'Alice <alice@test.com>' },
      'account-1'
    );

    expect(result).toEqual({ addressId: 'addr-1', address: 'alice@test.com' });
    expect(chain.insert).toHaveBeenCalled();
    expect(chain.values).toHaveBeenCalledWith({
      name: 'Alice',
      address: 'alice@test.com',
      raw: 'Alice <alice@test.com>',
      mailAccountId: 'account-1',
    });
    expect(chain.onConflictDoUpdate).toHaveBeenCalled();
  });

  it('returns undefined and logs error on DB failure', async () => {
    const chain = mockDbChain([]);
    chain.returning = jest.fn().mockRejectedValue(new Error('DB error'));
    (db as any).insert = chain.insert;

    const result = await saveEmailAddress(
      { name: 'Bob', address: 'bob@test.com', raw: 'bob@test.com' },
      'account-1'
    );

    expect(result).toBeUndefined();
    expect(console.error).toHaveBeenCalledWith(
      'Error saving email address',
      expect.any(Error)
    );
  });

  it('handles empty name field', async () => {
    const chain = mockDbChain([
      { addressId: 'addr-2', address: 'no-name@test.com' },
    ]);
    (db as any).insert = chain.insert;

    const result = await saveEmailAddress(
      { name: '', address: 'no-name@test.com', raw: 'no-name@test.com' },
      'account-1'
    );

    expect(result).toEqual({ addressId: 'addr-2', address: 'no-name@test.com' });
    expect(chain.values).toHaveBeenCalledWith(
      expect.objectContaining({ name: '' })
    );
  });
});
