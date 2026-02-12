import { db } from '@/db';
import { EmailMessage, EmailAddress } from '../types/aurinko';
import { email, emailBcc, emailCc, emailReplyTo, emailTo } from '@/db/schema';
import { asc, eq } from 'drizzle-orm';

export async function saveEmailMessage(
  emailMsg: EmailMessage,
  fromAddressId: string,
  addressIds: Map<string, string>
) {
  try {
    const toAddress = emailMsg.to
      .map(addr => addressIds.get(addr.address))
      .filter(id => id !== undefined);
    const ccAddress = emailMsg.cc
      .map(addr => addressIds.get(addr.address))
      .filter(id => id !== undefined);
    const bccAddress = emailMsg.bcc
      .map(addr => addressIds.get(addr.address))
      .filter(id => id !== undefined);
    const replyToAddress = emailMsg.replyTo
      .map(addr => addressIds.get(addr.address))
      .filter(id => id !== undefined);

    const response = await db
      .insert(email)
      .values({
        id: emailMsg.id,
        threadId: emailMsg.threadId,
        createdAt: emailMsg.createdTime ? new Date(emailMsg.createdTime) : null,
        lastModifiedAt: emailMsg.lastModifiedTime
          ? new Date(emailMsg.lastModifiedTime)
          : null,
        sentAt: emailMsg.sentAt ? new Date(emailMsg.sentAt) : null,
        receivedAt: emailMsg.receivedAt ? new Date(emailMsg.receivedAt) : null,
        internetMessageId: emailMsg.internetMessageId,
        subject: emailMsg.subject,
        sysLabels: emailMsg.sysLabels,
        keywords: emailMsg.keywords,
        sysClassifications: emailMsg.sysClassifications,
        sensitivity: emailMsg.sensitivity,
        meetingMessageMethod: emailMsg.meetingMessageMethod,
        from: fromAddressId,
        hasAttachments: emailMsg.hasAttachments,
        body: emailMsg.body,
        bodySnippet: emailMsg.bodySnippet,
        inReplyTo: emailMsg.inReplyTo,
        references: emailMsg.references,
        threadIndex: emailMsg.threadIndex,
        internetHeaders: emailMsg.internetHeaders,
        nativeProperties: emailMsg.nativeProperties,
        folderId: emailMsg.folderId,
        webLink: emailMsg.webLink,
        omitted: emailMsg.omitted,
      })
      .onConflictDoUpdate({
        target: email.id,
        set: {
          threadId: emailMsg.threadId,
          createdAt: emailMsg.createdTime
            ? new Date(emailMsg.createdTime)
            : null,
          lastModifiedAt: emailMsg.lastModifiedTime
            ? new Date(emailMsg.lastModifiedTime)
            : null,
          sentAt: emailMsg.sentAt ? new Date(emailMsg.sentAt) : null,
          receivedAt: emailMsg.receivedAt
            ? new Date(emailMsg.receivedAt)
            : null,
          internetMessageId: emailMsg.internetMessageId,
          subject: emailMsg.subject,
          sysLabels: emailMsg.sysLabels,
          keywords: emailMsg.keywords,
          sysClassifications: emailMsg.sysClassifications,
          sensitivity: emailMsg.sensitivity,
          meetingMessageMethod: emailMsg.meetingMessageMethod,
          from: fromAddressId,
          hasAttachments: emailMsg.hasAttachments,
          body: emailMsg.body,
          bodySnippet: emailMsg.bodySnippet,
          inReplyTo: emailMsg.inReplyTo,
          references: emailMsg.references,
          threadIndex: emailMsg.threadIndex,
          internetHeaders: emailMsg.internetHeaders,
          nativeProperties: emailMsg.nativeProperties,
          folderId: emailMsg.folderId,
          webLink: emailMsg.webLink,
          omitted: emailMsg.omitted,
        },
      })
      .returning({ emailId: email.id });

    const emailId = response[0].emailId;

    if (toAddress.length > 0) {
      await db
        .insert(emailTo)
        .values(
          toAddress.map(emAddId => ({ emailId, emailAddressId: emAddId }))
        )
        .onConflictDoNothing();
    }

    if (ccAddress.length > 0) {
      await db
        .insert(emailCc)
        .values(
          ccAddress.map(emAddId => ({ emailId, emailAddressId: emAddId }))
        )
        .onConflictDoNothing();
    }

    if (bccAddress.length > 0) {
      await db
        .insert(emailBcc)
        .values(
          bccAddress.map(emAddId => ({ emailId, emailAddressId: emAddId }))
        )
        .onConflictDoNothing();
    }

    if (replyToAddress.length > 0) {
      await db
        .insert(emailReplyTo)
        .values(
          replyToAddress.map(emAddId => ({ emailId, emailAddressId: emAddId }))
        )
        .onConflictDoNothing();
    }

    return emailId;
  } catch (err) {
    console.error('Error while saving email message', err);
  }
}

export async function findEmailsByThreadId(
  threadId: string
): Promise<EmailMessage[]> {
  try {
    const rows = await db.query.email.findMany({
      where: eq(email.threadId, threadId),
      orderBy: asc(email.sentAt),
      with: {
        from: true,
        to: { with: { emailAddress: true } },
        cc: { with: { emailAddress: true } },
        bcc: { with: { emailAddress: true } },
        replyTo: { with: { emailAddress: true } },
      },
    });

    // Map database rows to EmailMessage format
    return rows.map(row => ({
      id: row.id,
      threadId: row.threadId,
      createdTime: row.createdAt?.toISOString() ?? '',
      lastModifiedTime: row.lastModifiedAt?.toISOString() ?? '',
      sentAt: row.sentAt?.toISOString() ?? '',
      receivedAt: row.receivedAt?.toISOString() ?? '',
      internetMessageId: row.internetMessageId ?? '',
      subject: row.subject ?? '',
      sysLabels: (row.sysLabels ?? []) as EmailMessage['sysLabels'],
      keywords: row.keywords ?? [],
      sysClassifications: (row.sysClassifications ??
        []) as EmailMessage['sysClassifications'],
      sensitivity: row.sensitivity ?? 'normal',
      meetingMessageMethod: row.meetingMessageMethod ?? 'other',
      from: {
        name: row.from.name ?? '',
        address: row.from.address,
        raw: row.from.raw ?? '',
      } as EmailAddress,
      to: row.to.map(t => ({
        name: t.emailAddress.name ?? '',
        address: t.emailAddress.address,
        raw: t.emailAddress.raw ?? '',
      })) as EmailAddress[],
      cc: row.cc.map(c => ({
        name: c.emailAddress.name ?? '',
        address: c.emailAddress.address,
        raw: c.emailAddress.raw ?? '',
      })) as EmailAddress[],
      bcc: row.bcc.map(b => ({
        name: b.emailAddress.name ?? '',
        address: b.emailAddress.address,
        raw: b.emailAddress.raw ?? '',
      })) as EmailAddress[],
      replyTo: row.replyTo.map(r => ({
        name: r.emailAddress.name ?? '',
        address: r.emailAddress.address,
        raw: r.emailAddress.raw ?? '',
      })) as EmailAddress[],
      hasAttachments: row.hasAttachments ?? false,
      body: row.body ?? undefined,
      bodySnippet: row.bodySnippet ?? undefined,
      attachments: [], // Not fetched
      inReplyTo: row.inReplyTo ?? undefined,
      references: row.references ?? undefined,
      threadIndex: row.threadIndex ?? undefined,
      internetHeaders: row.internetHeaders ?? [],
      nativeProperties: row.nativeProperties ?? {},
      folderId: row.folderId ?? undefined,
      webLink: row.webLink ?? undefined,
      omitted: (row.omitted ?? []) as EmailMessage['omitted'],
    }));
  } catch (err) {
    console.error('Unable to fetch emails by thread-id', err);
    throw err;
  }
}
