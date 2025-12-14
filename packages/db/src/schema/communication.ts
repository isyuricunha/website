import { relations, sql } from 'drizzle-orm'
import { boolean, foreignKey, index, integer, pgEnum, pgTable, text, timestamp, unique } from 'drizzle-orm/pg-core'

import { users } from './auth'

// Email Templates
export const emailTemplateTypeEnum = pgEnum('email_template_type', [
  'welcome',
  'password_reset',
  'email_verification',
  'newsletter',
  'announcement',
  'notification',
  'marketing',
  'transactional'
])

export const emailTemplates = pgTable(
  'email_templates',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    type: emailTemplateTypeEnum('type').notNull(),
    subject: text('subject').notNull(),
    htmlContent: text('html_content').notNull(),
    textContent: text('text_content'),
    variables: text('variables'), // JSON array of template variables
    isActive: boolean('is_active').notNull().default(true),
    createdBy: text('created_by').notNull(),
    createdAt: timestamp('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: timestamp('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`)
  },
  (emailTemplate) => [
    foreignKey({
      columns: [emailTemplate.createdBy],
      foreignColumns: [users.id],
      name: 'email_templates_created_by_fkey'
    })
  ]
)

// Bulk Email Campaigns
export const emailCampaignStatusEnum = pgEnum('email_campaign_status', [
  'draft',
  'scheduled',
  'sending',
  'sent',
  'paused',
  'cancelled',
  'failed'
])

export const emailCampaigns = pgTable(
  'email_campaigns',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    subject: text('subject').notNull(),
    templateId: text('template_id'),
    htmlContent: text('html_content'),
    textContent: text('text_content'),
    status: emailCampaignStatusEnum('status').notNull().default('draft'),
    targetAudience: text('target_audience'), // JSON criteria for recipient selection
    totalRecipients: integer('total_recipients').notNull().default(0),
    sentCount: integer('sent_count').notNull().default(0),
    deliveredCount: integer('delivered_count').notNull().default(0),
    openedCount: integer('opened_count').notNull().default(0),
    clickedCount: integer('clicked_count').notNull().default(0),
    bouncedCount: integer('bounced_count').notNull().default(0),
    unsubscribedCount: integer('unsubscribed_count').notNull().default(0),
    scheduledAt: timestamp('scheduled_at'),
    startedAt: timestamp('started_at'),
    completedAt: timestamp('completed_at'),
    createdBy: text('created_by').notNull(),
    createdAt: timestamp('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: timestamp('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`)
  },
  (emailCampaign) => [
    index('idx_email_campaigns_status').using(
      'btree',
      emailCampaign.status.asc().nullsLast().op('enum_ops')
    ),
    foreignKey({
      columns: [emailCampaign.createdBy],
      foreignColumns: [users.id],
      name: 'email_campaigns_created_by_fkey'
    }),
    foreignKey({
      columns: [emailCampaign.templateId],
      foreignColumns: [emailTemplates.id],
      name: 'email_campaigns_template_id_fkey'
    })
  ]
)

// Email Campaign Recipients
export const emailCampaignRecipients = pgTable(
  'email_campaign_recipients',
  {
    id: text('id').primaryKey(),
    campaignId: text('campaign_id').notNull(),
    userId: text('user_id'),
    email: text('email').notNull(),
    status: text('status').notNull().default('pending'), // 'pending', 'sent', 'delivered', 'bounced', 'failed'
    sentAt: timestamp('sent_at'),
    deliveredAt: timestamp('delivered_at'),
    openedAt: timestamp('opened_at'),
    clickedAt: timestamp('clicked_at'),
    unsubscribedAt: timestamp('unsubscribed_at'),
    errorMessage: text('error_message')
  },
  (emailCampaignRecipient) => [
    foreignKey({
      columns: [emailCampaignRecipient.campaignId],
      foreignColumns: [emailCampaigns.id],
      name: 'email_campaign_recipients_campaign_id_fkey'
    }).onDelete('cascade'),
    foreignKey({
      columns: [emailCampaignRecipient.userId],
      foreignColumns: [users.id],
      name: 'email_campaign_recipients_user_id_fkey'
    })
  ]
)

// Site Announcements
export const announcementTypeEnum = pgEnum('announcement_type', [
  'info',
  'warning',
  'success',
  'error',
  'maintenance',
  'feature',
  'update'
])

export const announcements = pgTable(
  'announcements',
  {
    id: text('id').primaryKey(),
    title: text('title').notNull(),
    content: text('content').notNull(),
    type: announcementTypeEnum('type').notNull().default('info'),
    priority: integer('priority').notNull().default(0), // Higher numbers = higher priority
    isActive: boolean('is_active').notNull().default(true),
    isDismissible: boolean('is_dismissible').notNull().default(true),
    targetAudience: text('target_audience'), // JSON criteria for who sees it
    startDate: timestamp('start_date'),
    endDate: timestamp('end_date'),
    createdBy: text('created_by').notNull(),
    createdAt: timestamp('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: timestamp('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`)
  },
  (announcement) => [
    foreignKey({
      columns: [announcement.createdBy],
      foreignColumns: [users.id],
      name: 'announcements_created_by_fkey'
    })
  ]
)

// Announcement Views/Dismissals
export const announcementInteractions = pgTable(
  'announcement_interactions',
  {
    id: text('id').primaryKey(),
    announcementId: text('announcement_id').notNull(),
    userId: text('user_id').notNull(),
    viewed: boolean('viewed').notNull().default(false),
    dismissed: boolean('dismissed').notNull().default(false),
    viewedAt: timestamp('viewed_at'),
    dismissedAt: timestamp('dismissed_at')
  },
  (announcementInteraction) => [
    foreignKey({
      columns: [announcementInteraction.announcementId],
      foreignColumns: [announcements.id],
      name: 'announcement_interactions_announcement_id_fkey'
    }).onDelete('cascade'),
    foreignKey({
      columns: [announcementInteraction.userId],
      foreignColumns: [users.id],
      name: 'announcement_interactions_user_id_fkey'
    }).onDelete('cascade')
  ]
)

// Push Notifications
export const notificationTypeEnum = pgEnum('notification_type', [
  'system',
  'user_action',
  'content',
  'security',
  'marketing',
  'reminder'
])

export const notifications = pgTable(
  'notifications',
  {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull(),
    title: text('title').notNull(),
    message: text('message').notNull(),
    type: notificationTypeEnum('type').notNull().default('system'),
    data: text('data'), // JSON data for the notification
    read: boolean('read').notNull().default(false),
    readAt: timestamp('read_at'),
    actionUrl: text('action_url'), // URL to navigate to when clicked
    expiresAt: timestamp('expires_at'),
    createdAt: timestamp('created_at').notNull().default(sql`CURRENT_TIMESTAMP`)
  },
  (notification) => [
    index('idx_notifications_read').using('btree', notification.read.asc().nullsLast().op('bool_ops')),
    index('idx_notifications_user_id').using(
      'btree',
      notification.userId.asc().nullsLast().op('text_ops')
    ),
    foreignKey({
      columns: [notification.userId],
      foreignColumns: [users.id],
      name: 'notifications_user_id_fkey'
    }).onDelete('cascade')
  ]
)

// Notification Preferences
export const notificationChannelEnum = pgEnum('notification_channel', [
  'email',
  'push',
  'sms',
  'in_app'
])

export const notificationPreferences = pgTable(
  'notification_preferences',
  {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull(),
    notificationType: notificationTypeEnum('notification_type').notNull(),
    channel: notificationChannelEnum('channel').notNull(),
    enabled: boolean('enabled').notNull().default(true),
    createdAt: timestamp('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: timestamp('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`)
  },
  (notificationPreference) => [
    foreignKey({
      columns: [notificationPreference.userId],
      foreignColumns: [users.id],
      name: 'notification_preferences_user_id_fkey'
    }).onDelete('cascade')
  ]
)

// Email Subscriptions
export const emailSubscriptions = pgTable(
  'email_subscriptions',
  {
    id: text('id').primaryKey(),
    email: text('email').notNull(),
    userId: text('user_id'),
    subscriptionTypes: text('subscription_types'), // JSON array of subscription types
    isActive: boolean('is_active').notNull().default(true),
    unsubscribeToken: text('unsubscribe_token').notNull(),
    subscribedAt: timestamp('subscribed_at').notNull().default(sql`CURRENT_TIMESTAMP`),
    unsubscribedAt: timestamp('unsubscribed_at')
  },
  (emailSubscription) => [
    foreignKey({
      columns: [emailSubscription.userId],
      foreignColumns: [users.id],
      name: 'email_subscriptions_user_id_fkey'
    }),
    unique('email_subscriptions_email_key').on(emailSubscription.email),
    unique('email_subscriptions_unsubscribe_token_key').on(emailSubscription.unsubscribeToken)
  ]
)

// Relations
export const emailTemplatesRelations = relations(emailTemplates, ({ one }) => ({
  createdByUser: one(users, {
    fields: [emailTemplates.createdBy],
    references: [users.id]
  })
}))

export const emailCampaignsRelations = relations(emailCampaigns, ({ one, many }) => ({
  template: one(emailTemplates, {
    fields: [emailCampaigns.templateId],
    references: [emailTemplates.id]
  }),
  createdByUser: one(users, {
    fields: [emailCampaigns.createdBy],
    references: [users.id]
  }),
  recipients: many(emailCampaignRecipients)
}))

export const emailCampaignRecipientsRelations = relations(emailCampaignRecipients, ({ one }) => ({
  campaign: one(emailCampaigns, {
    fields: [emailCampaignRecipients.campaignId],
    references: [emailCampaigns.id]
  }),
  user: one(users, {
    fields: [emailCampaignRecipients.userId],
    references: [users.id]
  })
}))

export const announcementsRelations = relations(announcements, ({ one, many }) => ({
  createdByUser: one(users, {
    fields: [announcements.createdBy],
    references: [users.id]
  }),
  interactions: many(announcementInteractions)
}))

export const announcementInteractionsRelations = relations(announcementInteractions, ({ one }) => ({
  announcement: one(announcements, {
    fields: [announcementInteractions.announcementId],
    references: [announcements.id]
  }),
  user: one(users, {
    fields: [announcementInteractions.userId],
    references: [users.id]
  })
}))

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id]
  })
}))

export const notificationPreferencesRelations = relations(notificationPreferences, ({ one }) => ({
  user: one(users, {
    fields: [notificationPreferences.userId],
    references: [users.id]
  })
}))

export const emailSubscriptionsRelations = relations(emailSubscriptions, ({ one }) => ({
  user: one(users, {
    fields: [emailSubscriptions.userId],
    references: [users.id]
  })
}))
