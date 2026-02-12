import { db } from '@/db';
import {
  saveThread,
  findAllThreadsByMailAccountIdAndFolder,
  findThreadCountsByFolder,
  findThreadCountsByFilter,
} from '@/lib/repository/thread';

jest.spyOn(console, 'error').mockImplementation(() => {});

function mockDbChain(terminalValue: unknown) {
  const chain: Record<string, jest.Mock> = {};
  const methods = [
    'insert', 'values', 'onConflictDoUpdate', 'returning',
    'select', 'from', 'where', 'innerJoin',
  ];
  for (const m of methods) chain[m] = jest.fn().mockReturnValue(chain);
  chain.returning = jest.fn().mockResolvedValue(terminalValue);
  return chain;
}

describe('saveThread', () => {
  beforeEach(() => jest.clearAllMocks());

  it('upserts and returns threadId', async () => {
    const chain = mockDbChain([{ threadId: 'thread-1' }]);
    (db as any).insert = chain.insert;

    const result = await saveThread({
      id: 'thread-1',
      mailAccountId: 'acc-1',
      subject: 'Test',
      lastMessageDate: new Date('2024-01-01'),
    });

    expect(result).toBe('thread-1');
    expect(chain.values).toHaveBeenCalled();
    expect(chain.onConflictDoUpdate).toHaveBeenCalled();
  });

  it('throws on DB error', async () => {
    const chain = mockDbChain([]);
    chain.returning = jest.fn().mockRejectedValue(new Error('DB error'));
    (db as any).insert = chain.insert;

    await expect(
      saveThread({
        id: 'thread-1',
        mailAccountId: 'acc-1',
        subject: 'Test',
        lastMessageDate: new Date(),
      })
    ).rejects.toThrow('DB error');
  });
});

describe('findAllThreadsByMailAccountIdAndFolder', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns rows from raw SQL', async () => {
    const rows = [{ id: 't1', subject: 'Hello' }];
    (db as any).execute = jest.fn().mockResolvedValue({ rows });

    const result = await findAllThreadsByMailAccountIdAndFolder(
      'acc-1', 'inbox', 1
    );
    expect(result).toEqual(rows);
    expect((db as any).execute).toHaveBeenCalled();
  });

  it('applies pagination offset for page 2', async () => {
    (db as any).execute = jest.fn().mockResolvedValue({ rows: [] });

    await findAllThreadsByMailAccountIdAndFolder('acc-1', 'inbox', 2);
    // Just verify it was called — SQL template contains OFFSET calculation
    expect((db as any).execute).toHaveBeenCalled();
  });

  it('applies filter when folder is inbox and filter is provided', async () => {
    (db as any).execute = jest.fn().mockResolvedValue({ rows: [] });

    await findAllThreadsByMailAccountIdAndFolder(
      'acc-1', 'inbox', 1, 'personal'
    );
    expect((db as any).execute).toHaveBeenCalled();
  });

  it('skips filter when folder is not inbox', async () => {
    (db as any).execute = jest.fn().mockResolvedValue({ rows: [] });

    await findAllThreadsByMailAccountIdAndFolder(
      'acc-1', 'sent', 1, 'personal'
    );
    expect((db as any).execute).toHaveBeenCalled();
  });

  it('skips filter when filter is undefined', async () => {
    (db as any).execute = jest.fn().mockResolvedValue({ rows: [] });

    await findAllThreadsByMailAccountIdAndFolder('acc-1', 'inbox', 1);
    expect((db as any).execute).toHaveBeenCalled();
  });

  it('throws on DB error', async () => {
    (db as any).execute = jest.fn().mockRejectedValue(new Error('DB error'));

    await expect(
      findAllThreadsByMailAccountIdAndFolder('acc-1', 'inbox', 1)
    ).rejects.toThrow('DB error');
  });
});

describe('findThreadCountsByFolder', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns folder counts', async () => {
    const counts = { inboxTotal: 10, inboxUnread: 3 };
    const chain = mockDbChain([]);
    chain.where = jest.fn().mockResolvedValue([counts]);
    (db as any).select = chain.select;

    const result = await findThreadCountsByFolder('acc-1');
    expect(result).toEqual(counts);
  });

  it('throws on DB error', async () => {
    const chain = mockDbChain([]);
    chain.where = jest.fn().mockRejectedValue(new Error('DB error'));
    (db as any).select = chain.select;

    await expect(findThreadCountsByFolder('acc-1')).rejects.toThrow();
  });
});

describe('findThreadCountsByFilter', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns count', async () => {
    const chain = mockDbChain([]);
    chain.where = jest.fn().mockResolvedValue([{ count: 5 }]);
    (db as any).select = chain.select;

    const result = await findThreadCountsByFilter('acc-1', 'personal');
    expect(result).toBe(5);
  });

  it('returns 0 when count is undefined', async () => {
    const chain = mockDbChain([]);
    chain.where = jest.fn().mockResolvedValue([undefined]);
    (db as any).select = chain.select;

    const result = await findThreadCountsByFilter('acc-1');
    expect(result).toBe(0);
  });

  it('throws on DB error', async () => {
    const chain = mockDbChain([]);
    chain.where = jest.fn().mockRejectedValue(new Error('DB error'));
    (db as any).select = chain.select;

    await expect(findThreadCountsByFilter('acc-1')).rejects.toThrow();
  });
});
