import { relations } from 'drizzle-orm'
import {
  boolean,
  foreignKey,
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uniqueIndex
} from 'drizzle-orm/pg-core'

import { comments } from './comments'
import { guestbook } from './guestbook'

export const roleEnum = pgEnum('role', ['user', 'admin'])

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  username: text('username'),
  name: text('name').notNull(),
  email: text('email').notNull(),
  emailVerified: boolean('email_verified').notNull(),
  image: text('image'),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
  // Custom
  isAnonymous: boolean('isAnonymous').default(false),
  bio: text('bio'),
  isPublic: boolean('is_public').default(true).notNull(),
  role: roleEnum('role').default('user').notNull()
})

export const accounts = pgTable(
  'account',
  {
    id: text('id').primaryKey(),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    userId: text('user_id').notNull(),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: timestamp('access_token_expires_at'),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
    scope: text('scope'),
    password: text('password'),
    createdAt: timestamp('created_at').notNull(),
    updatedAt: timestamp('updated_at').notNull()
  },
  (account) => [
    foreignKey({
      columns: [account.userId],
      foreignColumns: [users.id],
      name: 'account_user_id_user_id_fk'
    }).onDelete('cascade')
  ]
)

export const sessions = pgTable(
  'session',
  {
    id: text('id').primaryKey(),
    expiresAt: timestamp('expires_at').notNull(),
    token: text('token').notNull(),
    createdAt: timestamp('created_at').notNull(),
    updatedAt: timestamp('updated_at').notNull(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    userId: text('user_id').notNull()
  },
  (session) => [
    foreignKey({
      columns: [session.userId],
      foreignColumns: [users.id],
      name: 'session_user_id_user_id_fk'
    }).onDelete('cascade'),
    unique('session_token_unique').on(session.token)
  ]
)

export const verifications = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at'),
  updatedAt: timestamp('updated_at')
})

export const passwordResetTokens = pgTable(
  'password_reset_tokens',
  {
    id: text('id').primaryKey(),
    token: text('token').notNull(),
    userId: text('user_id').notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').notNull(),
    used: boolean('used').default(false).notNull()
  },
  (passwordResetToken) => [
    index('password_reset_tokens_expires_at_idx').using(
      'btree',
      passwordResetToken.expiresAt.asc().nullsLast().op('timestamp_ops')
    ),
    uniqueIndex('password_reset_tokens_token_unique').using(
      'btree',
      passwordResetToken.token.asc().nullsLast().op('text_ops')
    ),
    index('password_reset_tokens_user_id_idx').using(
      'btree',
      passwordResetToken.userId.asc().nullsLast().op('text_ops')
    ),
    foreignKey({
      columns: [passwordResetToken.userId],
      foreignColumns: [users.id],
      name: 'password_reset_tokens_user_id_users_id_fk'
    }).onDelete('cascade')
  ]
)

export const auditLogActionEnum = pgEnum('audit_log_action', [
  'user_create',
  'user_update',
  'user_delete',
  'user_ban',
  'user_unban',
  'user_password_reset',
  'comment_delete',
  'comment_approve',
  'comment_reject',
  'admin_login',
  'admin_logout',
  'settings_update',
  'bulk_operation'
])

export const auditLogs = pgTable(
  'audit_logs',
  {
    id: text('id').primaryKey(),
    adminUserId: text('admin_user_id').notNull(),
    action: auditLogActionEnum('action').notNull(),
    targetType: text('target_type'), // 'user', 'comment', 'settings', etc.
    targetId: text('target_id'), // ID of the affected resource
    details: text('details'), // JSON string with additional details
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    createdAt: timestamp('created_at').notNull().defaultNow()
  },
  (auditLog) => [
    index('idx_audit_logs_action').using('btree', auditLog.action.asc().nullsLast().op('enum_ops')),
    index('idx_audit_logs_admin_user_id').using(
      'btree',
      auditLog.adminUserId.asc().nullsLast().op('text_ops')
    ),
    index('idx_audit_logs_created_at').using(
      'btree',
      auditLog.createdAt.asc().nullsLast().op('timestamp_ops')
    ),
    index('idx_audit_logs_target').using(
      'btree',
      auditLog.targetType.asc().nullsLast().op('text_ops'),
      auditLog.targetId.asc().nullsLast().op('text_ops')
    ),
    foreignKey({
      columns: [auditLog.adminUserId],
      foreignColumns: [users.id],
      name: 'audit_logs_admin_user_id_users_id_fk'
    }).onDelete('cascade')
  ]
)

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  comments: many(comments),
  guestbook: many(guestbook),
  passwordResetTokens: many(passwordResetTokens),
  auditLogs: many(auditLogs)
}))

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id]
  })
}))

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id]
  })
}))

export const passwordResetTokensRelations = relations(passwordResetTokens, ({ one }) => ({
  user: one(users, {
    fields: [passwordResetTokens.userId],
    references: [users.id]
  })
}))

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  adminUser: one(users, {
    fields: [auditLogs.adminUserId],
    references: [users.id]
  })
}))
