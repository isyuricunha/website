import { TRPCError } from '@trpc/server'
import { and, desc, eq, ilike, ne, or, posts } from '@isyuricunha/db'
import { randomBytes } from 'crypto'
import { z } from 'zod'

import { AuditLogger, getIpFromHeaders, getUserAgentFromHeaders } from '@/lib/audit-logger'
import { logger } from '@/lib/logger'
import { adminProcedure, createTRPCRouter } from '../trpc'

// Helper function to generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

type PostUpdate = Partial<typeof posts.$inferInsert>

export const contentRouter = createTRPCRouter({
  // Get all posts for admin management
  getPosts: adminProcedure
    .input(
      z.object({
        search: z.string().optional(),
        status: z.enum(['draft', 'published', 'archived']).optional(),
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0)
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const conditions = []

        if (input.search) {
          conditions.push(
            or(
              ilike(posts.title, `%${input.search}%`),
              ilike(posts.description, `%${input.search}%`),
              ilike(posts.content, `%${input.search}%`)
            )
          )
        }

        if (input.status) {
          conditions.push(eq(posts.status, input.status))
        }

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined

        const allPosts = await ctx.db.query.posts.findMany({
          where: whereClause,
          orderBy: desc(posts.updatedAt),
          limit: input.limit,
          offset: input.offset,
          with: {
            author: {
              columns: {
                id: true,
                name: true,
                email: true,
                image: true
              }
            }
          }
        })

        // Get total count for pagination
        const totalPosts = await ctx.db.query.posts.findMany({
          where: whereClause,
          columns: { id: true }
        })

        return {
          posts: allPosts.map((post) => ({
            ...post,
            tags: post.tags ? JSON.parse(post.tags) : []
          })),
          total: totalPosts.length,
          hasMore: totalPosts.length > input.offset + input.limit
        }
      } catch (error) {
        logger.error('Error fetching posts', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch posts'
        })
      }
    }),

  // Get single post for editing
  getPost: adminProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
    try {
      const post = await ctx.db.query.posts.findFirst({
        where: eq(posts.id, input.id),
        with: {
          author: {
            columns: {
              id: true,
              name: true,
              email: true,
              image: true
            }
          }
        }
      })

      if (!post) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Post not found'
        })
      }

      return {
        ...post,
        tags: post.tags ? JSON.parse(post.tags) : []
      }
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error
      }
      logger.error('Error fetching post', error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch post'
      })
    }
  }),

  // Create new post
  createPost: adminProcedure
    .input(
      z.object({
        title: z.string().min(1).max(200),
        description: z.string().optional(),
        content: z.string().optional(),
        excerpt: z.string().optional(),
        coverImage: z.string().optional(),
        tags: z.array(z.string()).default([]),
        status: z.enum(['draft', 'published', 'archived']).default('draft'),
        featured: z.boolean().default(false),
        slug: z.string().optional()
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const auditLogger = new AuditLogger(ctx.db)
        const ipAddress = getIpFromHeaders(ctx.headers)
        const userAgent = getUserAgentFromHeaders(ctx.headers)

        const postId = randomBytes(16).toString('hex')
        const slug = input.slug || generateSlug(input.title)

        // Check if slug already exists
        const existingPost = await ctx.db.query.posts.findFirst({
          where: eq(posts.slug, slug)
        })

        if (existingPost) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'A post with this slug already exists'
          })
        }

        const now = new Date()
        const publishedAt = input.status === 'published' ? now : null

        await ctx.db.insert(posts).values({
          id: postId,
          slug,
          title: input.title,
          description: input.description,
          content: input.content,
          excerpt: input.excerpt,
          coverImage: input.coverImage,
          tags: JSON.stringify(input.tags),
          status: input.status,
          featured: input.featured,
          authorId: ctx.session.user.id,
          publishedAt,
          createdAt: now,
          updatedAt: now
        })

        // Log the audit trail
        await auditLogger.log({
          adminUserId: ctx.session.user.id,
          action: 'user_create', // We can extend this to 'post_create' later
          targetType: 'post',
          targetId: postId,
          details: {
            title: input.title,
            slug,
            status: input.status,
            featured: input.featured
          },
          ipAddress,
          userAgent
        })

        return { success: true, postId, slug }
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error
        }
        logger.error('Error creating post', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create post'
        })
      }
    }),

  // Update existing post
  updatePost: adminProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1).max(200).optional(),
        description: z.string().optional(),
        content: z.string().optional(),
        excerpt: z.string().optional(),
        coverImage: z.string().optional(),
        tags: z.array(z.string()).optional(),
        status: z.enum(['draft', 'published', 'archived']).optional(),
        featured: z.boolean().optional(),
        slug: z.string().optional()
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const auditLogger = new AuditLogger(ctx.db)
        const ipAddress = getIpFromHeaders(ctx.headers)
        const userAgent = getUserAgentFromHeaders(ctx.headers)

        const { id, ...updateData } = input

        // Check if post exists
        const existingPost = await ctx.db.query.posts.findFirst({
          where: eq(posts.id, id)
        })

        if (!existingPost) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Post not found'
          })
        }

        // Check slug uniqueness if slug is being updated
        if (updateData.slug && updateData.slug !== existingPost.slug) {
          const slugExists = await ctx.db.query.posts.findFirst({
            where: and(eq(posts.slug, updateData.slug), ne(posts.id, id))
          })

          if (slugExists) {
            throw new TRPCError({
              code: 'CONFLICT',
              message: 'A post with this slug already exists'
            })
          }
        }

        const filteredUpdateData: PostUpdate = {}

        if (updateData.title !== undefined) filteredUpdateData.title = updateData.title
        if (updateData.description !== undefined) filteredUpdateData.description = updateData.description
        if (updateData.content !== undefined) filteredUpdateData.content = updateData.content
        if (updateData.excerpt !== undefined) filteredUpdateData.excerpt = updateData.excerpt
        if (updateData.coverImage !== undefined) filteredUpdateData.coverImage = updateData.coverImage
        if (updateData.slug !== undefined) filteredUpdateData.slug = updateData.slug
        if (updateData.status !== undefined) filteredUpdateData.status = updateData.status
        if (updateData.featured !== undefined) filteredUpdateData.featured = updateData.featured
        if (updateData.tags !== undefined) filteredUpdateData.tags = JSON.stringify(updateData.tags)

        // Handle published status change
        if (updateData.status === 'published' && existingPost.status !== 'published') {
          filteredUpdateData.publishedAt = new Date()
        }

        filteredUpdateData.updatedAt = new Date()

        await ctx.db.update(posts).set(filteredUpdateData).where(eq(posts.id, id))

        // Log the audit trail
        await auditLogger.log({
          adminUserId: ctx.session.user.id,
          action: 'user_update', // We can extend this to 'post_update' later
          targetType: 'post',
          targetId: id,
          details: {
            previousData: existingPost,
            updatedData: filteredUpdateData
          },
          ipAddress,
          userAgent
        })

        return { success: true }
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error
        }
        logger.error('Error updating post', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update post'
        })
      }
    }),

  // Delete post
  deletePost: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const auditLogger = new AuditLogger(ctx.db)
        const ipAddress = getIpFromHeaders(ctx.headers)
        const userAgent = getUserAgentFromHeaders(ctx.headers)

        // Get post details for audit log
        const post = await ctx.db.query.posts.findFirst({
          where: eq(posts.id, input.id),
          columns: { id: true, title: true, slug: true, status: true }
        })

        if (!post) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Post not found'
          })
        }

        await ctx.db.delete(posts).where(eq(posts.id, input.id))

        // Log the audit trail
        await auditLogger.log({
          adminUserId: ctx.session.user.id,
          action: 'user_delete', // We can extend this to 'post_delete' later
          targetType: 'post',
          targetId: input.id,
          details: {
            deletedPost: {
              title: post.title,
              slug: post.slug,
              status: post.status
            }
          },
          ipAddress,
          userAgent
        })

        return { success: true }
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error
        }
        logger.error('Error deleting post', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete post'
        })
      }
    }),

  // Get content statistics
  getContentStats: adminProcedure.query(async ({ ctx }) => {
    try {
      const allPosts = await ctx.db.query.posts.findMany({
        columns: {
          id: true,
          status: true,
          featured: true,
          views: true,
          likes: true,
          createdAt: true
        }
      })

      const totalPosts = allPosts.length
      const publishedPosts = allPosts.filter((p) => p.status === 'published').length
      const draftPosts = allPosts.filter((p) => p.status === 'draft').length
      const archivedPosts = allPosts.filter((p) => p.status === 'archived').length
      const featuredPosts = allPosts.filter((p) => p.featured).length
      const totalViews = allPosts.reduce((sum, p) => sum + p.views, 0)
      const totalLikes = allPosts.reduce((sum, p) => sum + p.likes, 0)

      // Recent posts (last 30 days)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      const recentPosts = allPosts.filter(
        (p) => p.createdAt && new Date(p.createdAt) >= thirtyDaysAgo
      ).length

      return {
        totals: {
          posts: totalPosts,
          published: publishedPosts,
          drafts: draftPosts,
          archived: archivedPosts,
          featured: featuredPosts,
          views: totalViews,
          likes: totalLikes
        },
        recent: {
          posts: recentPosts
        }
      }
    } catch (error) {
      logger.error('Error fetching content stats', error)
      return {
        totals: {
          posts: 0,
          published: 0,
          drafts: 0,
          archived: 0,
          featured: 0,
          views: 0,
          likes: 0
        },
        recent: {
          posts: 0
        }
      }
    }
  })
})
