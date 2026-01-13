import { db } from '@/db';
import { EmailMessage } from '../types/aurinko';
import { email, emailBcc, emailCc, emailReplyTo, emailTo } from '@/db/schema';

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
