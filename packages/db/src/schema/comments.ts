import { relations, sql } from 'drizzle-orm'
import { boolean, foreignKey, pgTable, primaryKey, text, timestamp } from 'drizzle-orm/pg-core'

import { users } from './auth'
import { posts } from './posts'

export const comments = pgTable(
  'comment',
  {
    id: text('id').primaryKey(),
    body: text('body').notNull(),
    userId: text('user_id').notNull(),
    createdAt: timestamp('created_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP(3)`),
    updatedAt: timestamp('updated_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP(3)`),
    postId: text('post_id').notNull(),
    parentId: text('parent_id'),
    isDeleted: boolean('is_deleted').notNull().default(false)
  },
  (comment) => [
    foreignKey({
      columns: [comment.postId],
      foreignColumns: [posts.slug],
      name: 'comment_post_id_post_slug_fk'
    }).onDelete('cascade'),
    foreignKey({
      columns: [comment.userId],
      foreignColumns: [users.id],
      name: 'comment_user_id_user_id_fk'
    })
  ]
)

export const rates = pgTable(
  'rate',
  {
    userId: text('user_id').notNull(),
    commentId: text('comment_id').notNull(),
    like: boolean('like').notNull()
  },
  (rate) => [
    foreignKey({
      columns: [rate.commentId],
      foreignColumns: [comments.id],
      name: 'rate_comment_id_comment_id_fk'
    }).onDelete('cascade'),
    foreignKey({
      columns: [rate.userId],
      foreignColumns: [users.id],
      name: 'rate_user_id_user_id_fk'
    }),
    primaryKey({ columns: [rate.userId, rate.commentId], name: 'rate_user_id_comment_id_pk' })
  ]
)

export const commentsRelations = relations(comments, ({ one, many }) => ({
  user: one(users, {
    fields: [comments.userId],
    references: [users.id]
  }),
  post: one(posts, {
    fields: [comments.postId],
    references: [posts.slug]
  }),
  parent: one(comments, {
    fields: [comments.parentId],
    references: [comments.id],
    relationName: 'comment_replies'
  }),
  replies: many(comments, {
    relationName: 'comment_replies'
  }),
  rates: many(rates)
}))

export const ratesRelations = relations(rates, ({ one }) => ({
  user: one(users, {
    fields: [rates.userId],
    references: [users.id]
  }),
  comment: one(comments, {
    fields: [rates.commentId],
    references: [comments.id]
  })
}))
