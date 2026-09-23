import { nanoid } from 'nanoid'

import { db } from './db'
import { posts, users } from './schema'

const main = async () => {
  try {
    console.log('🌱 Seeding database...')

    const now = new Date()
    const authorId = 'example-user-id'

    // The example post references an author through fk_post_author: the
    // previous seed inserted the post with a non-existent authorId and failed
    // the FK check on a fresh database. Create the example user first and make
    // both inserts conflict-safe so re-running the seed does not error on the
    // unique constraints (users.email / posts.slug).
    await db
      .insert(users)
      .values({
        id: authorId,
        username: 'example',
        name: 'Example User',
        email: 'example@yuricunha.com',
        emailVerified: true,
        createdAt: now,
        updatedAt: now
      })
      .onConflictDoNothing({ target: users.id })

    const examplePost = {
      id: nanoid(),
      slug: 'example-post',
      title: 'Example Post',
      description: 'This is an example post',
      content: 'Example content',
      authorId,
      status: 'draft' as const,
      views: 0
    }

    await db
      .insert(posts)
      .values(examplePost)
      .onConflictDoNothing({ target: posts.slug })

    console.log('🎉 Data inserted successfully!')

    // eslint-disable-next-line unicorn/no-process-exit -- required here
    process.exit(0)
  } catch (error) {
    console.error('❌ Error inserting data:\n', error)
    // eslint-disable-next-line unicorn/no-process-exit -- required here
    process.exit(1)
  }
}

main()