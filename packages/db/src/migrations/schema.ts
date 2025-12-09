import { pgTable, text, timestamp, integer, foreignKey, unique, boolean, index, uniqueIndex, real, primaryKey, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const alertSeverity = pgEnum("alert_severity", ['info', 'warning', 'critical'])
export const alertType = pgEnum("alert_type", ['threshold', 'anomaly', 'error_rate', 'performance', 'security', 'business'])
export const announcementType = pgEnum("announcement_type", ['info', 'warning', 'success', 'error', 'maintenance', 'feature', 'update'])
export const auditLogAction = pgEnum("audit_log_action", ['user_create', 'user_update', 'user_delete', 'user_ban', 'user_unban', 'user_password_reset', 'comment_delete', 'comment_approve', 'comment_reject', 'admin_login', 'admin_logout', 'settings_update', 'bulk_operation'])
export const backupStatus = pgEnum("backup_status", ['pending', 'running', 'completed', 'failed', 'cancelled'])
export const backupType = pgEnum("backup_type", ['full', 'incremental', 'differential'])
export const bulkOperationStatus = pgEnum("bulk_operation_status", ['pending', 'running', 'completed', 'failed', 'cancelled'])
export const emailCampaignStatus = pgEnum("email_campaign_status", ['draft', 'scheduled', 'sending', 'sent', 'paused', 'cancelled', 'failed'])
export const emailTemplateType = pgEnum("email_template_type", ['welcome', 'password_reset', 'email_verification', 'newsletter', 'announcement', 'notification', 'marketing', 'transactional'])
export const exportFormat = pgEnum("export_format", ['csv', 'json', 'xml', 'sql', 'excel'])
export const exportStatus = pgEnum("export_status", ['pending', 'running', 'completed', 'failed', 'cancelled'])
export const healthCheckStatus = pgEnum("health_check_status", ['healthy', 'warning', 'critical', 'unknown'])
export const healthCheckType = pgEnum("health_check_type", ['database', 'email', 'api', 'storage', 'external_service'])
export const importStatus = pgEnum("import_status", ['pending', 'validating', 'running', 'completed', 'failed', 'cancelled'])
export const ipAccessControlType = pgEnum("ip_access_control_type", ['whitelist', 'blacklist'])
export const migrationStatus = pgEnum("migration_status", ['pending', 'running', 'completed', 'failed', 'rolled_back'])
export const notificationChannel = pgEnum("notification_channel", ['email', 'push', 'sms', 'in_app'])
export const notificationType = pgEnum("notification_type", ['system', 'user_action', 'content', 'security', 'marketing', 'reminder'])
export const postStatus = pgEnum("post_status", ['draft', 'published', 'archived'])
export const qualityCheckType = pgEnum("quality_check_type", ['completeness', 'uniqueness', 'validity', 'consistency', 'accuracy', 'timeliness'])
export const resourceUsageType = pgEnum("resource_usage_type", ['cpu', 'memory', 'disk', 'network', 'database_connections', 'cache_hit_rate'])
export const restoreStatus = pgEnum("restore_status", ['pending', 'running', 'completed', 'failed', 'cancelled'])
export const role = pgEnum("role", ['user', 'admin'])
export const securityEventSeverity = pgEnum("security_event_severity", ['low', 'medium', 'high', 'critical'])
export const securityEventType = pgEnum("security_event_type", ['login_attempt', 'login_success', 'login_failure', 'password_change', 'email_change', 'two_factor_enabled', 'two_factor_disabled', 'suspicious_activity', 'account_locked', 'account_unlocked', 'admin_action', 'data_export', 'permission_change'])
export const siteConfigType = pgEnum("site_config_type", ['general', 'seo', 'social', 'email', 'analytics', 'security', 'features'])
export const syncDirection = pgEnum("sync_direction", ['push', 'pull', 'bidirectional'])
export const syncStatus = pgEnum("sync_status", ['pending', 'running', 'completed', 'failed', 'cancelled'])


export const verification = pgTable("verification", {
	id: text().primaryKey().notNull(),
	identifier: text().notNull(),
	value: text().notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
});

export const likesSession = pgTable("likes_session", {
	id: text().primaryKey().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP(3)`).notNull(),
	likes: integer().default(0).notNull(),
});

export const account = pgTable("account", {
	id: text().primaryKey().notNull(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: text("user_id").notNull(),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: timestamp("access_token_expires_at", { mode: 'string' }),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { mode: 'string' }),
	scope: text(),
	password: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "account_user_id_user_id_fk"
		}).onDelete("cascade"),
]);

export const session = pgTable("session", {
	id: text().primaryKey().notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	token: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: text("user_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "session_user_id_user_id_fk"
		}).onDelete("cascade"),
	unique("session_token_unique").on(table.token),
]);

export const comment = pgTable("comment", {
	id: text().primaryKey().notNull(),
	body: text().notNull(),
	userId: text("user_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP(3)`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP(3)`).notNull(),
	postId: text("post_id").notNull(),
	parentId: text("parent_id"),
	isDeleted: boolean("is_deleted").default(false).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.postId],
			foreignColumns: [post.slug],
			name: "comment_post_id_post_slug_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "comment_user_id_user_id_fk"
		}),
]);

export const guestbook = pgTable("guestbook", {
	id: text().primaryKey().notNull(),
	body: text().notNull(),
	userId: text("user_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP(3)`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP(3)`).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "guestbook_user_id_user_id_fk"
		}),
]);

export const users = pgTable("users", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	email: text().notNull(),
	emailVerified: boolean("email_verified").notNull(),
	image: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).notNull(),
	role: role().default('user').notNull(),
	isAnonymous: boolean().default(false),
	username: text(),
	bio: text(),
	isPublic: boolean("is_public").default(true).notNull(),
});

export const passwordResetTokens = pgTable("password_reset_tokens", {
	id: text().primaryKey().notNull(),
	token: text().notNull(),
	userId: text("user_id").notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).notNull(),
	used: boolean().default(false).notNull(),
}, (table) => [
	index("password_reset_tokens_expires_at_idx").using("btree", table.expiresAt.asc().nullsLast().op("timestamp_ops")),
	uniqueIndex("password_reset_tokens_token_unique").using("btree", table.token.asc().nullsLast().op("text_ops")),
	index("password_reset_tokens_user_id_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "password_reset_tokens_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const post = pgTable("post", {
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP(3)`).notNull(),
	slug: text().notNull().unique("unique_post_slug"),
	likes: integer().default(0).notNull(),
	views: integer().default(0).notNull(),
	id: text().primaryKey().notNull(),
	title: text(),
	description: text(),
	content: text(),
	excerpt: text(),
	coverImage: text("cover_image"),
	tags: text(),
	status: postStatus().default('draft'),
	featured: boolean().default(false),
	authorId: text("author_id"),
	publishedAt: timestamp("published_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_post_author_id").using("btree", table.authorId.asc().nullsLast().op("text_ops")),
	index("idx_post_published_at").using("btree", table.publishedAt.asc().nullsLast().op("timestamp_ops")),
	index("idx_post_status").using("btree", table.status.asc().nullsLast().op("enum_ops")),
	foreignKey({
			columns: [table.authorId],
			foreignColumns: [users.id],
			name: "fk_post_author"
		}).onDelete("cascade"),
]);

export const auditLogs = pgTable("audit_logs", {
	id: text().primaryKey().notNull(),
	adminUserId: text("admin_user_id").notNull(),
	action: auditLogAction().notNull(),
	targetType: text("target_type"),
	targetId: text("target_id"),
	details: text(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_audit_logs_action").using("btree", table.action.asc().nullsLast().op("enum_ops")),
	index("idx_audit_logs_admin_user_id").using("btree", table.adminUserId.asc().nullsLast().op("text_ops")),
	index("idx_audit_logs_created_at").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("idx_audit_logs_target").using("btree", table.targetType.asc().nullsLast().op("text_ops"), table.targetId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.adminUserId],
			foreignColumns: [users.id],
			name: "audit_logs_admin_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const systemHealthLogs = pgTable("system_health_logs", {
	id: text().primaryKey().notNull(),
	checkType: healthCheckType("check_type").notNull(),
	status: healthCheckStatus().notNull(),
	responseTime: integer("response_time"),
	message: text(),
	details: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	index("idx_system_health_logs_created_at").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("idx_system_health_logs_status").using("btree", table.status.asc().nullsLast().op("enum_ops")),
]);

export const errorLogs = pgTable("error_logs", {
	id: text().primaryKey().notNull(),
	level: text().notNull(),
	message: text().notNull(),
	stack: text(),
	url: text(),
	userAgent: text("user_agent"),
	userId: text("user_id"),
	ipAddress: text("ip_address"),
	metadata: text(),
	resolved: boolean().default(false).notNull(),
	resolvedBy: text("resolved_by"),
	resolvedAt: timestamp("resolved_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	index("idx_error_logs_created_at").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("idx_error_logs_level").using("btree", table.level.asc().nullsLast().op("text_ops")),
	index("idx_error_logs_resolved").using("btree", table.resolved.asc().nullsLast().op("bool_ops")),
	foreignKey({
			columns: [table.resolvedBy],
			foreignColumns: [users.id],
			name: "error_logs_resolved_by_fkey"
		}),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "error_logs_user_id_fkey"
		}),
]);

export const siteConfig = pgTable("site_config", {
	id: text().primaryKey().notNull(),
	key: text().notNull(),
	value: text(),
	type: siteConfigType().default('general').notNull(),
	description: text(),
	isPublic: boolean("is_public").default(false).notNull(),
	updatedBy: text("updated_by").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	index("idx_site_config_type").using("btree", table.type.asc().nullsLast().op("enum_ops")),
	foreignKey({
			columns: [table.updatedBy],
			foreignColumns: [users.id],
			name: "site_config_updated_by_fkey"
		}),
	unique("site_config_key_key").on(table.key),
]);

export const bulkOperations = pgTable("bulk_operations", {
	id: text().primaryKey().notNull(),
	type: text().notNull(),
	status: bulkOperationStatus().default('pending').notNull(),
	totalItems: integer("total_items").notNull(),
	processedItems: integer("processed_items").default(0).notNull(),
	successfulItems: integer("successful_items").default(0).notNull(),
	failedItems: integer("failed_items").default(0).notNull(),
	parameters: text(),
	results: text(),
	errorMessage: text("error_message"),
	startedAt: timestamp("started_at", { mode: 'string' }),
	completedAt: timestamp("completed_at", { mode: 'string' }),
	createdBy: text("created_by").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	index("idx_bulk_operations_created_at").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("idx_bulk_operations_status").using("btree", table.status.asc().nullsLast().op("enum_ops")),
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: "bulk_operations_created_by_fkey"
		}),
]);

export const securitySettings = pgTable("security_settings", {
	id: text().primaryKey().notNull(),
	key: text().notNull(),
	value: text().notNull(),
	description: text(),
	category: text().default('general').notNull(),
	updatedBy: text("updated_by").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.updatedBy],
			foreignColumns: [users.id],
			name: "security_settings_updated_by_fkey"
		}),
	unique("security_settings_key_key").on(table.key),
]);

export const emailTemplates = pgTable("email_templates", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	type: emailTemplateType().notNull(),
	subject: text().notNull(),
	htmlContent: text("html_content").notNull(),
	textContent: text("text_content"),
	variables: text(),
	isActive: boolean("is_active").default(true).notNull(),
	createdBy: text("created_by").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: "email_templates_created_by_fkey"
		}),
]);

export const securityEvents = pgTable("security_events", {
	id: text().primaryKey().notNull(),
	eventType: securityEventType("event_type").notNull(),
	severity: securityEventSeverity().default('low').notNull(),
	userId: text("user_id"),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	location: text(),
	details: text(),
	resolved: boolean().default(false).notNull(),
	resolvedBy: text("resolved_by"),
	resolvedAt: timestamp("resolved_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	index("idx_security_events_created_at").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("idx_security_events_severity").using("btree", table.severity.asc().nullsLast().op("enum_ops")),
	foreignKey({
			columns: [table.resolvedBy],
			foreignColumns: [users.id],
			name: "security_events_resolved_by_fkey"
		}),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "security_events_user_id_fkey"
		}),
]);

export const loginAttempts = pgTable("login_attempts", {
	id: text().primaryKey().notNull(),
	email: text().notNull(),
	ipAddress: text("ip_address").notNull(),
	userAgent: text("user_agent"),
	success: boolean().notNull(),
	failureReason: text("failure_reason"),
	twoFactorRequired: boolean("two_factor_required").default(false).notNull(),
	twoFactorSuccess: boolean("two_factor_success"),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	index("idx_login_attempts_created_at").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("idx_login_attempts_email").using("btree", table.email.asc().nullsLast().op("text_ops")),
	index("idx_login_attempts_ip_address").using("btree", table.ipAddress.asc().nullsLast().op("text_ops")),
]);

export const twoFactorTokens = pgTable("two_factor_tokens", {
	id: text().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	secret: text().notNull(),
	backupCodes: text("backup_codes"),
	isEnabled: boolean("is_enabled").default(false).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	lastUsedAt: timestamp("last_used_at", { mode: 'string' }),
}, (table) => [
	index("idx_two_factor_tokens_user_id").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "two_factor_tokens_user_id_fkey"
		}).onDelete("cascade"),
]);

export const ipAccessControl = pgTable("ip_access_control", {
	id: text().primaryKey().notNull(),
	ipAddress: text("ip_address").notNull(),
	ipRange: text("ip_range"),
	type: ipAccessControlType().notNull(),
	description: text(),
	isActive: boolean("is_active").default(true).notNull(),
	createdBy: text("created_by").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: "ip_access_control_created_by_fkey"
		}),
]);

export const accountLockouts = pgTable("account_lockouts", {
	id: text().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	reason: text().notNull(),
	lockedAt: timestamp("locked_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	lockedUntil: timestamp("locked_until", { mode: 'string' }),
	lockedBy: text("locked_by"),
	unlocked: boolean().default(false).notNull(),
	unlockedAt: timestamp("unlocked_at", { mode: 'string' }),
	unlockedBy: text("unlocked_by"),
}, (table) => [
	foreignKey({
			columns: [table.lockedBy],
			foreignColumns: [users.id],
			name: "account_lockouts_locked_by_fkey"
		}),
	foreignKey({
			columns: [table.unlockedBy],
			foreignColumns: [users.id],
			name: "account_lockouts_unlocked_by_fkey"
		}),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "account_lockouts_user_id_fkey"
		}).onDelete("cascade"),
]);

export const apiRateLimits = pgTable("api_rate_limits", {
	id: text().primaryKey().notNull(),
	identifier: text().notNull(),
	identifierType: text("identifier_type").notNull(),
	endpoint: text(),
	requestCount: integer("request_count").default(0).notNull(),
	windowStart: timestamp("window_start", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	windowEnd: timestamp("window_end", { mode: 'string' }).notNull(),
	blocked: boolean().default(false).notNull(),
	blockedUntil: timestamp("blocked_until", { mode: 'string' }),
});

export const emailCampaigns = pgTable("email_campaigns", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	subject: text().notNull(),
	templateId: text("template_id"),
	htmlContent: text("html_content"),
	textContent: text("text_content"),
	status: emailCampaignStatus().default('draft').notNull(),
	targetAudience: text("target_audience"),
	totalRecipients: integer("total_recipients").default(0).notNull(),
	sentCount: integer("sent_count").default(0).notNull(),
	deliveredCount: integer("delivered_count").default(0).notNull(),
	openedCount: integer("opened_count").default(0).notNull(),
	clickedCount: integer("clicked_count").default(0).notNull(),
	bouncedCount: integer("bounced_count").default(0).notNull(),
	unsubscribedCount: integer("unsubscribed_count").default(0).notNull(),
	scheduledAt: timestamp("scheduled_at", { mode: 'string' }),
	startedAt: timestamp("started_at", { mode: 'string' }),
	completedAt: timestamp("completed_at", { mode: 'string' }),
	createdBy: text("created_by").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	index("idx_email_campaigns_status").using("btree", table.status.asc().nullsLast().op("enum_ops")),
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: "email_campaigns_created_by_fkey"
		}),
	foreignKey({
			columns: [table.templateId],
			foreignColumns: [emailTemplates.id],
			name: "email_campaigns_template_id_fkey"
		}),
]);

export const emailCampaignRecipients = pgTable("email_campaign_recipients", {
	id: text().primaryKey().notNull(),
	campaignId: text("campaign_id").notNull(),
	userId: text("user_id"),
	email: text().notNull(),
	status: text().default('pending').notNull(),
	sentAt: timestamp("sent_at", { mode: 'string' }),
	deliveredAt: timestamp("delivered_at", { mode: 'string' }),
	openedAt: timestamp("opened_at", { mode: 'string' }),
	clickedAt: timestamp("clicked_at", { mode: 'string' }),
	unsubscribedAt: timestamp("unsubscribed_at", { mode: 'string' }),
	errorMessage: text("error_message"),
}, (table) => [
	foreignKey({
			columns: [table.campaignId],
			foreignColumns: [emailCampaigns.id],
			name: "email_campaign_recipients_campaign_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "email_campaign_recipients_user_id_fkey"
		}),
]);

export const announcements = pgTable("announcements", {
	id: text().primaryKey().notNull(),
	title: text().notNull(),
	content: text().notNull(),
	type: announcementType().default('info').notNull(),
	priority: integer().default(0).notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	isDismissible: boolean("is_dismissible").default(true).notNull(),
	targetAudience: text("target_audience"),
	startDate: timestamp("start_date", { mode: 'string' }),
	endDate: timestamp("end_date", { mode: 'string' }),
	createdBy: text("created_by").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: "announcements_created_by_fkey"
		}),
]);

export const announcementInteractions = pgTable("announcement_interactions", {
	id: text().primaryKey().notNull(),
	announcementId: text("announcement_id").notNull(),
	userId: text("user_id").notNull(),
	viewed: boolean().default(false).notNull(),
	dismissed: boolean().default(false).notNull(),
	viewedAt: timestamp("viewed_at", { mode: 'string' }),
	dismissedAt: timestamp("dismissed_at", { mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.announcementId],
			foreignColumns: [announcements.id],
			name: "announcement_interactions_announcement_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "announcement_interactions_user_id_fkey"
		}).onDelete("cascade"),
]);

export const notifications = pgTable("notifications", {
	id: text().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	title: text().notNull(),
	message: text().notNull(),
	type: notificationType().default('system').notNull(),
	data: text(),
	read: boolean().default(false).notNull(),
	readAt: timestamp("read_at", { mode: 'string' }),
	actionUrl: text("action_url"),
	expiresAt: timestamp("expires_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	index("idx_notifications_read").using("btree", table.read.asc().nullsLast().op("bool_ops")),
	index("idx_notifications_user_id").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "notifications_user_id_fkey"
		}).onDelete("cascade"),
]);

export const notificationPreferences = pgTable("notification_preferences", {
	id: text().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	notificationType: notificationType("notification_type").notNull(),
	channel: notificationChannel().notNull(),
	enabled: boolean().default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "notification_preferences_user_id_fkey"
		}).onDelete("cascade"),
]);

export const emailSubscriptions = pgTable("email_subscriptions", {
	id: text().primaryKey().notNull(),
	email: text().notNull(),
	userId: text("user_id"),
	subscriptionTypes: text("subscription_types"),
	isActive: boolean("is_active").default(true).notNull(),
	unsubscribeToken: text("unsubscribe_token").notNull(),
	subscribedAt: timestamp("subscribed_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	unsubscribedAt: timestamp("unsubscribed_at", { mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "email_subscriptions_user_id_fkey"
		}),
	unique("email_subscriptions_email_key").on(table.email),
	unique("email_subscriptions_unsubscribe_token_key").on(table.unsubscribeToken),
]);

export const performanceMetrics = pgTable("performance_metrics", {
	id: text().primaryKey().notNull(),
	metricName: text("metric_name").notNull(),
	value: real().notNull(),
	unit: text().notNull(),
	endpoint: text(),
	userId: text("user_id"),
	sessionId: text("session_id"),
	userAgent: text("user_agent"),
	ipAddress: text("ip_address"),
	metadata: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	index("idx_performance_metrics_created_at").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "performance_metrics_user_id_fkey"
		}),
]);

export const analyticsEvents = pgTable("analytics_events", {
	id: text().primaryKey().notNull(),
	eventType: text("event_type").notNull(),
	eventName: text("event_name"),
	userId: text("user_id"),
	sessionId: text("session_id").notNull(),
	page: text(),
	referrer: text(),
	userAgent: text("user_agent"),
	ipAddress: text("ip_address"),
	country: text(),
	city: text(),
	device: text(),
	browser: text(),
	os: text(),
	properties: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	index("idx_analytics_events_created_at").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("idx_analytics_events_user_id").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "analytics_events_user_id_fkey"
		}),
]);

export const resourceUsage = pgTable("resource_usage", {
	id: text().primaryKey().notNull(),
	type: resourceUsageType().notNull(),
	value: real().notNull(),
	maxValue: real("max_value"),
	unit: text().notNull(),
	hostname: text(),
	service: text(),
	metadata: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const apiUsage = pgTable("api_usage", {
	id: text().primaryKey().notNull(),
	endpoint: text().notNull(),
	method: text().notNull(),
	statusCode: integer("status_code").notNull(),
	responseTime: integer("response_time").notNull(),
	requestSize: integer("request_size"),
	responseSize: integer("response_size"),
	userId: text("user_id"),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	apiKey: text("api_key"),
	errorMessage: text("error_message"),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	index("idx_api_usage_created_at").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("idx_api_usage_endpoint").using("btree", table.endpoint.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "api_usage_user_id_fkey"
		}),
]);

export const queryPerformance = pgTable("query_performance", {
	id: text().primaryKey().notNull(),
	queryType: text("query_type").notNull(),
	tableName: text("table_name").notNull(),
	executionTime: real("execution_time").notNull(),
	rowsAffected: integer("rows_affected"),
	queryHash: text("query_hash"),
	endpoint: text(),
	userId: text("user_id"),
	slow: boolean().default(false).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "query_performance_user_id_fkey"
		}),
]);

export const errorTracking = pgTable("error_tracking", {
	id: text().primaryKey().notNull(),
	errorType: text("error_type").notNull(),
	errorName: text("error_name").notNull(),
	message: text().notNull(),
	stack: text(),
	filename: text(),
	lineNumber: integer("line_number"),
	columnNumber: integer("column_number"),
	userId: text("user_id"),
	sessionId: text("session_id"),
	url: text(),
	userAgent: text("user_agent"),
	ipAddress: text("ip_address"),
	breadcrumbs: text(),
	tags: text(),
	fingerprint: text(),
	count: integer().default(1).notNull(),
	firstSeen: timestamp("first_seen", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	lastSeen: timestamp("last_seen", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	resolved: boolean().default(false).notNull(),
	resolvedBy: text("resolved_by"),
	resolvedAt: timestamp("resolved_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	index("idx_error_tracking_fingerprint").using("btree", table.fingerprint.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.resolvedBy],
			foreignColumns: [users.id],
			name: "error_tracking_resolved_by_fkey"
		}),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "error_tracking_user_id_fkey"
		}),
]);

export const customMetrics = pgTable("custom_metrics", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	description: text(),
	value: real().notNull(),
	unit: text(),
	category: text(),
	dimensions: text(),
	createdBy: text("created_by"),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: "custom_metrics_created_by_fkey"
		}),
]);

export const alerts = pgTable("alerts", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	description: text(),
	type: alertType().notNull(),
	severity: alertSeverity().default('warning').notNull(),
	conditions: text().notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	notificationChannels: text("notification_channels"),
	createdBy: text("created_by").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: "alerts_created_by_fkey"
		}),
]);

export const alertInstances = pgTable("alert_instances", {
	id: text().primaryKey().notNull(),
	alertId: text("alert_id").notNull(),
	triggeredValue: real("triggered_value"),
	message: text().notNull(),
	metadata: text(),
	resolved: boolean().default(false).notNull(),
	resolvedBy: text("resolved_by"),
	resolvedAt: timestamp("resolved_at", { mode: 'string' }),
	notificationsSent: text("notifications_sent"),
	triggeredAt: timestamp("triggered_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.alertId],
			foreignColumns: [alerts.id],
			name: "alert_instances_alert_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.resolvedBy],
			foreignColumns: [users.id],
			name: "alert_instances_resolved_by_fkey"
		}),
]);

export const userActivity = pgTable("user_activity", {
	id: text().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	action: text().notNull(),
	resource: text(),
	details: text(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	sessionId: text("session_id"),
	duration: integer(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	index("idx_user_activity_created_at").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("idx_user_activity_user_id").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_activity_user_id_fkey"
		}).onDelete("cascade"),
]);

export const databaseBackups = pgTable("database_backups", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	type: backupType().default('full').notNull(),
	status: backupStatus().default('pending').notNull(),
	filePath: text("file_path"),
	fileSize: integer("file_size"),
	compressionType: text("compression_type"),
	checksum: text(),
	tables: text(),
	excludedTables: text("excluded_tables"),
	startedAt: timestamp("started_at", { mode: 'string' }),
	completedAt: timestamp("completed_at", { mode: 'string' }),
	duration: integer(),
	errorMessage: text("error_message"),
	metadata: text(),
	isAutomatic: boolean("is_automatic").default(false).notNull(),
	retentionDays: integer("retention_days").default(30),
	createdBy: text("created_by").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	index("idx_database_backups_created_at").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: "database_backups_created_by_fkey"
		}),
]);

export const databaseRestores = pgTable("database_restores", {
	id: text().primaryKey().notNull(),
	backupId: text("backup_id").notNull(),
	status: restoreStatus().default('pending').notNull(),
	targetDatabase: text("target_database"),
	restorePoint: timestamp("restore_point", { mode: 'string' }),
	tables: text(),
	dataOnly: boolean("data_only").default(false).notNull(),
	schemaOnly: boolean("schema_only").default(false).notNull(),
	startedAt: timestamp("started_at", { mode: 'string' }),
	completedAt: timestamp("completed_at", { mode: 'string' }),
	duration: integer(),
	errorMessage: text("error_message"),
	metadata: text(),
	createdBy: text("created_by").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.backupId],
			foreignColumns: [databaseBackups.id],
			name: "database_restores_backup_id_fkey"
		}),
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: "database_restores_created_by_fkey"
		}),
]);

export const dataMigrations = pgTable("data_migrations", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	description: text(),
	version: text().notNull(),
	status: migrationStatus().default('pending').notNull(),
	migrationScript: text("migration_script"),
	rollbackScript: text("rollback_script"),
	checksum: text(),
	dependencies: text(),
	affectedTables: text("affected_tables"),
	startedAt: timestamp("started_at", { mode: 'string' }),
	completedAt: timestamp("completed_at", { mode: 'string' }),
	duration: integer(),
	errorMessage: text("error_message"),
	rollbackReason: text("rollback_reason"),
	metadata: text(),
	createdBy: text("created_by").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: "data_migrations_created_by_fkey"
		}),
]);

export const dataExports = pgTable("data_exports", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	description: text(),
	format: exportFormat().default('csv').notNull(),
	status: exportStatus().default('pending').notNull(),
	query: text(),
	tables: text(),
	filters: text(),
	filePath: text("file_path"),
	fileSize: integer("file_size"),
	recordCount: integer("record_count"),
	startedAt: timestamp("started_at", { mode: 'string' }),
	completedAt: timestamp("completed_at", { mode: 'string' }),
	duration: integer(),
	errorMessage: text("error_message"),
	downloadUrl: text("download_url"),
	expiresAt: timestamp("expires_at", { mode: 'string' }),
	metadata: text(),
	createdBy: text("created_by").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	index("idx_data_exports_created_at").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: "data_exports_created_by_fkey"
		}),
]);

export const dataImports = pgTable("data_imports", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	description: text(),
	format: exportFormat().default('csv').notNull(),
	status: importStatus().default('pending').notNull(),
	filePath: text("file_path").notNull(),
	fileSize: integer("file_size"),
	targetTable: text("target_table").notNull(),
	mapping: text(),
	validationRules: text("validation_rules"),
	duplicateHandling: text("duplicate_handling").default('skip').notNull(),
	totalRecords: integer("total_records"),
	processedRecords: integer("processed_records").default(0).notNull(),
	successfulRecords: integer("successful_records").default(0).notNull(),
	failedRecords: integer("failed_records").default(0).notNull(),
	validationErrors: text("validation_errors"),
	startedAt: timestamp("started_at", { mode: 'string' }),
	completedAt: timestamp("completed_at", { mode: 'string' }),
	duration: integer(),
	errorMessage: text("error_message"),
	metadata: text(),
	createdBy: text("created_by").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: "data_imports_created_by_fkey"
		}),
]);

export const dataSynchronization = pgTable("data_synchronization", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	description: text(),
	sourceType: text("source_type").notNull(),
	sourceConfig: text("source_config").notNull(),
	targetType: text("target_type").notNull(),
	targetConfig: text("target_config").notNull(),
	direction: syncDirection().default('pull').notNull(),
	status: syncStatus().default('pending').notNull(),
	schedule: text(),
	mapping: text(),
	filters: text(),
	lastSyncAt: timestamp("last_sync_at", { mode: 'string' }),
	nextSyncAt: timestamp("next_sync_at", { mode: 'string' }),
	syncedRecords: integer("synced_records").default(0).notNull(),
	errorCount: integer("error_count").default(0).notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	metadata: text(),
	createdBy: text("created_by").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: "data_synchronization_created_by_fkey"
		}),
]);

export const dataQualityChecks = pgTable("data_quality_checks", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	description: text(),
	type: qualityCheckType().notNull(),
	tableName: text("table_name").notNull(),
	columnName: text("column_name"),
	rules: text().notNull(),
	threshold: integer(),
	isActive: boolean("is_active").default(true).notNull(),
	schedule: text(),
	lastRunAt: timestamp("last_run_at", { mode: 'string' }),
	nextRunAt: timestamp("next_run_at", { mode: 'string' }),
	createdBy: text("created_by").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: "data_quality_checks_created_by_fkey"
		}),
]);

export const dataQualityCheckResults = pgTable("data_quality_check_results", {
	id: text().primaryKey().notNull(),
	checkId: text("check_id").notNull(),
	totalRecords: integer("total_records").notNull(),
	passedRecords: integer("passed_records").notNull(),
	failedRecords: integer("failed_records").notNull(),
	successRate: integer("success_rate").notNull(),
	details: text(),
	issues: text(),
	runAt: timestamp("run_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.checkId],
			foreignColumns: [dataQualityChecks.id],
			name: "data_quality_check_results_check_id_fkey"
		}).onDelete("cascade"),
]);

export const rate = pgTable("rate", {
	userId: text("user_id").notNull(),
	commentId: text("comment_id").notNull(),
	like: boolean().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.commentId],
			foreignColumns: [comment.id],
			name: "rate_comment_id_comment_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "rate_user_id_user_id_fk"
		}),
	primaryKey({ columns: [table.userId, table.commentId], name: "rate_user_id_comment_id_pk"}),
]);
