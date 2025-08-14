import { randomBytes } from 'crypto'
import { auditLogs } from '@tszhong0411/db'
import type { Database } from '@tszhong0411/db'

export type AuditAction = 
  | 'user_create'
  | 'user_update' 
  | 'user_delete'
  | 'user_ban'
  | 'user_unban'
  | 'user_password_reset'
  | 'comment_delete'
  | 'comment_approve'
  | 'comment_reject'
  | 'admin_login'
  | 'admin_logout'
  | 'settings_update'
  | 'bulk_operation'

export interface AuditLogEntry {
  adminUserId: string
  action: AuditAction
  targetType?: string
  targetId?: string
  details?: Record<string, any>
  ipAddress?: string
  userAgent?: string
}

export class AuditLogger {
  constructor(private db: Database) {}

  async log(entry: AuditLogEntry): Promise<void> {
    try {
      const id = randomBytes(16).toString('hex')
      
      await this.db.insert(auditLogs).values({
        id,
        adminUserId: entry.adminUserId,
        action: entry.action,
        targetType: entry.targetType || null,
        targetId: entry.targetId || null,
        details: entry.details ? JSON.stringify(entry.details) : null,
        ipAddress: entry.ipAddress || null,
        userAgent: entry.userAgent || null,
        createdAt: new Date()
      })
    } catch (error) {
      console.error('Failed to log audit entry:', error)
      // Don't throw error to avoid breaking the main operation
    }
  }

  // Helper methods for common audit actions
  async logUserAction(
    adminUserId: string,
    action: 'user_create' | 'user_update' | 'user_delete' | 'user_ban' | 'user_unban',
    targetUserId: string,
    details?: Record<string, any>,
    ipAddress?: string,
    userAgent?: string
  ) {
    await this.log({
      adminUserId,
      action,
      targetType: 'user',
      targetId: targetUserId,
      details,
      ipAddress,
      userAgent
    })
  }

  async logCommentAction(
    adminUserId: string,
    action: 'comment_delete' | 'comment_approve' | 'comment_reject',
    commentId: string,
    details?: Record<string, any>,
    ipAddress?: string,
    userAgent?: string
  ) {
    await this.log({
      adminUserId,
      action,
      targetType: 'comment',
      targetId: commentId,
      details,
      ipAddress,
      userAgent
    })
  }

  async logAdminSession(
    adminUserId: string,
    action: 'admin_login' | 'admin_logout',
    ipAddress?: string,
    userAgent?: string
  ) {
    await this.log({
      adminUserId,
      action,
      ipAddress,
      userAgent
    })
  }

  async logBulkOperation(
    adminUserId: string,
    details: Record<string, any>,
    ipAddress?: string,
    userAgent?: string
  ) {
    await this.log({
      adminUserId,
      action: 'bulk_operation',
      details,
      ipAddress,
      userAgent
    })
  }
}

// Helper function to get IP address from headers
export function getIpFromHeaders(headers: Headers): string | undefined {
  return (
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headers.get('x-real-ip') ||
    headers.get('cf-connecting-ip') ||
    undefined
  )
}

// Helper function to get user agent from headers
export function getUserAgentFromHeaders(headers: Headers): string | undefined {
  return headers.get('user-agent') || undefined
}
