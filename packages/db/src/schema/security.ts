import { relations } from 'drizzle-orm'
import { boolean, integer, pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

import { users } from './auth'

// Two-Factor Authentication
export const twoFactorTokens = pgTable('two_factor_tokens', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  secret: text('secret').notNull(), // TOTP secret
  backupCodes: text('backup_codes'), // JSON array of backup codes
  isEnabled: boolean('is_enabled').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  lastUsedAt: timestamp('last_used_at')
})

// IP Access Control
export const ipAccessControlTypeEnum = pgEnum('ip_access_control_type', ['whitelist', 'blacklist'])

export const ipAccessControl = pgTable('ip_access_control', {
  id: text('id').primaryKey(),
  ipAddress: text('ip_address').notNull(),
  ipRange: text('ip_range'), // CIDR notation for ranges
  type: ipAccessControlTypeEnum('type').notNull(),
  description: text('description'),
  isActive: boolean('is_active').notNull().default(true),
  createdBy: text('created_by')
    .notNull()
    .references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
})

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

export const securityEvents = pgTable('security_events', {
  id: text('id').primaryKey(),
  eventType: securityEventTypeEnum('event_type').notNull(),
  severity: securityEventSeverityEnum('severity').notNull().default('low'),
  userId: text('user_id').references(() => users.id),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  location: text('location'), // Geolocation data
  details: text('details'), // JSON string with event-specific data
  resolved: boolean('resolved').notNull().default(false),
  resolvedBy: text('resolved_by').references(() => users.id),
  resolvedAt: timestamp('resolved_at'),
  createdAt: timestamp('created_at').notNull().defaultNow()
})

// Login Attempts Tracking
export const loginAttempts = pgTable('login_attempts', {
  id: text('id').primaryKey(),
  email: text('email').notNull(),
  ipAddress: text('ip_address').notNull(),
  userAgent: text('user_agent'),
  success: boolean('success').notNull(),
  failureReason: text('failure_reason'), // 'invalid_credentials', 'account_locked', 'ip_blocked', etc.
  twoFactorRequired: boolean('two_factor_required').notNull().default(false),
  twoFactorSuccess: boolean('two_factor_success'),
  createdAt: timestamp('created_at').notNull().defaultNow()
})

// Account Lockouts
export const accountLockouts = pgTable('account_lockouts', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  reason: text('reason').notNull(), // 'failed_attempts', 'suspicious_activity', 'admin_action'
  lockedAt: timestamp('locked_at').notNull().defaultNow(),
  lockedUntil: timestamp('locked_until'), // NULL for permanent locks
  lockedBy: text('locked_by').references(() => users.id), // Admin who locked the account
  unlocked: boolean('unlocked').notNull().default(false),
  unlockedAt: timestamp('unlocked_at'),
  unlockedBy: text('unlocked_by').references(() => users.id)
})

// API Rate Limiting
export const apiRateLimits = pgTable('api_rate_limits', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(), // IP address, user ID, or API key
  identifierType: text('identifier_type').notNull(), // 'ip', 'user', 'api_key'
  endpoint: text('endpoint'), // Specific endpoint or '*' for global
  requestCount: integer('request_count').notNull().default(0),
  windowStart: timestamp('window_start').notNull().defaultNow(),
  windowEnd: timestamp('window_end').notNull(),
  blocked: boolean('blocked').notNull().default(false),
  blockedUntil: timestamp('blocked_until')
})

// Security Settings
export const securitySettings = pgTable('security_settings', {
  id: text('id').primaryKey(),
  key: text('key').notNull().unique(),
  value: text('value').notNull(),
  description: text('description'),
  category: text('category').notNull().default('general'), // 'auth', 'rate_limiting', 'monitoring', etc.
  updatedBy: text('updated_by')
    .notNull()
    .references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
})

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
