import { relations } from "drizzle-orm/relations";
import { users, account, session, post, comment, guestbook, passwordResetTokens, auditLogs, errorLogs, siteConfig, bulkOperations, securitySettings, emailTemplates, securityEvents, twoFactorTokens, ipAccessControl, accountLockouts, emailCampaigns, emailCampaignRecipients, announcements, announcementInteractions, notifications, notificationPreferences, emailSubscriptions, performanceMetrics, analyticsEvents, apiUsage, queryPerformance, errorTracking, customMetrics, alerts, alertInstances, userActivity, databaseBackups, databaseRestores, dataMigrations, dataExports, dataImports, dataSynchronization, dataQualityChecks, dataQualityCheckResults, rate } from "./schema";

export const accountRelations = relations(account, ({one}) => ({
	user: one(users, {
		fields: [account.userId],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	accounts: many(account),
	sessions: many(session),
	comments: many(comment),
	guestbooks: many(guestbook),
	passwordResetTokens: many(passwordResetTokens),
	posts: many(post),
	auditLogs: many(auditLogs),
	errorLogs_resolvedBy: many(errorLogs, {
		relationName: "errorLogs_resolvedBy_users_id"
	}),
	errorLogs_userId: many(errorLogs, {
		relationName: "errorLogs_userId_users_id"
	}),
	siteConfigs: many(siteConfig),
	bulkOperations: many(bulkOperations),
	securitySettings: many(securitySettings),
	emailTemplates: many(emailTemplates),
	securityEvents_resolvedBy: many(securityEvents, {
		relationName: "securityEvents_resolvedBy_users_id"
	}),
	securityEvents_userId: many(securityEvents, {
		relationName: "securityEvents_userId_users_id"
	}),
	twoFactorTokens: many(twoFactorTokens),
	ipAccessControls: many(ipAccessControl),
	accountLockouts_lockedBy: many(accountLockouts, {
		relationName: "accountLockouts_lockedBy_users_id"
	}),
	accountLockouts_unlockedBy: many(accountLockouts, {
		relationName: "accountLockouts_unlockedBy_users_id"
	}),
	accountLockouts_userId: many(accountLockouts, {
		relationName: "accountLockouts_userId_users_id"
	}),
	emailCampaigns: many(emailCampaigns),
	emailCampaignRecipients: many(emailCampaignRecipients),
	announcements: many(announcements),
	announcementInteractions: many(announcementInteractions),
	notifications: many(notifications),
	notificationPreferences: many(notificationPreferences),
	emailSubscriptions: many(emailSubscriptions),
	performanceMetrics: many(performanceMetrics),
	analyticsEvents: many(analyticsEvents),
	apiUsages: many(apiUsage),
	queryPerformances: many(queryPerformance),
	errorTrackings_resolvedBy: many(errorTracking, {
		relationName: "errorTracking_resolvedBy_users_id"
	}),
	errorTrackings_userId: many(errorTracking, {
		relationName: "errorTracking_userId_users_id"
	}),
	customMetrics: many(customMetrics),
	alerts: many(alerts),
	alertInstances: many(alertInstances),
	userActivities: many(userActivity),
	databaseBackups: many(databaseBackups),
	databaseRestores: many(databaseRestores),
	dataMigrations: many(dataMigrations),
	dataExports: many(dataExports),
	dataImports: many(dataImports),
	dataSynchronizations: many(dataSynchronization),
	dataQualityChecks: many(dataQualityChecks),
	rates: many(rate),
}));

export const sessionRelations = relations(session, ({one}) => ({
	user: one(users, {
		fields: [session.userId],
		references: [users.id]
	}),
}));

export const commentRelations = relations(comment, ({one, many}) => ({
	post: one(post, {
		fields: [comment.postId],
		references: [post.slug]
	}),
	user: one(users, {
		fields: [comment.userId],
		references: [users.id]
	}),
	rates: many(rate),
}));

export const postRelations = relations(post, ({one, many}) => ({
	comments: many(comment),
	user: one(users, {
		fields: [post.authorId],
		references: [users.id]
	}),
}));

export const guestbookRelations = relations(guestbook, ({one}) => ({
	user: one(users, {
		fields: [guestbook.userId],
		references: [users.id]
	}),
}));

export const passwordResetTokensRelations = relations(passwordResetTokens, ({one}) => ({
	user: one(users, {
		fields: [passwordResetTokens.userId],
		references: [users.id]
	}),
}));

export const auditLogsRelations = relations(auditLogs, ({one}) => ({
	user: one(users, {
		fields: [auditLogs.adminUserId],
		references: [users.id]
	}),
}));

export const errorLogsRelations = relations(errorLogs, ({one}) => ({
	user_resolvedBy: one(users, {
		fields: [errorLogs.resolvedBy],
		references: [users.id],
		relationName: "errorLogs_resolvedBy_users_id"
	}),
	user_userId: one(users, {
		fields: [errorLogs.userId],
		references: [users.id],
		relationName: "errorLogs_userId_users_id"
	}),
}));

export const siteConfigRelations = relations(siteConfig, ({one}) => ({
	user: one(users, {
		fields: [siteConfig.updatedBy],
		references: [users.id]
	}),
}));

export const bulkOperationsRelations = relations(bulkOperations, ({one}) => ({
	user: one(users, {
		fields: [bulkOperations.createdBy],
		references: [users.id]
	}),
}));

export const securitySettingsRelations = relations(securitySettings, ({one}) => ({
	user: one(users, {
		fields: [securitySettings.updatedBy],
		references: [users.id]
	}),
}));

export const emailTemplatesRelations = relations(emailTemplates, ({one, many}) => ({
	user: one(users, {
		fields: [emailTemplates.createdBy],
		references: [users.id]
	}),
	emailCampaigns: many(emailCampaigns),
}));

export const securityEventsRelations = relations(securityEvents, ({one}) => ({
	user_resolvedBy: one(users, {
		fields: [securityEvents.resolvedBy],
		references: [users.id],
		relationName: "securityEvents_resolvedBy_users_id"
	}),
	user_userId: one(users, {
		fields: [securityEvents.userId],
		references: [users.id],
		relationName: "securityEvents_userId_users_id"
	}),
}));

export const twoFactorTokensRelations = relations(twoFactorTokens, ({one}) => ({
	user: one(users, {
		fields: [twoFactorTokens.userId],
		references: [users.id]
	}),
}));

export const ipAccessControlRelations = relations(ipAccessControl, ({one}) => ({
	user: one(users, {
		fields: [ipAccessControl.createdBy],
		references: [users.id]
	}),
}));

export const accountLockoutsRelations = relations(accountLockouts, ({one}) => ({
	user_lockedBy: one(users, {
		fields: [accountLockouts.lockedBy],
		references: [users.id],
		relationName: "accountLockouts_lockedBy_users_id"
	}),
	user_unlockedBy: one(users, {
		fields: [accountLockouts.unlockedBy],
		references: [users.id],
		relationName: "accountLockouts_unlockedBy_users_id"
	}),
	user_userId: one(users, {
		fields: [accountLockouts.userId],
		references: [users.id],
		relationName: "accountLockouts_userId_users_id"
	}),
}));

export const emailCampaignsRelations = relations(emailCampaigns, ({one, many}) => ({
	user: one(users, {
		fields: [emailCampaigns.createdBy],
		references: [users.id]
	}),
	emailTemplate: one(emailTemplates, {
		fields: [emailCampaigns.templateId],
		references: [emailTemplates.id]
	}),
	emailCampaignRecipients: many(emailCampaignRecipients),
}));

export const emailCampaignRecipientsRelations = relations(emailCampaignRecipients, ({one}) => ({
	emailCampaign: one(emailCampaigns, {
		fields: [emailCampaignRecipients.campaignId],
		references: [emailCampaigns.id]
	}),
	user: one(users, {
		fields: [emailCampaignRecipients.userId],
		references: [users.id]
	}),
}));

export const announcementsRelations = relations(announcements, ({one, many}) => ({
	user: one(users, {
		fields: [announcements.createdBy],
		references: [users.id]
	}),
	announcementInteractions: many(announcementInteractions),
}));

export const announcementInteractionsRelations = relations(announcementInteractions, ({one}) => ({
	announcement: one(announcements, {
		fields: [announcementInteractions.announcementId],
		references: [announcements.id]
	}),
	user: one(users, {
		fields: [announcementInteractions.userId],
		references: [users.id]
	}),
}));

export const notificationsRelations = relations(notifications, ({one}) => ({
	user: one(users, {
		fields: [notifications.userId],
		references: [users.id]
	}),
}));

export const notificationPreferencesRelations = relations(notificationPreferences, ({one}) => ({
	user: one(users, {
		fields: [notificationPreferences.userId],
		references: [users.id]
	}),
}));

export const emailSubscriptionsRelations = relations(emailSubscriptions, ({one}) => ({
	user: one(users, {
		fields: [emailSubscriptions.userId],
		references: [users.id]
	}),
}));

export const performanceMetricsRelations = relations(performanceMetrics, ({one}) => ({
	user: one(users, {
		fields: [performanceMetrics.userId],
		references: [users.id]
	}),
}));

export const analyticsEventsRelations = relations(analyticsEvents, ({one}) => ({
	user: one(users, {
		fields: [analyticsEvents.userId],
		references: [users.id]
	}),
}));

export const apiUsageRelations = relations(apiUsage, ({one}) => ({
	user: one(users, {
		fields: [apiUsage.userId],
		references: [users.id]
	}),
}));

export const queryPerformanceRelations = relations(queryPerformance, ({one}) => ({
	user: one(users, {
		fields: [queryPerformance.userId],
		references: [users.id]
	}),
}));

export const errorTrackingRelations = relations(errorTracking, ({one}) => ({
	user_resolvedBy: one(users, {
		fields: [errorTracking.resolvedBy],
		references: [users.id],
		relationName: "errorTracking_resolvedBy_users_id"
	}),
	user_userId: one(users, {
		fields: [errorTracking.userId],
		references: [users.id],
		relationName: "errorTracking_userId_users_id"
	}),
}));

export const customMetricsRelations = relations(customMetrics, ({one}) => ({
	user: one(users, {
		fields: [customMetrics.createdBy],
		references: [users.id]
	}),
}));

export const alertsRelations = relations(alerts, ({one, many}) => ({
	user: one(users, {
		fields: [alerts.createdBy],
		references: [users.id]
	}),
	alertInstances: many(alertInstances),
}));

export const alertInstancesRelations = relations(alertInstances, ({one}) => ({
	alert: one(alerts, {
		fields: [alertInstances.alertId],
		references: [alerts.id]
	}),
	user: one(users, {
		fields: [alertInstances.resolvedBy],
		references: [users.id]
	}),
}));

export const userActivityRelations = relations(userActivity, ({one}) => ({
	user: one(users, {
		fields: [userActivity.userId],
		references: [users.id]
	}),
}));

export const databaseBackupsRelations = relations(databaseBackups, ({one, many}) => ({
	user: one(users, {
		fields: [databaseBackups.createdBy],
		references: [users.id]
	}),
	databaseRestores: many(databaseRestores),
}));

export const databaseRestoresRelations = relations(databaseRestores, ({one}) => ({
	databaseBackup: one(databaseBackups, {
		fields: [databaseRestores.backupId],
		references: [databaseBackups.id]
	}),
	user: one(users, {
		fields: [databaseRestores.createdBy],
		references: [users.id]
	}),
}));

export const dataMigrationsRelations = relations(dataMigrations, ({one}) => ({
	user: one(users, {
		fields: [dataMigrations.createdBy],
		references: [users.id]
	}),
}));

export const dataExportsRelations = relations(dataExports, ({one}) => ({
	user: one(users, {
		fields: [dataExports.createdBy],
		references: [users.id]
	}),
}));

export const dataImportsRelations = relations(dataImports, ({one}) => ({
	user: one(users, {
		fields: [dataImports.createdBy],
		references: [users.id]
	}),
}));

export const dataSynchronizationRelations = relations(dataSynchronization, ({one}) => ({
	user: one(users, {
		fields: [dataSynchronization.createdBy],
		references: [users.id]
	}),
}));

export const dataQualityChecksRelations = relations(dataQualityChecks, ({one, many}) => ({
	user: one(users, {
		fields: [dataQualityChecks.createdBy],
		references: [users.id]
	}),
	dataQualityCheckResults: many(dataQualityCheckResults),
}));

export const dataQualityCheckResultsRelations = relations(dataQualityCheckResults, ({one}) => ({
	dataQualityCheck: one(dataQualityChecks, {
		fields: [dataQualityCheckResults.checkId],
		references: [dataQualityChecks.id]
	}),
}));

export const rateRelations = relations(rate, ({one}) => ({
	comment: one(comment, {
		fields: [rate.commentId],
		references: [comment.id]
	}),
	user: one(users, {
		fields: [rate.userId],
		references: [users.id]
	}),
}));