const normalize = (value: string) => value.trim().replace(/\s+/g, ' ')

export const rate_limit_keys = {
    ai_chat: (ip: string) => `ai:chat:${normalize(ip)}`,
    ai_chat_feedback: (ip: string) => `ai:chat:feedback:${normalize(ip)}`,
    ai_content: (ip: string) => `ai:content:${normalize(ip)}`,
    contact_submit: (ip: string) => `contact:submit:${normalize(ip)}`,
    newsletter_subscribe: (ip: string) => `newsletter:subscribe:${normalize(ip)}`,
    newsletter_unsubscribe: (ip: string) => `newsletter:unsubscribe:${normalize(ip)}`,
    admin_posts_create: (ip: string) => `admin:posts:create:${normalize(ip)}`,
    admin_posts_update: (ip: string) => `admin:posts:update:${normalize(ip)}`,
    admin_posts_delete: (ip: string) => `admin:posts:delete:${normalize(ip)}`,
    admin_translate: (ip: string) => `admin:translate:${normalize(ip)}`
}
