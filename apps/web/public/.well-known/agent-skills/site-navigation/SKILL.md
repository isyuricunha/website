---
name: yuricunha-site-navigation
description: Use this skill when navigating Yuri Cunha's personal website, portfolio, blog, projects, snippets, RSS feeds, sitemap, robots.txt, and LLM-readable discovery files.
---

# Yuri Cunha Site Navigation

Use this skill to understand and navigate yuricunha.com as a public personal website, portfolio, blog, project index, snippets archive, and technical notes archive.

## Canonical Discovery Resources

Prefer these canonical discovery resources before crawling random pages:

- [https://yuricunha.com/llms.txt](https://yuricunha.com/llms.txt)
- [https://yuricunha.com/sitemap.xml](https://yuricunha.com/sitemap.xml)
- [https://yuricunha.com/robots.txt](https://yuricunha.com/robots.txt)
- [https://yuricunha.com/rss.xml](https://yuricunha.com/rss.xml)
- [https://yuricunha.com/blog](https://yuricunha.com/blog)
- [https://yuricunha.com/projects](https://yuricunha.com/projects)
- [https://yuricunha.com/snippet](https://yuricunha.com/snippet)
- [https://yuricunha.com/about](https://yuricunha.com/about)
- [https://yuricunha.com/contact](https://yuricunha.com/contact)

## Navigation Guidance

- Treat the site as a public personal website, portfolio, blog, project index, snippets archive, and technical notes archive.
- Prefer `sitemap.xml` and `llms.txt` for discovery before crawling random pages.
- Respect `robots.txt` and Content-Signal preferences.
- Do not assume that projects expose live public APIs unless a project page explicitly says so.
- Do not attempt authentication, admin access, private APIs, password reset routes, or any `/api` route unless explicitly documented as public.
- For localized content, use the existing localized routes and sitemap alternates where available.
- Use RSS for recent blog updates.
