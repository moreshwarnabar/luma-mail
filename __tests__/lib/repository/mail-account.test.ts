import { db } from '@/db';
import {
  createMailAccount,
  findEmailAccountById,
  updateDeltaTokenById,
  findAllMailAccountsByUserId,
  findDefaultMailAccountIdByUserId,
} from '@/lib/repository/mail-account';

jest.spyOn(console, 'error').mockImplementation(() => {});

function mockDbChain(terminalValue: unknown) {
  const chain: Record<string, jest.Mock> = {};
  const methods = [
    'insert', 'values', 'onConflictDoUpdate', 'returning',
    'select', 'from', 'where', 'orderBy', 'limit',
    'update', 'set',
  ];
  for (const m of methods) chain[m] = jest.fn().mockReturnValue(chain);
  // By default, returning resolves the terminal value.
  // For select chains (no returning), where/limit is the terminal.
  chain.returning = jest.fn().mockResolvedValue(terminalValue);
  return chain;
}

const baseAccount = {
  userId: 'user-1',
  aurinkoId: 123,
  accessToken: 'tok',
  emailAddress: 'a@b.com',
  name: 'Test',
};

describe('createMailAccount', () => {
  beforeEach(() => jest.clearAllMocks());

  it('creates a new account and returns accountId', async () => {
    // Select chain returns empty (no existing)
    const selectChain = mockDbChain([]);
    selectChain.where = jest.fn().mockResolvedValue([]);
    (db as any).select = selectChain.select;

    // Insert chain
    const insertChain = mockDbChain([{ accountId: 'acc-1' }]);
    (db as any).insert = insertChain.insert;

    const result = await createMailAccount(baseAccount);
    expect(result).toBe('acc-1');
  });

  it('re-links when same user already owns the aurinkoId', async () => {
    const selectChain = mockDbChain([]);
    selectChain.where = jest.fn().mockResolvedValue([{ userId: 'user-1' }]);
    (db as any).select = selectChain.select;

    const insertChain = mockDbChain([{ accountId: 'acc-1' }]);
    (db as any).insert = insertChain.insert;

    const result = await createMailAccount(baseAccount);
    expect(result).toBe('acc-1');
  });

  it('throws when different user owns the aurinkoId', async () => {
    const selectChain = mockDbChain([]);
    selectChain.where = jest.fn().mockResolvedValue([{ userId: 'other-user' }]);
    (db as any).select = selectChain.select;

    await expect(createMailAccount(baseAccount)).rejects.toThrow(
      'Another user has already linked this account'
    );
  });

  it('throws on DB error', async () => {
    const selectChain = mockDbChain([]);
    selectChain.where = jest.fn().mockRejectedValue(new Error('DB error'));
    (db as any).select = selectChain.select;

    await expect(createMailAccount(baseAccount)).rejects.toThrow('DB error');
    expect(console.error).toHaveBeenCalled();
  });
});

describe('findEmailAccountById', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns account when found', async () => {
    const account = { id: 'acc-1', userId: 'user-1' };
    const chain = mockDbChain([]);
    chain.where = jest.fn().mockResolvedValue([account]);
    (db as any).select = chain.select;

    const result = await findEmailAccountById('acc-1', 'user-1');
    expect(result).toEqual(account);
  });

  it('returns undefined when not found', async () => {
    const chain = mockDbChain([]);
    chain.where = jest.fn().mockResolvedValue([]);
    (db as any).select = chain.select;

    const result = await findEmailAccountById('missing', 'user-1');
    expect(result).toBeUndefined();
  });

  it('throws on DB error', async () => {
    const chain = mockDbChain([]);
    chain.where = jest.fn().mockRejectedValue(new Error('DB error'));
    (db as any).select = chain.select;

    await expect(findEmailAccountById('acc-1', 'user-1')).rejects.toThrow();
  });
});

describe('updateDeltaTokenById', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns accountId on success', async () => {
    const chain = mockDbChain([{ accountId: 'acc-1' }]);
    (db as any).update = chain.update;

    const result = await updateDeltaTokenById('acc-1', 'delta-tok');
    expect(result).toBe('acc-1');
  });

  it('throws on DB error', async () => {
    const chain = mockDbChain([]);
    chain.returning = jest.fn().mockRejectedValue(new Error('DB error'));
    (db as any).update = chain.update;

    await expect(updateDeltaTokenById('acc-1', 'tok')).rejects.toThrow();
  });
});

describe('findAllMailAccountsByUserId', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns multiple accounts', async () => {
    const accounts = [{ id: 'a1' }, { id: 'a2' }];
    const chain = mockDbChain([]);
    chain.where = jest.fn().mockResolvedValue(accounts);
    (db as any).select = chain.select;

    const result = await findAllMailAccountsByUserId('user-1');
    expect(result).toEqual(accounts);
  });

  it('returns empty array when none found', async () => {
    const chain = mockDbChain([]);
    chain.where = jest.fn().mockResolvedValue([]);
    (db as any).select = chain.select;

    const result = await findAllMailAccountsByUserId('user-1');
    expect(result).toEqual([]);
  });

  it('throws on DB error', async () => {
    const chain = mockDbChain([]);
    chain.where = jest.fn().mockRejectedValue(new Error('DB error'));
    (db as any).select = chain.select;

    await expect(findAllMailAccountsByUserId('user-1')).rejects.toThrow();
  });
});

describe('findDefaultMailAccountIdByUserId', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns oldest accountId', async () => {
    const chain = mockDbChain([]);
    chain.limit = jest.fn().mockResolvedValue([{ accountId: 'oldest' }]);
    (db as any).select = chain.select;

    const result = await findDefaultMailAccountIdByUserId('user-1');
    expect(result).toBe('oldest');
  });

  it('returns null when no accounts', async () => {
    const chain = mockDbChain([]);
    chain.limit = jest.fn().mockResolvedValue([]);
    (db as any).select = chain.select;

    const result = await findDefaultMailAccountIdByUserId('user-1');
    expect(result).toBeNull();
  });

  it('throws on DB error', async () => {
    const chain = mockDbChain([]);
    chain.limit = jest.fn().mockRejectedValue(new Error('DB error'));
    (db as any).select = chain.select;

    await expect(findDefaultMailAccountIdByUserId('user-1')).rejects.toThrow();
  });
});
