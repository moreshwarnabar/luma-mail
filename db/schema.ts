import { EmailHeader } from '@/lib/types/aurinko';
import { relations } from 'drizzle-orm';
import {
  bigint,
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').default(false).notNull(),
  image: text('image'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  idToken: text('id_token'),
  password: text('password'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value'),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

/* ------- CORE TABLES ------- */

export const sensitivityEnum = pgEnum('sensitivity', [
  'normal',
  'private',
  'personal',
  'confidential',
]);

export const meetingMessageMethodEnum = pgEnum('meeting_message_method', [
  'request',
  'reply',
  'cancel',
  'counter',
  'other',
]);

export const mailAccount = pgTable('mail_account', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  aurinkoId: bigint('aurinko_id', { mode: 'number' }).notNull().unique(),

  accessToken: text('access_token').unique().notNull(),
  emailAddress: text('email_address').unique().notNull(),
  name: text('name'),

  updatedDeltaToken: text('updated_delta_token'),
});

export const emailAddress = pgTable('email_address', {
  id: uuid('id').defaultRandom().primaryKey(),
  mailAccountId: uuid('mail_account_id')
    .notNull()
    .references(() => mailAccount.id, { onDelete: 'cascade' }),

  name: text('name'),
  address: text('address').notNull(),
  raw: text('raw'),
});

export const thread = pgTable('thread', {
  id: text('id').primaryKey(),
  mailAccountId: uuid('mail_account_id')
    .notNull()
    .references(() => mailAccount.id, { onDelete: 'cascade' }),
});

export const email = pgTable('email', {
  id: text('id').primaryKey(),
  threadId: text('thread_id')
    .notNull()
    .references(() => thread.id, { onDelete: 'cascade' }),

  createdAt: timestamp('created_at'),
  lastModifiedAt: timestamp('last_modified_at'),
  sentAt: timestamp('sent_at'),
  receivedAt: timestamp('received_at'),

  internetMessageId: text('internet_message_id'),
  subject: text('subject'),
  sysLabels: text('sys_labels').array(),
  keywords: text('keywords').array(),
  sysClassifications: text('sys_classifications').array(),
  sensitivity: sensitivityEnum(),
  meetingMessageMethod: meetingMessageMethodEnum(),

  from: uuid('from')
    .notNull()
    .references(() => emailAddress.id, { onDelete: 'cascade' }),

  hasAttachments: boolean('has_attachments'),
  body: text('body'),
  bodySnippet: text('body_snippet'),
  inReplyTo: text('in_reply_to'),
  references: text('references'),
  threadIndex: text('thread_index'),
  internetHeaders: jsonb('internet_headers').$type<EmailHeader[]>(),
  nativeProperties: jsonb('native_properties').$type<Record<string, string>>(),
  folderId: text('folder_id'),
  webLink: text('web_link'),
  omitted: text('omitted').array(),
});

export const emailAttachment = pgTable('email_attachment', {
  id: text('id'),
  emailId: text('email_id')
    .notNull()
    .references(() => email.id, { onDelete: 'cascade' }),
  name: text('name'),
  mimeType: text('mimeType'),
  size: integer('size'),
  inline: boolean('inline'),
  contentId: text('content_id'),
  content: text('content'),
  location: text('location'),
});

/* ------- JOIN TABLES ------- */

export const emailTo = pgTable(
  'email_to',
  {
    emailId: text('email_id')
      .notNull()
      .references(() => email.id, { onDelete: 'cascade' }),
    emailAddressId: uuid('email_address_id')
      .notNull()
      .references(() => emailAddress.id, { onDelete: 'cascade' }),
  },
  t => [primaryKey({ columns: [t.emailId, t.emailAddressId] })]
);

export const emailCc = pgTable(
  'email_cc',
  {
    emailId: text('email_id')
      .notNull()
      .references(() => email.id, { onDelete: 'cascade' }),
    emailAddressId: uuid('email_address_id')
      .notNull()
      .references(() => emailAddress.id, { onDelete: 'cascade' }),
  },
  t => [primaryKey({ columns: [t.emailId, t.emailAddressId] })]
);

export const emailBcc = pgTable(
  'email_bcc',
  {
    emailId: text('email_id')
      .notNull()
      .references(() => email.id, { onDelete: 'cascade' }),
    emailAddressId: uuid('email_address_id')
      .notNull()
      .references(() => emailAddress.id, { onDelete: 'cascade' }),
  },
  t => [primaryKey({ columns: [t.emailId, t.emailAddressId] })]
);

export const emailReplyTo = pgTable(
  'email_reply_to',
  {
    emailId: text('email_id')
      .notNull()
      .references(() => email.id, { onDelete: 'cascade' }),
    emailAddressId: uuid('email_address_id')
      .notNull()
      .references(() => emailAddress.id, { onDelete: 'cascade' }),
  },
  t => [primaryKey({ columns: [t.emailId, t.emailAddressId] })]
);

/* ------- RELATIONS ------- */

export const userRelations = relations(user, ({ many }) => ({
  mailAccounts: many(mailAccount),
}));

export const mailAccountRelations = relations(mailAccount, ({ one, many }) => ({
  user: one(user, {
    fields: [mailAccount.userId],
    references: [user.id],
  }),
  threads: many(thread),
  emailAddress: many(emailAddress),
}));

export const threadRelations = relations(thread, ({ one, many }) => ({
  mailAccount: one(mailAccount, {
    fields: [thread.mailAccountId],
    references: [mailAccount.id],
  }),
  emails: many(email),
}));

export const emailAddressRelations = relations(
  emailAddress,
  ({ one, many }) => ({
    mailAccount: one(mailAccount, {
      fields: [emailAddress.mailAccountId],
      references: [mailAccount.id],
    }),
    sentEmails: many(email),
    receivedTo: many(emailTo),
    receivedCc: many(emailCc),
    receivedBcc: many(emailBcc),
    repliedTo: many(emailReplyTo),
  })
);

export const emailAttachmentRelations = relations(
  emailAttachment,
  ({ one }) => ({
    email: one(email, {
      fields: [emailAttachment.emailId],
      references: [email.id],
    }),
  })
);

export const emailRelations = relations(email, ({ one, many }) => ({
  thread: one(thread, {
    fields: [email.threadId],
    references: [thread.id],
  }),
  from: one(emailAddress, {
    fields: [email.from],
    references: [emailAddress.id],
  }),
  to: many(emailTo),
  cc: many(emailCc),
  bcc: many(emailBcc),
  replyTo: many(emailReplyTo),
  attachments: many(emailAttachment),
}));

export const emailToRelations = relations(emailTo, ({ one }) => ({
  email: one(email, {
    fields: [emailTo.emailId],
    references: [email.id],
  }),
  emailAddress: one(emailAddress, {
    fields: [emailTo.emailAddressId],
    references: [emailAddress.id],
  }),
}));

export const emailCcRelations = relations(emailCc, ({ one }) => ({
  email: one(email, {
    fields: [emailCc.emailId],
    references: [email.id],
  }),
  emailAddress: one(emailAddress, {
    fields: [emailCc.emailAddressId],
    references: [emailAddress.id],
  }),
}));

export const emailBccRelations = relations(emailBcc, ({ one }) => ({
  email: one(email, {
    fields: [emailBcc.emailId],
    references: [email.id],
  }),
  emailAddress: one(emailAddress, {
    fields: [emailBcc.emailAddressId],
    references: [emailAddress.id],
  }),
}));

export const emailReplyToRelations = relations(emailReplyTo, ({ one }) => ({
  email: one(email, {
    fields: [emailReplyTo.emailId],
    references: [email.id],
  }),
  emailAddress: one(emailAddress, {
    fields: [emailReplyTo.emailAddressId],
    references: [emailAddress.id],
  }),
}));
