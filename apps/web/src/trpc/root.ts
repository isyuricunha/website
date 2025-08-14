import { adminRouter } from './routers/admin'
import { bulkRouter } from './routers/bulk'
import { commentsRouter } from './routers/comments'
import { contentRouter } from './routers/content'
import { githubRouter } from './routers/github'
import { guestbookRouter } from './routers/guestbook'
import { likesRouter } from './routers/likes'
import { ratesRouter } from './routers/rates'
import { spotifyRouter } from './routers/spotify'
import { systemRouter } from './routers/system'
import { usersRouter } from './routers/users'
import { viewsRouter } from './routers/views'
import { wakatimeRouter } from './routers/wakatime'
import { createTRPCRouter } from './trpc'

export const appRouter = createTRPCRouter({
  admin: adminRouter,
  bulk: bulkRouter,
  content: contentRouter,
  system: systemRouter,
  github: githubRouter,
  wakatime: wakatimeRouter,
  views: viewsRouter,
  likes: likesRouter,
  spotify: spotifyRouter,
  comments: commentsRouter,
  guestbook: guestbookRouter,
  rates: ratesRouter,
  users: usersRouter
})

export type AppRouter = typeof appRouter
