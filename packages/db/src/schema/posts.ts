import { relations, sql } from 'drizzle-orm'
import { boolean, integer, pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

import { users } from './auth'
import { comments } from './comments'

export const postStatusEnum = pgEnum('post_status', ['draft', 'published', 'archived'])

export const posts = pgTable('post', {
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
  authorId: text('author_id')
    //.notNull() // Relaxed
    .references(() => users.id, { onDelete: 'cascade' }),
  publishedAt: timestamp('published_at'),
  createdAt: timestamp('created_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP(3)`),
  updatedAt: timestamp('updated_at')
    //.notNull() // Relaxed
    .default(sql`CURRENT_TIMESTAMP(3)`),
  likes: integer('likes').notNull().default(0),
  views: integer('views').notNull().default(0)
})

export const postsRelations = relations(posts, ({ one, many }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id]
  }),
  comments: many(comments)
}))
