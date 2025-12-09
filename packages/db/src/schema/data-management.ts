import { relations } from 'drizzle-orm'
import { boolean, integer, pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

import { users } from './auth'

// Database Backups
export const backupTypeEnum = pgEnum('backup_type', ['full', 'incremental', 'differential'])
export const backupStatusEnum = pgEnum('backup_status', [
  'pending',
  'running',
  'completed',
  'failed',
  'cancelled'
])

export const databaseBackups = pgTable('database_backups', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  type: backupTypeEnum('type').notNull().default('full'),
  status: backupStatusEnum('status').notNull().default('pending'),
  filePath: text('file_path'), // Path to backup file
  fileSize: integer('file_size'), // Size in bytes
  compressionType: text('compression_type'), // 'gzip', 'bzip2', etc.
  checksum: text('checksum'), // File integrity checksum
  tables: text('tables'), // JSON array of backed up tables
  excludedTables: text('excluded_tables'), // JSON array of excluded tables
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  duration: integer('duration'), // Backup duration in seconds
  errorMessage: text('error_message'),
  metadata: text('metadata'), // JSON with backup metadata
  isAutomatic: boolean('is_automatic').notNull().default(false),
  retentionDays: integer('retention_days').default(30),
  createdBy: text('created_by')
    .notNull()
    .references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow()
})

// Database Restores
export const restoreStatusEnum = pgEnum('restore_status', [
  'pending',
  'running',
  'completed',
  'failed',
  'cancelled'
])

export const databaseRestores = pgTable('database_restores', {
  id: text('id').primaryKey(),
  backupId: text('backup_id')
    .notNull()
    .references(() => databaseBackups.id),
  status: restoreStatusEnum('status').notNull().default('pending'),
  targetDatabase: text('target_database'), // Target database name
  restorePoint: timestamp('restore_point'), // Point-in-time recovery
  tables: text('tables'), // JSON array of tables to restore
  dataOnly: boolean('data_only').notNull().default(false), // Restore data only, not schema
  schemaOnly: boolean('schema_only').notNull().default(false), // Restore schema only, not data
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  duration: integer('duration'), // Restore duration in seconds
  errorMessage: text('error_message'),
  metadata: text('metadata'), // JSON with restore metadata
  createdBy: text('created_by')
    .notNull()
    .references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow()
})

// Data Migrations
export const migrationStatusEnum = pgEnum('migration_status', [
  'pending',
  'running',
  'completed',
  'failed',
  'rolled_back'
])

export const dataMigrations = pgTable('data_migrations', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  version: text('version').notNull(), // Migration version/identifier
  status: migrationStatusEnum('status').notNull().default('pending'),
  migrationScript: text('migration_script'), // SQL or script content
  rollbackScript: text('rollback_script'), // Rollback SQL or script
  checksum: text('checksum'), // Script integrity checksum
  dependencies: text('dependencies'), // JSON array of required migrations
  affectedTables: text('affected_tables'), // JSON array of tables affected
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  duration: integer('duration'), // Migration duration in seconds
  errorMessage: text('error_message'),
  rollbackReason: text('rollback_reason'),
  metadata: text('metadata'), // JSON with migration metadata
  createdBy: text('created_by')
    .notNull()
    .references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow()
})

// Data Export Jobs
export const exportFormatEnum = pgEnum('export_format', ['csv', 'json', 'xml', 'sql', 'excel'])
export const exportStatusEnum = pgEnum('export_status', [
  'pending',
  'running',
  'completed',
  'failed',
  'cancelled'
])

export const dataExports = pgTable('data_exports', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  format: exportFormatEnum('format').notNull().default('csv'),
  status: exportStatusEnum('status').notNull().default('pending'),
  query: text('query'), // SQL query for data export
  tables: text('tables'), // JSON array of tables to export
  filters: text('filters'), // JSON object with export filters
  filePath: text('file_path'), // Path to exported file
  fileSize: integer('file_size'), // Size in bytes
  recordCount: integer('record_count'), // Number of exported records
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  duration: integer('duration'), // Export duration in seconds
  errorMessage: text('error_message'),
  downloadUrl: text('download_url'), // Temporary download URL
  expiresAt: timestamp('expires_at'), // When download expires
  metadata: text('metadata'), // JSON with export metadata
  createdBy: text('created_by')
    .notNull()
    .references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow()
})

// Data Import Jobs
export const importStatusEnum = pgEnum('import_status', [
  'pending',
  'validating',
  'running',
  'completed',
  'failed',
  'cancelled'
])

export const dataImports = pgTable('data_imports', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  format: exportFormatEnum('format').notNull().default('csv'), // Reuse export format enum
  status: importStatusEnum('status').notNull().default('pending'),
  filePath: text('file_path').notNull(), // Path to import file
  fileSize: integer('file_size'), // Size in bytes
  targetTable: text('target_table').notNull(),
  mapping: text('mapping'), // JSON object mapping file columns to table columns
  validationRules: text('validation_rules'), // JSON array of validation rules
  duplicateHandling: text('duplicate_handling').notNull().default('skip'), // 'skip', 'update', 'error'
  totalRecords: integer('total_records'),
  processedRecords: integer('processed_records').notNull().default(0),
  successfulRecords: integer('successful_records').notNull().default(0),
  failedRecords: integer('failed_records').notNull().default(0),
  validationErrors: text('validation_errors'), // JSON array of validation errors
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  duration: integer('duration'), // Import duration in seconds
  errorMessage: text('error_message'),
  metadata: text('metadata'), // JSON with import metadata
  createdBy: text('created_by')
    .notNull()
    .references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow()
})

// Data Synchronization Jobs
export const syncDirectionEnum = pgEnum('sync_direction', ['push', 'pull', 'bidirectional'])
export const syncStatusEnum = pgEnum('sync_status', [
  'pending',
  'running',
  'completed',
  'failed',
  'cancelled'
])

export const dataSynchronization = pgTable('data_synchronization', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  sourceType: text('source_type').notNull(), // 'database', 'api', 'file', etc.
  sourceConfig: text('source_config').notNull(), // JSON with source configuration
  targetType: text('target_type').notNull(), // 'database', 'api', 'file', etc.
  targetConfig: text('target_config').notNull(), // JSON with target configuration
  direction: syncDirectionEnum('direction').notNull().default('pull'),
  status: syncStatusEnum('status').notNull().default('pending'),
  schedule: text('schedule'), // Cron expression for scheduled syncs
  mapping: text('mapping'), // JSON object for field mapping
  filters: text('filters'), // JSON object with sync filters
  lastSyncAt: timestamp('last_sync_at'),
  nextSyncAt: timestamp('next_sync_at'),
  syncedRecords: integer('synced_records').notNull().default(0),
  errorCount: integer('error_count').notNull().default(0),
  isActive: boolean('is_active').notNull().default(true),
  metadata: text('metadata'), // JSON with sync metadata
  createdBy: text('created_by')
    .notNull()
    .references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
})

// Data Quality Checks
export const qualityCheckTypeEnum = pgEnum('quality_check_type', [
  'completeness',
  'uniqueness',
  'validity',
  'consistency',
  'accuracy',
  'timeliness'
])

export const dataQualityChecks = pgTable('data_quality_checks', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  type: qualityCheckTypeEnum('type').notNull(),
  table: text('table').notNull(),
  column: text('column'), // Specific column or null for table-level checks
  rules: text('rules').notNull(), // JSON array of quality rules
  threshold: integer('threshold'), // Acceptable failure threshold (percentage)
  isActive: boolean('is_active').notNull().default(true),
  schedule: text('schedule'), // Cron expression for scheduled checks
  lastRunAt: timestamp('last_run_at'),
  nextRunAt: timestamp('next_run_at'),
  createdBy: text('created_by')
    .notNull()
    .references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
})

// Data Quality Results
export const qualityCheckResults = pgTable('data_quality_check_results', {
  id: text('id').primaryKey(),
  checkId: text('check_id')
    .notNull()
    .references(() => dataQualityChecks.id, { onDelete: 'cascade' }),
  totalRecords: integer('total_records').notNull(),
  passedRecords: integer('passed_records').notNull(),
  failedRecords: integer('failed_records').notNull(),
  successRate: integer('success_rate').notNull(), // Percentage
  details: text('details'), // JSON with detailed results
  issues: text('issues'), // JSON array of identified issues
  runAt: timestamp('run_at').notNull().defaultNow()
})

// Relations
export const databaseBackupsRelations = relations(databaseBackups, ({ one, many }) => ({
  createdByUser: one(users, {
    fields: [databaseBackups.createdBy],
    references: [users.id]
  }),
  restores: many(databaseRestores)
}))

export const databaseRestoresRelations = relations(databaseRestores, ({ one }) => ({
  backup: one(databaseBackups, {
    fields: [databaseRestores.backupId],
    references: [databaseBackups.id]
  }),
  createdByUser: one(users, {
    fields: [databaseRestores.createdBy],
    references: [users.id]
  })
}))

export const dataMigrationsRelations = relations(dataMigrations, ({ one }) => ({
  createdByUser: one(users, {
    fields: [dataMigrations.createdBy],
    references: [users.id]
  })
}))

export const dataExportsRelations = relations(dataExports, ({ one }) => ({
  createdByUser: one(users, {
    fields: [dataExports.createdBy],
    references: [users.id]
  })
}))

export const dataImportsRelations = relations(dataImports, ({ one }) => ({
  createdByUser: one(users, {
    fields: [dataImports.createdBy],
    references: [users.id]
  })
}))

export const dataSynchronizationRelations = relations(dataSynchronization, ({ one }) => ({
  createdByUser: one(users, {
    fields: [dataSynchronization.createdBy],
    references: [users.id]
  })
}))

export const dataQualityChecksRelations = relations(dataQualityChecks, ({ one, many }) => ({
  createdByUser: one(users, {
    fields: [dataQualityChecks.createdBy],
    references: [users.id]
  }),
  results: many(qualityCheckResults)
}))

export const qualityCheckResultsRelations = relations(qualityCheckResults, ({ one }) => ({
  check: one(dataQualityChecks, {
    fields: [qualityCheckResults.checkId],
    references: [dataQualityChecks.id]
  })
}))
