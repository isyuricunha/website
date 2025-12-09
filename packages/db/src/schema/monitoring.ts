import { relations } from 'drizzle-orm'
import { boolean, integer, pgEnum, pgTable, real, text, timestamp } from 'drizzle-orm/pg-core'

import { users } from './auth'

// Performance Metrics
export const performanceMetrics = pgTable('performance_metrics', {
  id: text('id').primaryKey(),
  metricName: text('metric_name').notNull(), // 'response_time', 'memory_usage', 'cpu_usage', etc.
  value: real('value').notNull(),
  unit: text('unit').notNull(), // 'ms', 'mb', 'percent', etc.
  endpoint: text('endpoint'), // API endpoint or page route
  userId: text('user_id').references(() => users.id),
  sessionId: text('session_id'),
  userAgent: text('user_agent'),
  ipAddress: text('ip_address'),
  metadata: text('metadata'), // JSON with additional context
  createdAt: timestamp('created_at').notNull().defaultNow()
})

// Real-time Analytics
export const analyticsEvents = pgTable('analytics_events', {
  id: text('id').primaryKey(),
  eventType: text('event_type').notNull(), // 'page_view', 'click', 'form_submit', etc.
  eventName: text('event_name'), // Specific event name
  userId: text('user_id').references(() => users.id),
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
  createdAt: timestamp('created_at').notNull().defaultNow()
})

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
  createdAt: timestamp('created_at').notNull().defaultNow()
})

// API Usage Tracking
export const apiUsage = pgTable('api_usage', {
  id: text('id').primaryKey(),
  endpoint: text('endpoint').notNull(),
  method: text('method').notNull(), // GET, POST, PUT, DELETE
  statusCode: integer('status_code').notNull(),
  responseTime: integer('response_time').notNull(), // in milliseconds
  requestSize: integer('request_size'), // in bytes
  responseSize: integer('response_size'), // in bytes
  userId: text('user_id').references(() => users.id),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  apiKey: text('api_key'), // If using API keys
  errorMessage: text('error_message'),
  createdAt: timestamp('created_at').notNull().defaultNow()
})

// Database Query Performance
export const queryPerformance = pgTable('query_performance', {
  id: text('id').primaryKey(),
  queryType: text('query_type').notNull(), // 'SELECT', 'INSERT', 'UPDATE', 'DELETE'
  table: text('table').notNull(),
  executionTime: real('execution_time').notNull(), // in milliseconds
  rowsAffected: integer('rows_affected'),
  queryHash: text('query_hash'), // Hash of the query for grouping
  endpoint: text('endpoint'), // API endpoint that triggered the query
  userId: text('user_id').references(() => users.id),
  slow: boolean('slow').notNull().default(false), // Flagged as slow query
  createdAt: timestamp('created_at').notNull().defaultNow()
})

// Error Tracking (Enhanced)
export const errorTracking = pgTable('error_tracking', {
  id: text('id').primaryKey(),
  errorType: text('error_type').notNull(), // 'javascript', 'server', 'database', etc.
  errorName: text('error_name').notNull(),
  message: text('message').notNull(),
  stack: text('stack'),
  filename: text('filename'),
  lineNumber: integer('line_number'),
  columnNumber: integer('column_number'),
  userId: text('user_id').references(() => users.id),
  sessionId: text('session_id'),
  url: text('url'),
  userAgent: text('user_agent'),
  ipAddress: text('ip_address'),
  breadcrumbs: text('breadcrumbs'), // JSON array of user actions leading to error
  tags: text('tags'), // JSON array of tags for categorization
  fingerprint: text('fingerprint'), // Unique identifier for grouping similar errors
  count: integer('count').notNull().default(1), // Number of times this error occurred
  firstSeen: timestamp('first_seen').notNull().defaultNow(),
  lastSeen: timestamp('last_seen').notNull().defaultNow(),
  resolved: boolean('resolved').notNull().default(false),
  resolvedBy: text('resolved_by').references(() => users.id),
  resolvedAt: timestamp('resolved_at'),
  createdAt: timestamp('created_at').notNull().defaultNow()
})

// Custom Metrics/KPIs
export const customMetrics = pgTable('custom_metrics', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  value: real('value').notNull(),
  unit: text('unit'),
  category: text('category'), // 'business', 'technical', 'user_engagement', etc.
  dimensions: text('dimensions'), // JSON object with metric dimensions
  createdBy: text('created_by').references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow()
})

// Alerts Configuration
export const alertTypeEnum = pgEnum('alert_type', [
  'threshold',
  'anomaly',
  'error_rate',
  'performance',
  'security',
  'business'
])

export const alertSeverityEnum = pgEnum('alert_severity', [
  'info',
  'warning',
  'critical'
])

export const alerts = pgTable('alerts', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  type: alertTypeEnum('type').notNull(),
  severity: alertSeverityEnum('severity').notNull().default('warning'),
  conditions: text('conditions').notNull(), // JSON with alert conditions
  isActive: boolean('is_active').notNull().default(true),
  notificationChannels: text('notification_channels'), // JSON array of channels
  createdBy: text('created_by')
    .notNull()
    .references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
})

// Alert Instances (when alerts are triggered)
export const alertInstances = pgTable('alert_instances', {
  id: text('id').primaryKey(),
  alertId: text('alert_id')
    .notNull()
    .references(() => alerts.id, { onDelete: 'cascade' }),
  triggeredValue: real('triggered_value'),
  message: text('message').notNull(),
  metadata: text('metadata'), // JSON with context about what triggered the alert
  resolved: boolean('resolved').notNull().default(false),
  resolvedBy: text('resolved_by').references(() => users.id),
  resolvedAt: timestamp('resolved_at'),
  notificationsSent: text('notifications_sent'), // JSON array of sent notifications
  triggeredAt: timestamp('triggered_at').notNull().defaultNow()
})

// User Activity Tracking
export const userActivity = pgTable('user_activity', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  action: text('action').notNull(), // 'login', 'logout', 'page_view', 'click', etc.
  resource: text('resource'), // What was acted upon
  details: text('details'), // JSON with action details
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  sessionId: text('session_id'),
  duration: integer('duration'), // Time spent on action (in seconds)
  createdAt: timestamp('created_at').notNull().defaultNow()
})

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
