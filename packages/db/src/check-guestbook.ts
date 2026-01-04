import { db } from './db'
import { guestbook, users } from './schema'
import { desc, eq } from 'drizzle-orm'

const main = async () => {
  const results = await db
    .select({
      name: users.name,
      image: users.image,
      comment: guestbook.body,
      createdAt: guestbook.createdAt
    })
    .from(guestbook)
    .innerJoin(users, eq(guestbook.userId, users.id))
    .orderBy(desc(guestbook.createdAt))
    .limit(5)

  console.log('📝 Latest 5 guestbook comments:\n')
  results.forEach((r, i) => {
    console.log(`${i + 1}. ${r.name}`)
    console.log(`   ${r.image}`)
    console.log(`   ${r.comment}`)
    console.log(`   ${r.createdAt.toISOString()}\n`)
  })
}

try {
  await main()
} catch (error) {
  console.error('❌ Error:', error)
  process.exitCode = 1
}
