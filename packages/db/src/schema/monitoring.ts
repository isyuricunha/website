import { relations, sql } from 'drizzle-orm'
import {
  boolean,
  foreignKey,
  index,
  integer,
  pgEnum,
  pgTable,
  real,
  text,
  timestamp
} from 'drizzle-orm/pg-core'

import { users } from './auth'

// Performance Metrics
export const performanceMetrics = pgTable(
  'performance_metrics',
  {
    id: text('id').primaryKey(),
    metricName: text('metric_name').notNull(), // 'response_time', 'memory_usage', 'cpu_usage', etc.
    value: real('value').notNull(),
    unit: text('unit').notNull(), // 'ms', 'mb', 'percent', etc.
    endpoint: text('endpoint'), // API endpoint or page route
    userId: text('user_id'),
    sessionId: text('session_id'),
    userAgent: text('user_agent'),
    ipAddress: text('ip_address'),
    metadata: text('metadata'), // JSON with additional context
    createdAt: timestamp('created_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`)
  },
  (performanceMetric) => [
    index('idx_performance_metrics_created_at').using(
      'btree',
      performanceMetric.createdAt.asc().nullsLast().op('timestamp_ops')
    ),
    foreignKey({
      columns: [performanceMetric.userId],
      foreignColumns: [users.id],
      name: 'performance_metrics_user_id_fkey'
    })
  ]
)

// Real-time Analytics
export const analyticsEvents = pgTable(
  'analytics_events',
  {
    id: text('id').primaryKey(),
    eventType: text('event_type').notNull(), // 'page_view', 'click', 'form_submit', etc.
    eventName: text('event_name'), // Specific event name
    userId: text('user_id'),
    sessionId: text('session_id').notNull(),
    page: text('page'), // Current page/route
    referrer: text('referrer'),
    userAgent: text('user_agent'),
    ipAddress: text('ip_address'),
    country: text('country'),
    city: text('city'),
    device: text('device'), // 'desktop', 'mobile', 'tablet'
    browser: text('browser'),
    os: text('os'),
    properties: text('properties'), // JSON with event-specific data
    createdAt: timestamp('created_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`)
  },
  (analyticsEvent) => [
    index('idx_analytics_events_created_at').using(
      'btree',
      analyticsEvent.createdAt.asc().nullsLast().op('timestamp_ops')
    ),
    index('idx_analytics_events_user_id').using(
      'btree',
      analyticsEvent.userId.asc().nullsLast().op('text_ops')
    ),
    foreignKey({
      columns: [analyticsEvent.userId],
      foreignColumns: [users.id],
      name: 'analytics_events_user_id_fkey'
    })
  ]
)

// System Resource Usage
export const resourceUsageTypeEnum = pgEnum('resource_usage_type', [
  'cpu',
  'memory',
  'disk',
  'network',
  'database_connections',
  'cache_hit_rate'
])

export const resourceUsage = pgTable('resource_usage', {
  id: text('id').primaryKey(),
  type: resourceUsageTypeEnum('type').notNull(),
  value: real('value').notNull(),
  maxValue: real('max_value'), // Maximum capacity
  unit: text('unit').notNull(),
  hostname: text('hostname'), // Server/container identifier
  service: text('service'), // 'web', 'database', 'cache', etc.
  metadata: text('metadata'), // JSON with additional details
  createdAt: timestamp('created_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`)
})

// API Usage Tracking
export const apiUsage = pgTable(
  'api_usage',
  {
    id: text('id').primaryKey(),
    endpoint: text('endpoint').notNull(),
    method: text('method').notNull(), // GET, POST, PUT, DELETE
    statusCode: integer('status_code').notNull(),
    responseTime: integer('response_time').notNull(), // in milliseconds
    requestSize: integer('request_size'), // in bytes
    responseSize: integer('response_size'), // in bytes
    userId: text('user_id'),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    apiKey: text('api_key'), // If using API keys
    errorMessage: text('error_message'),
    createdAt: timestamp('created_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`)
  },
  (apiUsageRow) => [
    index('idx_api_usage_created_at').using(
      'btree',
      apiUsageRow.createdAt.asc().nullsLast().op('timestamp_ops')
    ),
    index('idx_api_usage_endpoint').using(
      'btree',
      apiUsageRow.endpoint.asc().nullsLast().op('text_ops')
    ),
    foreignKey({
      columns: [apiUsageRow.userId],
      foreignColumns: [users.id],
      name: 'api_usage_user_id_fkey'
    })
  ]
)

// Database Query Performance
export const queryPerformance = pgTable(
  'query_performance',
  {
    id: text('id').primaryKey(),
    queryType: text('query_type').notNull(), // 'SELECT', 'INSERT', 'UPDATE', 'DELETE'
    tableName: text('table_name').notNull(),
    executionTime: real('execution_time').notNull(), // in milliseconds
    rowsAffected: integer('rows_affected'),
    queryHash: text('query_hash'), // Hash of the query for grouping
    endpoint: text('endpoint'), // API endpoint that triggered the query
    userId: text('user_id'),
    slow: boolean('slow').notNull().default(false), // Flagged as slow query
    createdAt: timestamp('created_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`)
  },
  (queryPerformanceRow) => [
    foreignKey({
      columns: [queryPerformanceRow.userId],
      foreignColumns: [users.id],
      name: 'query_performance_user_id_fkey'
    })
  ]
)

// Error Tracking (Enhanced)
export const errorTracking = pgTable(
  'error_tracking',
  {
    id: text('id').primaryKey(),
    errorType: text('error_type').notNull(), // 'javascript', 'server', 'database', etc.
    errorName: text('error_name').notNull(),
    message: text('message').notNull(),
    stack: text('stack'),
    filename: text('filename'),
    lineNumber: integer('line_number'),
    columnNumber: integer('column_number'),
    userId: text('user_id'),
    sessionId: text('session_id'),
    url: text('url'),
    userAgent: text('user_agent'),
    ipAddress: text('ip_address'),
    breadcrumbs: text('breadcrumbs'), // JSON array of user actions leading to error
    tags: text('tags'), // JSON array of tags for categorization
    fingerprint: text('fingerprint'), // Unique identifier for grouping similar errors
    count: integer('count').notNull().default(1), // Number of times this error occurred
    firstSeen: timestamp('first_seen')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    lastSeen: timestamp('last_seen')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    resolved: boolean('resolved').notNull().default(false),
    resolvedBy: text('resolved_by'),
    resolvedAt: timestamp('resolved_at'),
    createdAt: timestamp('created_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`)
  },
  (errorTrackingRow) => [
    index('idx_error_tracking_fingerprint').using(
      'btree',
      errorTrackingRow.fingerprint.asc().nullsLast().op('text_ops')
    ),
    foreignKey({
      columns: [errorTrackingRow.resolvedBy],
      foreignColumns: [users.id],
      name: 'error_tracking_resolved_by_fkey'
    }),
    foreignKey({
      columns: [errorTrackingRow.userId],
      foreignColumns: [users.id],
      name: 'error_tracking_user_id_fkey'
    })
  ]
)

// Custom Metrics/KPIs
export const customMetrics = pgTable(
  'custom_metrics',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    description: text('description'),
    value: real('value').notNull(),
    unit: text('unit'),
    category: text('category'), // 'business', 'technical', 'user_engagement', etc.
    dimensions: text('dimensions'), // JSON object with metric dimensions
    createdBy: text('created_by'),
    createdAt: timestamp('created_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`)
  },
  (customMetric) => [
    foreignKey({
      columns: [customMetric.createdBy],
      foreignColumns: [users.id],
      name: 'custom_metrics_created_by_fkey'
    })
  ]
)

// Alerts Configuration
export const alertTypeEnum = pgEnum('alert_type', [
  'threshold',
  'anomaly',
  'error_rate',
  'performance',
  'security',
  'business'
])

export const alertSeverityEnum = pgEnum('alert_severity', ['info', 'warning', 'critical'])

export const alerts = pgTable(
  'alerts',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    description: text('description'),
    type: alertTypeEnum('type').notNull(),
    severity: alertSeverityEnum('severity').notNull().default('warning'),
    conditions: text('conditions').notNull(), // JSON with alert conditions
    isActive: boolean('is_active').notNull().default(true),
    notificationChannels: text('notification_channels'), // JSON array of channels
    createdBy: text('created_by').notNull(),
    createdAt: timestamp('created_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: timestamp('updated_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`)
  },
  (alert) => [
    foreignKey({
      columns: [alert.createdBy],
      foreignColumns: [users.id],
      name: 'alerts_created_by_fkey'
    })
  ]
)

// Alert Instances (when alerts are triggered)
export const alertInstances = pgTable(
  'alert_instances',
  {
    id: text('id').primaryKey(),
    alertId: text('alert_id').notNull(),
    triggeredValue: real('triggered_value'),
    message: text('message').notNull(),
    metadata: text('metadata'), // JSON with context about what triggered the alert
    resolved: boolean('resolved').notNull().default(false),
    resolvedBy: text('resolved_by'),
    resolvedAt: timestamp('resolved_at'),
    notificationsSent: text('notifications_sent'), // JSON array of sent notifications
    triggeredAt: timestamp('triggered_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`)
  },
  (alertInstance) => [
    foreignKey({
      columns: [alertInstance.alertId],
      foreignColumns: [alerts.id],
      name: 'alert_instances_alert_id_fkey'
    }).onDelete('cascade'),
    foreignKey({
      columns: [alertInstance.resolvedBy],
      foreignColumns: [users.id],
      name: 'alert_instances_resolved_by_fkey'
    })
  ]
)

// User Activity Tracking
export const userActivity = pgTable(
  'user_activity',
  {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull(),
    action: text('action').notNull(), // 'login', 'logout', 'page_view', 'click', etc.
    resource: text('resource'), // What was acted upon
    details: text('details'), // JSON with action details
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    sessionId: text('session_id'),
    duration: integer('duration'), // Time spent on action (in seconds)
    createdAt: timestamp('created_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`)
  },
  (userActivityRow) => [
    index('idx_user_activity_created_at').using(
      'btree',
      userActivityRow.createdAt.asc().nullsLast().op('timestamp_ops')
    ),
    index('idx_user_activity_user_id').using(
      'btree',
      userActivityRow.userId.asc().nullsLast().op('text_ops')
    ),
    foreignKey({
      columns: [userActivityRow.userId],
      foreignColumns: [users.id],
      name: 'user_activity_user_id_fkey'
    }).onDelete('cascade')
  ]
)

// Relations
export const performanceMetricsRelations = relations(performanceMetrics, ({ one }) => ({
  user: one(users, {
    fields: [performanceMetrics.userId],
    references: [users.id]
  })
}))

export const analyticsEventsRelations = relations(analyticsEvents, ({ one }) => ({
  user: one(users, {
    fields: [analyticsEvents.userId],
    references: [users.id]
  })
}))

export const apiUsageRelations = relations(apiUsage, ({ one }) => ({
  user: one(users, {
    fields: [apiUsage.userId],
    references: [users.id]
  })
}))

export const queryPerformanceRelations = relations(queryPerformance, ({ one }) => ({
  user: one(users, {
    fields: [queryPerformance.userId],
    references: [users.id]
  })
}))

export const errorTrackingRelations = relations(errorTracking, ({ one }) => ({
  user: one(users, {
    fields: [errorTracking.userId],
    references: [users.id]
  }),
  resolvedByUser: one(users, {
    fields: [errorTracking.resolvedBy],
    references: [users.id]
  })
}))

export const customMetricsRelations = relations(customMetrics, ({ one }) => ({
  createdByUser: one(users, {
    fields: [customMetrics.createdBy],
    references: [users.id]
  })
}))

export const alertsRelations = relations(alerts, ({ one, many }) => ({
  createdByUser: one(users, {
    fields: [alerts.createdBy],
    references: [users.id]
  }),
  instances: many(alertInstances)
}))

export const alertInstancesRelations = relations(alertInstances, ({ one }) => ({
  alert: one(alerts, {
    fields: [alertInstances.alertId],
    references: [alerts.id]
  }),
  resolvedByUser: one(users, {
    fields: [alertInstances.resolvedBy],
    references: [users.id]
  })
}))

export const userActivityRelations = relations(userActivity, ({ one }) => ({
  user: one(users, {
    fields: [userActivity.userId],
    references: [users.id]
  })
}))
