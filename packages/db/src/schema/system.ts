import { relations, sql } from 'drizzle-orm'
import {
  boolean,
  foreignKey,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique
} from 'drizzle-orm/pg-core'

import { users } from './auth'

// System Health Monitoring
export const healthCheckTypeEnum = pgEnum('health_check_type', [
  'database',
  'email',
  'api',
  'storage',
  'external_service'
])

export const healthCheckStatusEnum = pgEnum('health_check_status', [
  'healthy',
  'warning',
  'critical',
  'unknown'
])

export const systemHealthLogs = pgTable(
  'system_health_logs',
  {
    id: text('id').primaryKey(),
    checkType: healthCheckTypeEnum('check_type').notNull(),
    status: healthCheckStatusEnum('status').notNull(),
    responseTime: integer('response_time'), // in milliseconds
    message: text('message'),
    details: text('details'), // JSON string with additional details
    createdAt: timestamp('created_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`)
  },
  (systemHealthLog) => [
    index('idx_system_health_logs_created_at').using(
      'btree',
      systemHealthLog.createdAt.asc().nullsLast().op('timestamp_ops')
    ),
    index('idx_system_health_logs_status').using(
      'btree',
      systemHealthLog.status.asc().nullsLast().op('enum_ops')
    )
  ]
)

// Error Monitoring
export const errorLogs = pgTable(
  'error_logs',
  {
    id: text('id').primaryKey(),
    level: text('level').notNull(), // 'error', 'warning', 'info'
    message: text('message').notNull(),
    stack: text('stack'),
    url: text('url'),
    userAgent: text('user_agent'),
    userId: text('user_id'),
    ipAddress: text('ip_address'),
    metadata: text('metadata'), // JSON string
    resolved: boolean('resolved').notNull().default(false),
    resolvedBy: text('resolved_by'),
    resolvedAt: timestamp('resolved_at'),
    createdAt: timestamp('created_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`)
  },
  (errorLog) => [
    index('idx_error_logs_created_at').using(
      'btree',
      errorLog.createdAt.asc().nullsLast().op('timestamp_ops')
    ),
    index('idx_error_logs_level').using('btree', errorLog.level.asc().nullsLast().op('text_ops')),
    index('idx_error_logs_resolved').using(
      'btree',
      errorLog.resolved.asc().nullsLast().op('bool_ops')
    ),
    foreignKey({
      columns: [errorLog.resolvedBy],
      foreignColumns: [users.id],
      name: 'error_logs_resolved_by_fkey'
    }),
    foreignKey({
      columns: [errorLog.userId],
      foreignColumns: [users.id],
      name: 'error_logs_user_id_fkey'
    })
  ]
)

// Site Configuration
export const siteConfigTypeEnum = pgEnum('site_config_type', [
  'general',
  'seo',
  'social',
  'email',
  'analytics',
  'security',
  'features'
])

export const siteConfig = pgTable(
  'site_config',
  {
    id: text('id').primaryKey(),
    key: text('key').notNull(),
    value: text('value'),
    type: siteConfigTypeEnum('type').notNull().default('general'),
    description: text('description'),
    isPublic: boolean('is_public').notNull().default(false), // Can be accessed by non-admin users
    updatedBy: text('updated_by').notNull(),
    createdAt: timestamp('created_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: timestamp('updated_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`)
  },
  (siteConfigRow) => [
    index('idx_site_config_type').using(
      'btree',
      siteConfigRow.type.asc().nullsLast().op('enum_ops')
    ),
    foreignKey({
      columns: [siteConfigRow.updatedBy],
      foreignColumns: [users.id],
      name: 'site_config_updated_by_fkey'
    }),
    unique('site_config_key_key').on(siteConfigRow.key)
  ]
)

// Bulk Operations Tracking
export const bulkOperationStatusEnum = pgEnum('bulk_operation_status', [
  'pending',
  'running',
  'completed',
  'failed',
  'cancelled'
])

export const bulkOperations = pgTable(
  'bulk_operations',
  {
    id: text('id').primaryKey(),
    type: text('type').notNull(), // 'user_delete', 'user_ban', 'email_send', etc.
    status: bulkOperationStatusEnum('status').notNull().default('pending'),
    totalItems: integer('total_items').notNull(),
    processedItems: integer('processed_items').notNull().default(0),
    successfulItems: integer('successful_items').notNull().default(0),
    failedItems: integer('failed_items').notNull().default(0),
    parameters: text('parameters'), // JSON string with operation parameters
    results: text('results'), // JSON string with operation results
    errorMessage: text('error_message'),
    startedAt: timestamp('started_at'),
    completedAt: timestamp('completed_at'),
    createdBy: text('created_by').notNull(),
    createdAt: timestamp('created_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`)
  },
  (bulkOperation) => [
    index('idx_bulk_operations_created_at').using(
      'btree',
      bulkOperation.createdAt.asc().nullsLast().op('timestamp_ops')
    ),
    index('idx_bulk_operations_status').using(
      'btree',
      bulkOperation.status.asc().nullsLast().op('enum_ops')
    ),
    foreignKey({
      columns: [bulkOperation.createdBy],
      foreignColumns: [users.id],
      name: 'bulk_operations_created_by_fkey'
    })
  ]
)

// Relations
export const systemHealthLogsRelations = relations(systemHealthLogs, () => ({
  // No relations needed for health logs
}))

export const errorLogsRelations = relations(errorLogs, ({ one }) => ({
  user: one(users, {
    fields: [errorLogs.userId],
    references: [users.id]
  }),
  resolvedByUser: one(users, {
    fields: [errorLogs.resolvedBy],
    references: [users.id]
  })
}))

export const siteConfigRelations = relations(siteConfig, ({ one }) => ({
  updatedByUser: one(users, {
    fields: [siteConfig.updatedBy],
    references: [users.id]
  })
}))

export const bulkOperationsRelations = relations(bulkOperations, ({ one }) => ({
  createdByUser: one(users, {
    fields: [bulkOperations.createdBy],
    references: [users.id]
  })
}))
