/** @type {import('next-sitemap').IConfig} */

module.exports = {
  siteUrl: 'https://yuricunha.com',
  changefreq: 'daily',
  priority: 0.7,
  sitemapSize: 5000,
  generateRobotsTxt: true,
  exclude: ['/protected-page', '/awesome/secret-page'],
  alternateRefs: [
    {
      href: 'https://www.yuricunha.com',
      hreflang: 'en',
    },
  ],
  // Default transformation function
  transform: async (config, path) => {
    return {
      loc: path, // => this will be exported as http(s)://<config.siteUrl>/<path>
      changefreq: config.changefreq,
      priority: config.priority,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
      alternateRefs: config.alternateRefs ?? [],
    };
  },
  additionalPaths: async (config) => [
    await config.transform(
      config,
      '/blog',
      '/tools',
      '/spotify',
      '/links',
      '/projects',
      '/feed.xml'
    ),
  ],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
      },
      {
        userAgent: 'test-bot',
        allow: ['/tools', '/blog', '/spotify', '/links', '/projects'],
      },
      {
        userAgent: 'black-listed-bot',
        disallow: [''],
      },
    ],
    // additionalSitemaps: [
    //   'https://example.com/my-custom-sitemap-1.xml'
    // ],
  },
};
