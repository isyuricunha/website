import { nanoid } from 'nanoid'

import { db } from './db'
import { posts } from './schema'

const main = async () => {
  try {
    console.log('🌱 Seeding database...')

    // Example seed data - customize as needed
    const examplePost = {
      id: nanoid(),
      slug: 'example-post',
      title: 'Example Post',
      description: 'This is an example post',
      content: 'Example content',
      authorId: 'example-user-id', // Replace with actual user ID
      status: 'draft' as const,
      views: 0
    }

    await db.insert(posts).values(examplePost)

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
