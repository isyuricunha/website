import { sql } from 'drizzle-orm'
import { foreignKey, index, pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

import { users } from './auth'

export const aiChatFeedbackRatingEnum = pgEnum('ai_chat_feedback_rating', ['like', 'dislike'])

export const aiChatFeedback = pgTable(
  'ai_chat_feedback',
  {
    id: text('id').primaryKey(),
    requestId: text('request_id').notNull(),
    messageId: text('message_id').notNull(),
    rating: aiChatFeedbackRatingEnum('rating').notNull(),
    comment: text('comment'),
    pagePath: text('page_path'),
    provider: text('provider'),
    model: text('model'),
    locale: text('locale'),
    userId: text('user_id'),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    createdAt: timestamp('created_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP(3)`)
  },
  (aiChatFeedbackRow) => [
    index('idx_ai_chat_feedback_request_id').using(
      'btree',
      aiChatFeedbackRow.requestId.asc().nullsLast().op('text_ops')
    ),
    index('idx_ai_chat_feedback_message_id').using(
      'btree',
      aiChatFeedbackRow.messageId.asc().nullsLast().op('text_ops')
    ),
    index('idx_ai_chat_feedback_created_at').using(
      'btree',
      aiChatFeedbackRow.createdAt.asc().nullsLast().op('timestamp_ops')
    ),
    index('idx_ai_chat_feedback_user_id').using(
      'btree',
      aiChatFeedbackRow.userId.asc().nullsLast().op('text_ops')
    ),
    foreignKey({
      columns: [aiChatFeedbackRow.userId],
      foreignColumns: [users.id],
      name: 'ai_chat_feedback_user_id_fkey'
    })
  ]
)
