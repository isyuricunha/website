import { relations, sql } from 'drizzle-orm'
import { boolean, foreignKey, index, integer, pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

import { users } from './auth'
import { comments } from './comments'

export const postStatusEnum = pgEnum('post_status', ['draft', 'published', 'archived'])

export const posts = pgTable(
  'post',
  {
    id: text('id').primaryKey(),
    slug: text('slug').notNull().unique('unique_post_slug'),
    title: text('title'), // Relaxed from .notNull() to match DB data
    description: text('description'),
    content: text('content'),
    excerpt: text('excerpt'),
    coverImage: text('cover_image'),
    tags: text('tags'), // JSON array of tags
    status: postStatusEnum('status').default('draft'), // Relaxed
    featured: boolean('featured').default(false), // Relaxed
    authorId: text('author_id'),
    publishedAt: timestamp('published_at'),
    createdAt: timestamp('created_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP(3)`),
    updatedAt: timestamp('updated_at')
      //.notNull() // Relaxed
      .default(sql`CURRENT_TIMESTAMP`),
    likes: integer('likes').notNull().default(0),
    views: integer('views').notNull().default(0)
  },
  (post) => [
    index('idx_post_author_id').using('btree', post.authorId.asc().nullsLast().op('text_ops')),
    index('idx_post_published_at').using('btree', post.publishedAt.asc().nullsLast().op('timestamp_ops')),
    index('idx_post_status').using('btree', post.status.asc().nullsLast().op('enum_ops')),
    foreignKey({
      columns: [post.authorId],
      foreignColumns: [users.id],
      name: 'fk_post_author'
    }).onDelete('cascade')
  ]
)

export const postsRelations = relations(posts, ({ one, many }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id]
  }),
  comments: many(comments)
}))
