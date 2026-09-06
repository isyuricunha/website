import { getTableConfig, type PgTable } from 'drizzle-orm/pg-core'
import { describe, expect, it } from 'vitest'

import {
  aiChatFeedback,
  analyticsEvents,
  apiUsage,
  comments,
  emailCampaignRecipients,
  emailSubscriptions,
  errorLogs,
  errorTracking,
  guestbook,
  notificationPreferences,
  notifications,
  performanceMetrics,
  queryPerformance,
  rates,
  securityEvents
} from '../schema'

const cascadeRelations: Array<{ table: PgTable; foreignKeyName: string }> = [
  { table: comments, foreignKeyName: 'comment_user_id_user_id_fk' },
  { table: rates, foreignKeyName: 'rate_user_id_user_id_fk' },
  { table: guestbook, foreignKeyName: 'guestbook_user_id_user_id_fk' },
  { table: aiChatFeedback, foreignKeyName: 'ai_chat_feedback_user_id_fkey' },
  {
    table: emailCampaignRecipients,
    foreignKeyName: 'email_campaign_recipients_user_id_fkey'
  },
  { table: emailSubscriptions, foreignKeyName: 'email_subscriptions_user_id_fkey' },
  {
    table: notificationPreferences,
    foreignKeyName: 'notification_preferences_user_id_fkey'
  },
  { table: notifications, foreignKeyName: 'notifications_user_id_fkey' },
  { table: performanceMetrics, foreignKeyName: 'performance_metrics_user_id_fkey' },
  { table: analyticsEvents, foreignKeyName: 'analytics_events_user_id_fkey' },
  { table: apiUsage, foreignKeyName: 'api_usage_user_id_fkey' },
  { table: queryPerformance, foreignKeyName: 'query_performance_user_id_fkey' },
  { table: errorTracking, foreignKeyName: 'error_tracking_user_id_fkey' },
  { table: errorLogs, foreignKeyName: 'error_logs_user_id_fkey' },
  { table: securityEvents, foreignKeyName: 'security_events_user_id_fkey' }
]

describe('self-service account deletion schema', () => {
  it.each(cascadeRelations)(
    '$foreignKeyName removes user-owned rows atomically',
    ({ table, foreignKeyName }) => {
      const foreignKey = getTableConfig(table).foreignKeys.find(
        (candidate) => candidate.getName() === foreignKeyName
      )

      expect(foreignKey, `${foreignKeyName} must exist`).toBeDefined()
      expect(foreignKey?.onDelete).toBe('cascade')
    }
  )
})
