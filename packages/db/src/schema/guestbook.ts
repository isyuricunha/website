import { relations, sql } from 'drizzle-orm'
import { foreignKey, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

import { users } from './auth'

export const guestbook = pgTable(
  'guestbook',
  {
    id: text('id').primaryKey(),
    body: text('body').notNull(),
    userId: text('user_id').notNull(),
    createdAt: timestamp('created_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP(3)`),
    updatedAt: timestamp('updated_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP(3)`)
  },
  (guestbookRow) => [
    foreignKey({
      columns: [guestbookRow.userId],
      foreignColumns: [users.id],
      name: 'guestbook_user_id_user_id_fk'
    })
  ]
)

export const guestbookRelations = relations(guestbook, ({ one }) => ({
  user: one(users, {
    fields: [guestbook.userId],
    references: [users.id]
  })
}))
