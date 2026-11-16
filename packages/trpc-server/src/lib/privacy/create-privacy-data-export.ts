import {
  aiChatFeedback,
  comments,
  db,
  emailSubscriptions,
  guestbook,
  notificationPreferences,
  users,
  asc,
  eq
} from '@isyuricunha/db'

const toIsoString = (value: Date | string): string => new Date(value).toISOString()

const toNullableIsoString = (value: Date | string | null): string | null => {
  return value ? toIsoString(value) : null
}

const parseSubscriptionTypes = (value: string | null): string[] => {
  if (!value) return []

  try {
    const parsed: unknown = JSON.parse(value)
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === 'string')
      : []
  } catch {
    return []
  }
}

type PrivacyDatabase = typeof db

type PrivacyExportOptions = {
  database?: PrivacyDatabase
  generatedAt?: Date
}

export const createPrivacyDataExport = async (
  userId: string,
  options: PrivacyExportOptions = {}
) => {
  const database = options.database ?? db
  const generatedAt = options.generatedAt ?? new Date()

  const [account, commentRows, guestbookRows, feedbackRows, subscriptionRows, preferenceRows] =
    await Promise.all([
      database.query.users.findFirst({
        where: eq(users.id, userId),
        columns: {
          username: true,
          name: true,
          email: true,
          emailVerified: true,
          image: true,
          createdAt: true,
          updatedAt: true,
          isAnonymous: true,
          bio: true,
          isPublic: true,
          nameColor: true,
          nameEffect: true
        }
      }),
      database.query.comments.findMany({
        where: eq(comments.userId, userId),
        orderBy: asc(comments.createdAt),
        columns: {
          body: true,
          isDeleted: true,
          createdAt: true,
          updatedAt: true
        }
      }),
      database.query.guestbook.findMany({
        where: eq(guestbook.userId, userId),
        orderBy: asc(guestbook.createdAt),
        columns: {
          body: true,
          createdAt: true,
          updatedAt: true
        }
      }),
      database.query.aiChatFeedback.findMany({
        where: eq(aiChatFeedback.userId, userId),
        orderBy: asc(aiChatFeedback.createdAt),
        columns: {
          rating: true,
          comment: true,
          pagePath: true,
          locale: true,
          createdAt: true
        }
      }),
      database.query.emailSubscriptions.findMany({
        where: eq(emailSubscriptions.userId, userId),
        orderBy: asc(emailSubscriptions.subscribedAt),
        columns: {
          subscriptionTypes: true,
          isActive: true,
          subscribedAt: true,
          unsubscribedAt: true
        }
      }),
      database.query.notificationPreferences.findMany({
        where: eq(notificationPreferences.userId, userId),
        orderBy: asc(notificationPreferences.createdAt),
        columns: {
          notificationType: true,
          channel: true,
          enabled: true,
          createdAt: true,
          updatedAt: true
        }
      })
    ])

  if (!account) throw new Error('Account not found')

  return {
    schemaVersion: 1,
    generatedAt: generatedAt.toISOString(),
    account: {
      username: account.username,
      name: account.name,
      email: account.email,
      emailVerified: account.emailVerified,
      image: account.image,
      createdAt: toIsoString(account.createdAt),
      updatedAt: toIsoString(account.updatedAt),
      isAnonymous: account.isAnonymous,
      bio: account.bio,
      isPublic: account.isPublic,
      nameColor: account.nameColor,
      nameEffect: account.nameEffect
    },
    content: {
      comments: commentRows.map((comment) => ({
        body: comment.body,
        isDeleted: comment.isDeleted,
        createdAt: toIsoString(comment.createdAt),
        updatedAt: toIsoString(comment.updatedAt)
      })),
      guestbookEntries: guestbookRows.map((entry) => ({
        body: entry.body,
        createdAt: toIsoString(entry.createdAt),
        updatedAt: toIsoString(entry.updatedAt)
      }))
    },
    interactions: {
      aiChatFeedback: feedbackRows.map((feedback) => ({
        rating: feedback.rating,
        comment: feedback.comment,
        pagePath: feedback.pagePath,
        locale: feedback.locale,
        createdAt: toIsoString(feedback.createdAt)
      }))
    },
    preferences: {
      emailSubscriptions: subscriptionRows.map((subscription) => ({
        subscriptionTypes: parseSubscriptionTypes(subscription.subscriptionTypes),
        isActive: subscription.isActive,
        subscribedAt: toIsoString(subscription.subscribedAt),
        unsubscribedAt: toNullableIsoString(subscription.unsubscribedAt)
      })),
      notifications: preferenceRows.map((preference) => ({
        notificationType: preference.notificationType,
        channel: preference.channel,
        enabled: preference.enabled,
        createdAt: toIsoString(preference.createdAt),
        updatedAt: toIsoString(preference.updatedAt)
      }))
    }
  }
}
