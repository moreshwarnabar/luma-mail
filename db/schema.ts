import {
  boolean,
  integer,
  json,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import { primaryKey, unique } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

import { citext } from './customTypes';

// BETTER-AUTH
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

  defaultMailAccountId: uuid('default_mail_account_id'),
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

export const providerEnum = pgEnum('provider', [
  'gmail',
  'outlook',
  'imap',
  'yahoo',
]);

export const labelTypeEnum = pgEnum('type', ['system', 'user']);

export const mailAccount = pgTable('mail_account', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  name: text('name'),

  provider: providerEnum().notNull(),
  providerAccountId: text('provider_account_id').notNull().unique(),
  address: text('address').notNull().unique(),

  accessToken: text('access_token').notNull(),
  refreshToken: text('refresh_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),

  lastSyncedAt: timestamp('last_synced_at')
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const label = pgTable(
  'label',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    accountId: uuid('account_id')
      .notNull()
      .references(() => mailAccount.id, { onDelete: 'cascade' }),
    provider: providerEnum().notNull(),
    providerId: text('provider_id'),
    name: text('name').notNull(),
    description: text('description'),
    type: labelTypeEnum().notNull(),
    colorBg: text('color_bg'),
    colorText: text('color_text'),
    messageListVisibility: text('message_list_visibility'),
    labelListVisibility: text('label_list_visibility'),
  },
  t => [unique().on(t.accountId, t.providerId)]
);

export const thread = pgTable('thread', {
  id: uuid('id').defaultRandom().primaryKey(),
  provider: providerEnum().notNull(),
  providerId: text('provider_id').notNull(),
  mailAccountId: uuid('mail_account_id')
    .notNull()
    .references(() => mailAccount.id, { onDelete: 'cascade' }),

  subject: text('subject'),
  lastMessageDate: timestamp('last_message_date'),
  participantIds: text('participant_ids').array(),

  inboxStatus: boolean('inbox_status').default(true),
  draftStatus: boolean('draft_status').default(false),
  sentStatus: boolean('sent_status').default(false),
});

export const email = pgTable('email', {
  id: uuid('id').defaultRandom().primaryKey(),
  provider: providerEnum().notNull(),
  providerId: text('provider_id').notNull(),
  threadId: uuid('thread_id').references(() => thread.id, {
    onDelete: 'cascade',
  }),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  sentAt: timestamp('sent_at').defaultNow().notNull(),
  receivedAt: timestamp('received_at').defaultNow().notNull(),

  subject: text('subject'),
  fromId: uuid('from_id').references(() => emailAddress.id, {
    onDelete: 'cascade',
  }),

  hasAttachments: boolean('has_attachments'),
  body: text('body'),
  bodySnippet: text('body_snippet'),

  inReplyTo: text('in_reply_to'),
  references: text('references'),

  internetHeaders: json('internet_headers').array(),
  nativeProperties: json('native_properties'),
  folderId: text('folder_id'),
  omitted: text('omitted'),
});

export const emailAddress = pgTable('email_address', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name'),
  address: citext('address').notNull().unique(),
  accountId: uuid('account_id')
    .unique()
    .references(() => mailAccount.id, {
      onDelete: 'cascade',
    }),
});

export const emailAttachments = pgTable('email_attachments', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name'),
  mimeType: text('mime_type').notNull(),
  size: integer('size').notNull(),
  inline: boolean('inline'),
  contentId: text('content_id'),
  content: text('content'),
  contentLocation: text('content_location'),
  emailId: uuid('email_id').references(() => email.id, { onDelete: 'cascade' }),
});

/* -------- JOIN TABLES ------- */

export const emailToRecipients = pgTable(
  'email_to_recipients',
  {
    emailId: uuid('email_id')
      .notNull()
      .references(() => email.id, { onDelete: 'cascade' }),
    emailAddressId: uuid('email_address_id')
      .notNull()
      .references(() => emailAddress.id, { onDelete: 'cascade' }),
  },
  t => [primaryKey({ columns: [t.emailId, t.emailAddressId] })]
);

export const emailCcRecipients = pgTable(
  'email_cc_recipients',
  {
    emailId: uuid('email_id')
      .notNull()
      .references(() => email.id, { onDelete: 'cascade' }),
    emailAddressId: uuid('email_address_id')
      .notNull()
      .references(() => emailAddress.id, { onDelete: 'cascade' }),
  },
  t => [primaryKey({ columns: [t.emailId, t.emailAddressId] })]
);

export const emailBccRecipients = pgTable(
  'email_bcc_recipients',
  {
    emailId: uuid('email_id')
      .notNull()
      .references(() => email.id, { onDelete: 'cascade' }),
    emailAddressId: uuid('email_address_id')
      .notNull()
      .references(() => emailAddress.id, { onDelete: 'cascade' }),
  },
  t => [primaryKey({ columns: [t.emailId, t.emailAddressId] })]
);

export const emailReplyToRecipients = pgTable(
  'email_reply_to_recipients',
  {
    emailId: uuid('email_id')
      .notNull()
      .references(() => email.id, { onDelete: 'cascade' }),
    emailAddressId: uuid('email_address_id')
      .notNull()
      .references(() => emailAddress.id, { onDelete: 'cascade' }),
  },
  t => [primaryKey({ columns: [t.emailId, t.emailAddressId] })]
);

export const emailToLabels = pgTable(
  'email_to_labels',
  {
    emailId: uuid('email_id')
      .notNull()
      .references(() => email.id, { onDelete: 'cascade' }),
    labelId: uuid('label_id')
      .notNull()
      .references(() => label.id, { onDelete: 'cascade' }),
  },
  t => [primaryKey({ columns: [t.emailId, t.labelId] })]
);

/* -------- RELATIONS ------- */

export const emailRelations = relations(email, ({ one, many }) => ({
  from: one(emailAddress, {
    fields: [email.fromId],
    references: [emailAddress.id],
  }),

  to: many(emailToRecipients),
  cc: many(emailCcRecipients),
  bcc: many(emailBccRecipients),
  replyTo: many(emailReplyToRecipients),
  labels: many(emailToLabels),
}));

export const emailAdressRelations = relations(emailAddress, ({ many }) => ({
  sentEmails: many(email),

  receivedTo: many(emailToRecipients),
  receivedCc: many(emailCcRecipients),
  receivedBcc: many(emailBccRecipients),
  replyToEmails: many(emailReplyToRecipients),
}));

export const emailToRecipientsRelations = relations(
  emailToRecipients,
  ({ one }) => ({
    email: one(email, {
      fields: [emailToRecipients.emailId],
      references: [email.id],
    }),
    address: one(emailAddress, {
      fields: [emailToRecipients.emailAddressId],
      references: [emailAddress.id],
    }),
  })
);

export const emailCcRecipientsRelations = relations(
  emailCcRecipients,
  ({ one }) => ({
    email: one(email, {
      fields: [emailCcRecipients.emailId],
      references: [email.id],
    }),
    address: one(emailAddress, {
      fields: [emailCcRecipients.emailAddressId],
      references: [emailAddress.id],
    }),
  })
);

export const emailBccRecipientsRelations = relations(
  emailBccRecipients,
  ({ one }) => ({
    email: one(email, {
      fields: [emailBccRecipients.emailId],
      references: [email.id],
    }),
    address: one(emailAddress, {
      fields: [emailBccRecipients.emailAddressId],
      references: [emailAddress.id],
    }),
  })
);

export const emailReplyToRecipientsRelations = relations(
  emailReplyToRecipients,
  ({ one }) => ({
    email: one(email, {
      fields: [emailReplyToRecipients.emailId],
      references: [email.id],
    }),
    address: one(emailAddress, {
      fields: [emailReplyToRecipients.emailAddressId],
      references: [emailAddress.id],
    }),
  })
);

export const labelRelations = relations(label, ({ one, many }) => ({
  account: one(mailAccount, {
    fields: [label.accountId],
    references: [mailAccount.id],
  }),
  emails: many(emailToLabels),
}));

export const emailToLabelsRelations = relations(emailToLabels, ({ one }) => ({
  email: one(email, {
    fields: [emailToLabels.emailId],
    references: [email.id],
  }),
  label: one(label, {
    fields: [emailToLabels.labelId],
    references: [label.id],
  }),
}));
