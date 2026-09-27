import { describe, expect, it } from 'vitest'

import { is_bot_user_agent } from '@/lib/spam-detection'

/*
 * Crawler detection is used to deny AI-chat access, skip view counting and
 * skip telemetry, so a false positive silently degrades the site for a real
 * person. These cases are real user agents, kept as a regression net against
 * "just add the substring" changes to BOT_UA_PATTERNS.
 */

const HUMAN_USER_AGENTS = [
  // Brand names that also ship a crawler: must NOT be caught.
  [
    'Sogou Mobile Browser',
    'Mozilla/5.0 (Linux; Android 12; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Mobile Safari/537.36 SogouMobileBrowser/5.29.1'
  ],
  [
    'Sogou Explorer desktop',
    'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0 Safari/537.36 SE 2.X MetaSr 1.0 Sogou Explorer'
  ],
  [
    'Yandex Browser',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0 YaBrowser/23.1.0 Safari/537.36'
  ],
  // Device model containing "BOT": must NOT be caught.
  [
    'CUBOT Android phone',
    'Mozilla/5.0 (Linux; Android 11; CUBOT_NOTE_S Build/RP1A.200720.011) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0 Mobile Safari/537.36'
  ],
  // Generic HTTP client stacks: real apps and RSS readers use these.
  ['native app on OkHttp', 'okhttp/4.12.0'],
  ['RSS reader on OkHttp', 'ReederApp/5.0 okhttp/4.9.3'],
  ['app with Apache client', 'MyApp/1.0 Apache-HttpClient/4.5.13'],
  // App user agents shared with link-preview fetchers: counted as humans on
  // purpose (see the BOT_UA_PATTERNS comment about WhatsApp referral traffic).
  ['Pinterest app', 'Pinterest/9.7.6 (Android 14; 9.7.6)'],
  [
    'WhatsApp in-app browser',
    'Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Mobile Safari/537.36 WhatsApp/2.23.20.0'
  ],
  // Mainstream browsers.
  [
    'Chrome Linux',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0 Safari/537.36'
  ],
  [
    'Safari iPhone',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1'
  ],
  ['Firefox', 'Mozilla/5.0 (X11; Linux x86_64; rv:155.0) Gecko/20100101 Firefox/155.0'],
  [
    'Samsung Internet',
    'Mozilla/5.0 (Linux; Android 13; SAMSUNG SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/23.0 Chrome/115.0 Mobile Safari/537.36'
  ],
  [
    'Edge',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0 Safari/537.36 Edg/141.0'
  ]
] as const

const CRAWLER_USER_AGENTS = [
  [
    'Sogou web spider',
    'Sogou web spider/4.0(+http://www.sogou.com/docs/help/webmasters.html#crawler)'
  ],
  ['Googlebot', 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'],
  ['Googlebot-Image', 'Googlebot-Image/1.0'],
  ['Googlebot-News', 'Googlebot-News'],
  ['GoogleOther', 'Mozilla/5.0 (compatible; GoogleOther)'],
  ['bingbot', 'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)'],
  ['YandexBot', 'Mozilla/5.0 (compatible; YandexBot/3.0; +http://yandex.com/bots)'],
  ['AhrefsBot', 'Mozilla/5.0 (compatible; AhrefsBot/7.0; +http://ahrefs.com/robot/)'],
  ['Applebot', 'Mozilla/5.0 (compatible; Applebot/0.1)'],
  [
    'PetalBot',
    'Mozilla/5.0 (compatible; PetalBot;+https://webmaster.petalsearch.com/site/petalbot)'
  ],
  ['facebook unfurl', 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)'],
  ['TelegramBot', 'TelegramBot (like TwitterBot)'],
  [
    'Pinterestbot',
    'Mozilla/5.0 (compatible; Pinterestbot/1.0; +https://www.pinterest.com/bot.html)'
  ],
  ['curl', 'curl/8.5.0'],
  ['wget', 'Wget/1.21.4'],
  ['python-requests', 'python-requests/2.31.0'],
  ['Go client', 'Go-http-client/2.0'],
  ['Scrapy', 'Scrapy/2.11 (+https://scrapy.org)'],
  [
    'HeadlessChrome',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/120.0 Safari/537.36'
  ]
] as const

describe('is_bot_user_agent', () => {
  it.each(HUMAN_USER_AGENTS)('treats %s as a human', (_label, ua) => {
    expect(is_bot_user_agent(ua)).toBe(false)
  })

  it.each(CRAWLER_USER_AGENTS)('detects %s as a crawler', (_label, ua) => {
    expect(is_bot_user_agent(ua)).toBe(true)
  })

  it('does not treat a missing user agent as a bot', () => {
    // Callers that want to skip missing-UA traffic check that themselves;
    // /api/ai/chat deliberately still serves privacy browsers that strip it.
    expect(is_bot_user_agent()).toBe(false)
    expect(is_bot_user_agent(null)).toBe(false)
    expect(is_bot_user_agent('')).toBe(false)
  })

  it('matches regardless of casing', () => {
    expect(is_bot_user_agent('GOOGLEBOT/2.1')).toBe(true)
    expect(is_bot_user_agent('sOgOu WeB sPiDeR/4.0')).toBe(true)
  })
})
