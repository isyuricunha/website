import { Resend } from 'resend'
import { logger } from '@/lib/logger'

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY)

export interface ResendAudience {
  id: string
  name: string
  object?: string
}

export interface ResendContact {
  id: string
  email?: string
  first_name?: string
  last_name?: string
  created_at?: string
  unsubscribed?: boolean
}

export interface ResendBroadcast {
  id: string
  name: string
  audience_id: string
  subject?: string
  from?: string
  reply_to?: string | string[] | null
  html?: string
  text?: string
  scheduled_at?: string | null
  sent_at?: string | null
  status?: 'draft' | 'scheduled' | 'sending' | 'sent' | 'cancelled'
}

export class ResendService {
  private lastRequestTime = 0
  private readonly minRequestInterval = 500 // 500ms between requests (2 requests per second)

  private async rateLimitDelay() {
    const now = Date.now()
    const timeSinceLastRequest = now - this.lastRequestTime
    if (timeSinceLastRequest < this.minRequestInterval) {
      const delayTime = this.minRequestInterval - timeSinceLastRequest
      await new Promise((resolve) => setTimeout(resolve, delayTime))
    }
    this.lastRequestTime = Date.now()
  }

  /**
   * Audience Management
   */

  // Create a new audience
  async createAudience(name: string): Promise<ResendAudience> {
    try {
      const response = await resend.audiences.create({ name })
      return response.data as unknown as ResendAudience
    } catch (error) {
      logger.error('Error creating Resend audience', error)
      throw new Error('Failed to create audience')
    }
  }

  // List all audiences
  async listAudiences(): Promise<ResendAudience[]> {
    try {
      await this.rateLimitDelay()
      const response = await resend.audiences.list()
      const audiences = response.data?.data || []
      return audiences as unknown as ResendAudience[]
    } catch (error) {
      logger.error('Error listing Resend audiences', error)
      throw new Error('Failed to list audiences')
    }
  }

  // Get audience by ID
  async getAudience(audienceId: string): Promise<ResendAudience | null> {
    try {
      const response = await resend.audiences.get(audienceId)
      return response.data as unknown as ResendAudience
    } catch (error) {
      logger.error('Error getting Resend audience', error)
      return null
    }
  }

  // Delete audience
  async deleteAudience(audienceId: string): Promise<boolean> {
    try {
      await resend.audiences.remove(audienceId)
      return true
    } catch (error) {
      logger.error('Error deleting Resend audience', error)
      return false
    }
  }

  /**
   * Contact Management
   */

  // Add contact to audience
  async addContact(
    audienceId: string,
    contact: {
      email: string
      first_name?: string
      last_name?: string
      unsubscribed?: boolean
    }
  ): Promise<ResendContact | null> {
    try {
      const response = await resend.contacts.create({
        audienceId,
        email: contact.email,
        firstName: contact.first_name,
        lastName: contact.last_name,
        unsubscribed: contact.unsubscribed || false
      })
      return response.data as unknown as ResendContact
    } catch (error) {
      logger.error('Error adding contact to Resend audience', error)
      return null
    }
  }

  // Update contact in audience
  async updateContact(
    audienceId: string,
    contactId: string,
    updates: {
      first_name?: string
      last_name?: string
      unsubscribed?: boolean
    }
  ): Promise<ResendContact | null> {
    try {
      const response = await resend.contacts.update({
        audienceId,
        id: contactId,
        firstName: updates.first_name,
        lastName: updates.last_name,
        unsubscribed: updates.unsubscribed
      })
      return response.data as unknown as ResendContact
    } catch (error) {
      logger.error('Error updating contact in Resend audience', error)
      return null
    }
  }

  // Remove contact from audience
  async removeContact(audienceId: string, contactId: string): Promise<boolean> {
    try {
      await resend.contacts.remove({
        audienceId,
        id: contactId
      })
      return true
    } catch (error) {
      logger.error('Error removing contact from Resend audience', error)
      return false
    }
  }

  // List contacts in audience
  async listContacts(audienceId: string): Promise<ResendContact[]> {
    try {
      await this.rateLimitDelay()
      const response = await resend.contacts.list({ audienceId })
      const contacts = response.data?.data || []
      return contacts
    } catch (error) {
      logger.error('Error listing contacts in Resend audience', error)
      return []
    }
  }

  // Get subscriber count for audience (active subscribers only)
  async getAudienceSubscriberCount(audienceId: string): Promise<number> {
    try {
      const contacts = await this.listContacts(audienceId)
      // Count only active subscribers (not unsubscribed)
      const activeSubscribers = contacts.filter((contact) => !contact.unsubscribed)
      return activeSubscribers.length
    } catch (error) {
      logger.error('Error getting subscriber count for audience', error)
      return 0
    }
  }

  // Find contact by email
  async findContactByEmail(audienceId: string, email: string): Promise<ResendContact | null> {
    try {
      const contacts = await this.listContacts(audienceId)
      return contacts.find((contact) => contact.email === email) || null
    } catch (error) {
      logger.error('Error finding contact by email', error)
      return null
    }
  }

  /**
   * Broadcast Management
   */

  // Create broadcast
  async createBroadcast(broadcast: {
    name: string
    audience_id: string
    from: string
    subject: string
    html?: string
    text?: string
    reply_to?: string
  }): Promise<ResendBroadcast | null> {
    try {
      await this.rateLimitDelay()

      // Resend API only expects: audienceId, from, subject, html
      const response = await resend.broadcasts.create({
        audienceId: broadcast.audience_id,
        from: broadcast.from,
        subject: broadcast.subject,
        html: broadcast.html || broadcast.text || '<p>No content provided</p>'
      })

      return response.data as unknown as ResendBroadcast
    } catch (error) {
      logger.error('Error creating Resend broadcast', error)
      return null
    }
  }

  // Send broadcast immediately
  async sendBroadcast(broadcastId: string): Promise<boolean> {
    try {
      await resend.broadcasts.send(broadcastId)
      return true
    } catch (error) {
      logger.error('Error sending Resend broadcast', error)
      return false
    }
  }

  // Schedule broadcast
  async scheduleBroadcast(broadcastId: string, scheduledAt: string): Promise<boolean> {
    try {
      await resend.broadcasts.send(broadcastId, { scheduledAt })
      return true
    } catch (error) {
      logger.error('Error scheduling Resend broadcast', error)
      return false
    }
  }

  // Get broadcast
  async getBroadcast(broadcastId: string): Promise<ResendBroadcast | null> {
    try {
      await this.rateLimitDelay()
      const response = await resend.broadcasts.get(broadcastId)
      return response.data as unknown as ResendBroadcast
    } catch (error) {
      logger.error('Error getting Resend broadcast', error)
      return null
    }
  }

  // Update broadcast
  async updateBroadcast(
    broadcastId: string,
    updates: {
      html?: string
      subject?: string
    }
  ): Promise<ResendBroadcast | null> {
    try {
      await this.rateLimitDelay()
      const response = await (resend.broadcasts as any).update(broadcastId, {
        html: updates.html,
        subject: updates.subject
      })
      return response.data as unknown as ResendBroadcast
    } catch (error) {
      logger.error('Error updating Resend broadcast', error)
      return null
    }
  }

  // List broadcasts
  async listBroadcasts(): Promise<ResendBroadcast[]> {
    try {
      await this.rateLimitDelay()
      const response = await resend.broadcasts.list()
      const broadcasts = response.data?.data || []
      return broadcasts as unknown as ResendBroadcast[]
    } catch (error) {
      logger.error('Error listing Resend broadcasts', error)
      return []
    }
  }

  // Cancel broadcast
  async cancelBroadcast(broadcastId: string): Promise<boolean> {
    try {
      await (resend.broadcasts as any).cancel(broadcastId)
      return true
    } catch (error) {
      logger.error('Error cancelling Resend broadcast', error)
      return false
    }
  }

  // Delete broadcast
  async deleteBroadcast(broadcastId: string): Promise<boolean> {
    try {
      await resend.broadcasts.remove(broadcastId)
      return true
    } catch (error) {
      logger.error('Error deleting Resend broadcast', error)
      return false
    }
  }

  /**
   * User Sync Utilities
   */

  // Sync user to Resend audience
  async syncUserToAudience(
    audienceId: string,
    user: {
      email: string
      firstName?: string
      lastName?: string
      subscribed?: boolean
    }
  ): Promise<ResendContact | null> {
    try {
      // Check if contact already exists
      const existingContact = await this.findContactByEmail(audienceId, user.email)

      if (existingContact) {
        // Update existing contact
        return await this.updateContact(audienceId, existingContact.id, {
          first_name: user.firstName,
          last_name: user.lastName,
          unsubscribed: !user.subscribed
        })
      } else {
        // Add new contact
        return await this.addContact(audienceId, {
          email: user.email,
          first_name: user.firstName,
          last_name: user.lastName,
          unsubscribed: !user.subscribed
        })
      }
    } catch (error) {
      logger.error('Error syncing user to Resend audience', error)
      return null
    }
  }

  // Bulk sync users to audience
  async bulkSyncUsersToAudience(
    audienceId: string,
    users: Array<{
      email: string
      firstName?: string
      lastName?: string
      subscribed?: boolean
    }>
  ): Promise<{ success: number; failed: number }> {
    let success = 0
    let failed = 0

    for (const user of users) {
      const result = await this.syncUserToAudience(audienceId, user)
      if (result) {
        success++
      } else {
        failed++
      }
    }

    return { success, failed }
  }
}

// Export singleton instance
export const resendService = new ResendService()
