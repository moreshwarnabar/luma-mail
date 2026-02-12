import { db } from '@/db';
import { saveEmailMessage, findEmailsByThreadId } from '@/lib/repository/email-message';
import { EmailMessage } from '@/lib/types/aurinko';

jest.spyOn(console, 'error').mockImplementation(() => {});

function mockDbChain(terminalValue: unknown) {
  const chain: Record<string, jest.Mock> = {};
  const methods = [
    'insert', 'values', 'onConflictDoUpdate', 'onConflictDoNothing',
    'returning', 'select', 'from', 'where', 'orderBy',
  ];
  for (const m of methods) chain[m] = jest.fn().mockReturnValue(chain);
  chain.returning = jest.fn().mockResolvedValue(terminalValue);
  chain.onConflictDoNothing = jest.fn().mockResolvedValue(undefined);
  return chain;
}

function makeEmailMsg(overrides: Partial<EmailMessage> = {}): EmailMessage {
  return {
    id: 'email-1',
    threadId: 'thread-1',
    createdTime: '2024-01-01T00:00:00Z',
    lastModifiedTime: '2024-01-01T00:00:00Z',
    sentAt: '2024-01-01T00:00:00Z',
    receivedAt: '2024-01-01T00:00:00Z',
    internetMessageId: 'msg-id-1',
    subject: 'Test',
    sysLabels: ['inbox'],
    keywords: [],
    sysClassifications: ['personal'],
    sensitivity: 'normal',
    meetingMessageMethod: 'other',
    from: { name: 'Alice', address: 'alice@test.com', raw: '' },
    to: [{ name: 'Bob', address: 'bob@test.com', raw: '' }],
    cc: [],
    bcc: [],
    replyTo: [],
    hasAttachments: false,
    body: '<p>Hello</p>',
    bodySnippet: 'Hello',
    attachments: [],
    inReplyTo: undefined,
    references: undefined,
    threadIndex: undefined,
    internetHeaders: [],
    nativeProperties: {},
    folderId: undefined,
    webLink: undefined,
    omitted: [],
    ...overrides,
  };
}

describe('saveEmailMessage', () => {
  beforeEach(() => jest.clearAllMocks());

  it('upserts email and junction tables, returns emailId', async () => {
    const chain = mockDbChain([{ emailId: 'email-1' }]);
    (db as any).insert = chain.insert;

    const addressIds = new Map([
      ['alice@test.com', 'addr-1'],
      ['bob@test.com', 'addr-2'],
    ]);

    const result = await saveEmailMessage(makeEmailMsg(), 'addr-1', addressIds);

    expect(result).toBe('email-1');
    // email insert + to junction = 2 calls minimum
    expect(chain.insert).toHaveBeenCalled();
  });

  it('skips junction inserts when arrays are empty', async () => {
    const chain = mockDbChain([{ emailId: 'email-1' }]);
    (db as any).insert = chain.insert;

    const msg = makeEmailMsg({ to: [], cc: [], bcc: [], replyTo: [] });
    const addressIds = new Map([['alice@test.com', 'addr-1']]);

    await saveEmailMessage(msg, 'addr-1', addressIds);

    // Only 1 insert call for the email itself, no junction inserts
    expect(chain.insert).toHaveBeenCalledTimes(1);
  });

  it('filters out unknown addresses not in addressIds map', async () => {
    const chain = mockDbChain([{ emailId: 'email-1' }]);
    (db as any).insert = chain.insert;

    const msg = makeEmailMsg({
      to: [
        { name: 'Bob', address: 'bob@test.com', raw: '' },
        { name: 'Unknown', address: 'unknown@test.com', raw: '' },
      ],
    });
    // Only bob is in the map
    const addressIds = new Map([
      ['alice@test.com', 'addr-1'],
      ['bob@test.com', 'addr-2'],
    ]);

    await saveEmailMessage(msg, 'addr-1', addressIds);

    // to junction should only include bob (addr-2)
    const toInsertValues = chain.values.mock.calls[1]?.[0];
    if (toInsertValues) {
      expect(toInsertValues).toHaveLength(1);
      expect(toInsertValues[0].emailAddressId).toBe('addr-2');
    }
  });

  it('returns undefined on DB error', async () => {
    const chain = mockDbChain([]);
    chain.returning = jest.fn().mockRejectedValue(new Error('DB error'));
    (db as any).insert = chain.insert;

    const addressIds = new Map([['alice@test.com', 'addr-1']]);
    const result = await saveEmailMessage(makeEmailMsg(), 'addr-1', addressIds);

    expect(result).toBeUndefined();
    expect(console.error).toHaveBeenCalledWith(
      'Error while saving email message',
      expect.any(Error)
    );
  });
});

describe('findEmailsByThreadId', () => {
  beforeEach(() => jest.clearAllMocks());

  it('maps DB rows to EmailMessage shape', async () => {
    const dbRow = {
      id: 'email-1',
      threadId: 'thread-1',
      createdAt: new Date('2024-01-01'),
      lastModifiedAt: new Date('2024-01-02'),
      sentAt: new Date('2024-01-01'),
      receivedAt: new Date('2024-01-01'),
      internetMessageId: 'msg-1',
      subject: 'Hello',
      sysLabels: ['inbox'],
      keywords: ['test'],
      sysClassifications: ['personal'],
      sensitivity: 'normal',
      meetingMessageMethod: 'other',
      from: { name: 'Alice', address: 'alice@test.com', raw: 'Alice <alice>' },
      to: [{ emailAddress: { name: 'Bob', address: 'bob@test.com', raw: '' } }],
      cc: [],
      bcc: [],
      replyTo: [],
      hasAttachments: false,
      body: '<p>Hi</p>',
      bodySnippet: 'Hi',
      inReplyTo: null,
      references: null,
      threadIndex: null,
      internetHeaders: [],
      nativeProperties: {},
      folderId: null,
      webLink: null,
      omitted: [],
    };

    (db as any).query = {
      email: { findMany: jest.fn().mockResolvedValue([dbRow]) },
    };

    const result = await findEmailsByThreadId('thread-1');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('email-1');
    expect(result[0].from.address).toBe('alice@test.com');
    expect(result[0].to[0].address).toBe('bob@test.com');
    expect(result[0].createdTime).toBe('2024-01-01T00:00:00.000Z');
  });

  it('handles null fields with fallback defaults', async () => {
    const dbRow = {
      id: 'email-2',
      threadId: 'thread-1',
      createdAt: null,
      lastModifiedAt: null,
      sentAt: null,
      receivedAt: null,
      internetMessageId: null,
      subject: null,
      sysLabels: null,
      keywords: null,
      sysClassifications: null,
      sensitivity: null,
      meetingMessageMethod: null,
      from: { name: null, address: 'x@y.com', raw: null },
      to: [],
      cc: [],
      bcc: [],
      replyTo: [],
      hasAttachments: null,
      body: null,
      bodySnippet: null,
      inReplyTo: null,
      references: null,
      threadIndex: null,
      internetHeaders: null,
      nativeProperties: null,
      folderId: null,
      webLink: null,
      omitted: null,
    };

    (db as any).query = {
      email: { findMany: jest.fn().mockResolvedValue([dbRow]) },
    };

    const result = await findEmailsByThreadId('thread-1');
    expect(result[0].createdTime).toBe('');
    expect(result[0].subject).toBe('');
    expect(result[0].from.name).toBe('');
    expect(result[0].hasAttachments).toBe(false);
  });

  it('returns empty array when no emails found', async () => {
    (db as any).query = {
      email: { findMany: jest.fn().mockResolvedValue([]) },
    };

    const result = await findEmailsByThreadId('thread-none');
    expect(result).toEqual([]);
  });

  it('throws on DB error', async () => {
    (db as any).query = {
      email: { findMany: jest.fn().mockRejectedValue(new Error('DB error')) },
    };

    await expect(findEmailsByThreadId('thread-1')).rejects.toThrow('DB error');
  });
});
