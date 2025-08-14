import { adminRouter } from './routers/admin'
import { announcementsRouter } from './routers/announcements'
import { bulkRouter } from './routers/bulk'
import { commentsRouter } from './routers/comments'
import { communicationRouter } from './routers/communication'
import { contentRouter } from './routers/content'
import { dataManagementRouter } from './routers/data-management'
import { emailManagementRouter } from './routers/email-management'
import { resendEmailRouter } from './routers/resend-email'
import { githubRouter } from './routers/github'
import { guestbookRouter } from './routers/guestbook'
import { likesRouter } from './routers/likes'
import { monitoringRouter } from './routers/monitoring'
import { ratesRouter } from './routers/rates'
import { securityRouter } from './routers/security'
import { spotifyRouter } from './routers/spotify'
import { systemRouter } from './routers/system'
import { usersRouter } from './routers/users'
import { viewsRouter } from './routers/views'
import { wakatimeRouter } from './routers/wakatime'
import { createTRPCRouter } from './trpc'

export const appRouter = createTRPCRouter({
  admin: adminRouter,
  announcements: announcementsRouter,
  bulk: bulkRouter,
  communication: communicationRouter,
  content: contentRouter,
  dataManagement: dataManagementRouter,
  emailManagement: emailManagementRouter,
  resendEmail: resendEmailRouter,
  monitoring: monitoringRouter,
  security: securityRouter,
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
