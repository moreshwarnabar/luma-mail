import { syncEmails } from '@/lib/services/sync-emails';
import { saveEmailAddress } from '@/lib/repository/email-address';
import { saveThread } from '@/lib/repository/thread';
import { saveEmailMessage } from '@/lib/repository/email-message';
import { EmailMessage } from '@/lib/types/aurinko';

jest.mock('@/lib/repository/email-address');
jest.mock('@/lib/repository/thread');
jest.mock('@/lib/repository/email-message');

jest.spyOn(console, 'error').mockImplementation(() => {});
jest.spyOn(console, 'log').mockImplementation(() => {});

const mockedSaveEmailAddress = saveEmailAddress as jest.MockedFunction<typeof saveEmailAddress>;
const mockedSaveThread = saveThread as jest.MockedFunction<typeof saveThread>;
const mockedSaveEmailMessage = saveEmailMessage as jest.MockedFunction<typeof saveEmailMessage>;

function makeEmail(overrides: Partial<EmailMessage> = {}): EmailMessage {
  return {
    id: 'email-1',
    threadId: 'thread-1',
    createdTime: '2024-01-01T00:00:00Z',
    lastModifiedTime: '2024-01-01T00:00:00Z',
    sentAt: '2024-01-01T00:00:00Z',
    receivedAt: '2024-01-01T00:00:00Z',
    internetMessageId: 'msg-1',
    subject: 'Test Subject',
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
    internetHeaders: [],
    nativeProperties: {},
    omitted: [],
    ...overrides,
  };
}

describe('syncEmails', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedSaveEmailAddress.mockResolvedValue({ addressId: 'addr-1', address: 'alice@test.com' });
    mockedSaveThread.mockResolvedValue('thread-1');
    mockedSaveEmailMessage.mockResolvedValue('email-1');
  });

  it('processes each email by saving addresses, thread, and message', async () => {
    mockedSaveEmailAddress
      .mockResolvedValueOnce({ addressId: 'addr-1', address: 'alice@test.com' })
      .mockResolvedValueOnce({ addressId: 'addr-2', address: 'bob@test.com' });

    const emails = [makeEmail()];
    await syncEmails(emails, 'account-1');

    // forEach doesn't await, so flush microtasks
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(mockedSaveEmailAddress).toHaveBeenCalledTimes(2); // alice + bob
    expect(mockedSaveThread).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'thread-1',
        mailAccountId: 'account-1',
        subject: 'Test Subject',
      })
    );
    expect(mockedSaveEmailMessage).toHaveBeenCalled();
  });

  it('handles empty email array', async () => {
    await syncEmails([], 'account-1');

    expect(mockedSaveEmailAddress).not.toHaveBeenCalled();
    expect(mockedSaveThread).not.toHaveBeenCalled();
    expect(mockedSaveEmailMessage).not.toHaveBeenCalled();
  });

  it('deduplicates addresses within an email', async () => {
    // from and to have the same address
    const email = makeEmail({
      from: { name: 'Alice', address: 'alice@test.com', raw: '' },
      to: [{ name: 'Alice', address: 'alice@test.com', raw: '' }],
    });

    mockedSaveEmailAddress.mockResolvedValue({
      addressId: 'addr-1',
      address: 'alice@test.com',
    });

    await syncEmails([email], 'account-1');
    await new Promise(resolve => setTimeout(resolve, 0));

    // Should only save alice once due to Map dedup
    expect(mockedSaveEmailAddress).toHaveBeenCalledTimes(1);
  });

  it('skips email when fromAddress is not saved', async () => {
    mockedSaveEmailAddress.mockResolvedValue(undefined);

    await syncEmails([makeEmail()], 'account-1');
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(mockedSaveThread).not.toHaveBeenCalled();
    expect(mockedSaveEmailMessage).not.toHaveBeenCalled();
  });

  it('logs individual email errors without crashing', async () => {
    mockedSaveEmailAddress.mockRejectedValue(new Error('addr fail'));

    await syncEmails([makeEmail()], 'account-1');
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(console.error).toHaveBeenCalled();
  });

  it('passes correct addressIds to saveEmailMessage', async () => {
    mockedSaveEmailAddress
      .mockResolvedValueOnce({ addressId: 'addr-1', address: 'alice@test.com' })
      .mockResolvedValueOnce({ addressId: 'addr-2', address: 'bob@test.com' });

    await syncEmails([makeEmail()], 'account-1');
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(mockedSaveEmailMessage).toHaveBeenCalledWith(
      expect.anything(),
      'addr-1', // fromAddress
      expect.any(Map)
    );
  });
});
