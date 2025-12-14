import { relations, sql } from 'drizzle-orm'
import { boolean, foreignKey, index, integer, pgEnum, pgTable, text, timestamp, unique } from 'drizzle-orm/pg-core'

import { users } from './auth'

// Two-Factor Authentication
export const twoFactorTokens = pgTable(
  'two_factor_tokens',
  {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull(),
    secret: text('secret').notNull(), // TOTP secret
    backupCodes: text('backup_codes'), // JSON array of backup codes
    isEnabled: boolean('is_enabled').notNull().default(false),
    createdAt: timestamp('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
    lastUsedAt: timestamp('last_used_at')
  },
  (twoFactorToken) => [
    index('idx_two_factor_tokens_user_id').using(
      'btree',
      twoFactorToken.userId.asc().nullsLast().op('text_ops')
    ),
    foreignKey({
      columns: [twoFactorToken.userId],
      foreignColumns: [users.id],
      name: 'two_factor_tokens_user_id_fkey'
    }).onDelete('cascade')
  ]
)

// IP Access Control
export const ipAccessControlTypeEnum = pgEnum('ip_access_control_type', ['whitelist', 'blacklist'])

export const ipAccessControl = pgTable(
  'ip_access_control',
  {
    id: text('id').primaryKey(),
    ipAddress: text('ip_address').notNull(),
    ipRange: text('ip_range'), // CIDR notation for ranges
    type: ipAccessControlTypeEnum('type').notNull(),
    description: text('description'),
    isActive: boolean('is_active').notNull().default(true),
    createdBy: text('created_by').notNull(),
    createdAt: timestamp('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: timestamp('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`)
  },
  (ipAccessControlRow) => [
    foreignKey({
      columns: [ipAccessControlRow.createdBy],
      foreignColumns: [users.id],
      name: 'ip_access_control_created_by_fkey'
    })
  ]
)

// Security Events Monitoring
export const securityEventTypeEnum = pgEnum('security_event_type', [
  'login_attempt',
  'login_success',
  'login_failure',
  'password_change',
  'email_change',
  'two_factor_enabled',
  'two_factor_disabled',
  'suspicious_activity',
  'account_locked',
  'account_unlocked',
  'admin_action',
  'data_export',
  'permission_change'
])

export const securityEventSeverityEnum = pgEnum('security_event_severity', [
  'low',
  'medium',
  'high',
  'critical'
])

export const securityEvents = pgTable(
  'security_events',
  {
    id: text('id').primaryKey(),
    eventType: securityEventTypeEnum('event_type').notNull(),
    severity: securityEventSeverityEnum('severity').notNull().default('low'),
    userId: text('user_id'),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    location: text('location'), // Geolocation data
    details: text('details'), // JSON string with event-specific data
    resolved: boolean('resolved').notNull().default(false),
    resolvedBy: text('resolved_by'),
    resolvedAt: timestamp('resolved_at'),
    createdAt: timestamp('created_at').notNull().default(sql`CURRENT_TIMESTAMP`)
  },
  (securityEvent) => [
    index('idx_security_events_created_at').using(
      'btree',
      securityEvent.createdAt.asc().nullsLast().op('timestamp_ops')
    ),
    index('idx_security_events_severity').using(
      'btree',
      securityEvent.severity.asc().nullsLast().op('enum_ops')
    ),
    foreignKey({
      columns: [securityEvent.resolvedBy],
      foreignColumns: [users.id],
      name: 'security_events_resolved_by_fkey'
    }),
    foreignKey({
      columns: [securityEvent.userId],
      foreignColumns: [users.id],
      name: 'security_events_user_id_fkey'
    })
  ]
)

// Login Attempts Tracking
export const loginAttempts = pgTable(
  'login_attempts',
  {
    id: text('id').primaryKey(),
    email: text('email').notNull(),
    ipAddress: text('ip_address').notNull(),
    userAgent: text('user_agent'),
    success: boolean('success').notNull(),
    failureReason: text('failure_reason'), // 'invalid_credentials', 'account_locked', 'ip_blocked', etc.
    twoFactorRequired: boolean('two_factor_required').notNull().default(false),
    twoFactorSuccess: boolean('two_factor_success'),
    createdAt: timestamp('created_at').notNull().default(sql`CURRENT_TIMESTAMP`)
  },
  (loginAttempt) => [
    index('idx_login_attempts_created_at').using(
      'btree',
      loginAttempt.createdAt.asc().nullsLast().op('timestamp_ops')
    ),
    index('idx_login_attempts_email').using('btree', loginAttempt.email.asc().nullsLast().op('text_ops')),
    index('idx_login_attempts_ip_address').using(
      'btree',
      loginAttempt.ipAddress.asc().nullsLast().op('text_ops')
    )
  ]
)

// Account Lockouts
export const accountLockouts = pgTable(
  'account_lockouts',
  {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull(),
    reason: text('reason').notNull(), // 'failed_attempts', 'suspicious_activity', 'admin_action'
    lockedAt: timestamp('locked_at').notNull().default(sql`CURRENT_TIMESTAMP`),
    lockedUntil: timestamp('locked_until'), // NULL for permanent locks
    lockedBy: text('locked_by'), // Admin who locked the account
    unlocked: boolean('unlocked').notNull().default(false),
    unlockedAt: timestamp('unlocked_at'),
    unlockedBy: text('unlocked_by')
  },
  (accountLockout) => [
    foreignKey({
      columns: [accountLockout.lockedBy],
      foreignColumns: [users.id],
      name: 'account_lockouts_locked_by_fkey'
    }),
    foreignKey({
      columns: [accountLockout.unlockedBy],
      foreignColumns: [users.id],
      name: 'account_lockouts_unlocked_by_fkey'
    }),
    foreignKey({
      columns: [accountLockout.userId],
      foreignColumns: [users.id],
      name: 'account_lockouts_user_id_fkey'
    }).onDelete('cascade')
  ]
)

// API Rate Limiting
export const apiRateLimits = pgTable('api_rate_limits', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(), // IP address, user ID, or API key
  identifierType: text('identifier_type').notNull(), // 'ip', 'user', 'api_key'
  endpoint: text('endpoint'), // Specific endpoint or '*' for global
  requestCount: integer('request_count').notNull().default(0),
  windowStart: timestamp('window_start').notNull().default(sql`CURRENT_TIMESTAMP`),
  windowEnd: timestamp('window_end').notNull(),
  blocked: boolean('blocked').notNull().default(false),
  blockedUntil: timestamp('blocked_until')
})

// Security Settings
export const securitySettings = pgTable(
  'security_settings',
  {
    id: text('id').primaryKey(),
    key: text('key').notNull(),
    value: text('value').notNull(),
    description: text('description'),
    category: text('category').notNull().default('general'), // 'auth', 'rate_limiting', 'monitoring', etc.
    updatedBy: text('updated_by').notNull(),
    createdAt: timestamp('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: timestamp('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`)
  },
  (securitySetting) => [
    foreignKey({
      columns: [securitySetting.updatedBy],
      foreignColumns: [users.id],
      name: 'security_settings_updated_by_fkey'
    }),
    unique('security_settings_key_key').on(securitySetting.key)
  ]
)

// Relations
export const twoFactorTokensRelations = relations(twoFactorTokens, ({ one }) => ({
  user: one(users, {
    fields: [twoFactorTokens.userId],
    references: [users.id]
  })
}))

export const ipAccessControlRelations = relations(ipAccessControl, ({ one }) => ({
  createdByUser: one(users, {
    fields: [ipAccessControl.createdBy],
    references: [users.id]
  })
}))

export const securityEventsRelations = relations(securityEvents, ({ one }) => ({
  user: one(users, {
    fields: [securityEvents.userId],
    references: [users.id]
  }),
  resolvedByUser: one(users, {
    fields: [securityEvents.resolvedBy],
    references: [users.id]
  })
}))

export const accountLockoutsRelations = relations(accountLockouts, ({ one }) => ({
  user: one(users, {
    fields: [accountLockouts.userId],
    references: [users.id]
  }),
  lockedByUser: one(users, {
    fields: [accountLockouts.lockedBy],
    references: [users.id]
  }),
  unlockedByUser: one(users, {
    fields: [accountLockouts.unlockedBy],
    references: [users.id]
  })
}))

export const securitySettingsRelations = relations(securitySettings, ({ one }) => ({
  updatedByUser: one(users, {
    fields: [securitySettings.updatedBy],
    references: [users.id]
  })
}))
