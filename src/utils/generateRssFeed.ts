import { writeFileSync } from 'fs';
import { getAllFilesFrontMatter } from '@/utils/mdx';
import RSS from 'rss';

export default async function generateRSS() {
  const siteURL = 'https://yuricunha.com';
  let allBlog = await getAllFilesFrontMatter();

  // Sort the allBlog array by publishedAt in descending order
  allBlog = allBlog.sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  const feed = new RSS({
    title: 'Yuri Cunha',
    description:
      'Not just a DBA, but a data craftsman building digital legacies.',
    site_url: siteURL,
    feed_url: `${siteURL}/feed.xml`,
    language: 'en',
    pubDate: new Date(),
    copyright: `All rights reserved ${new Date().getFullYear()}, Yuri Cunha`,
  });

  allBlog.map((post) => {
    feed.item({
      title: post.title,
      custom_elements: [
        { id: `${siteURL}/blog/${post.slug}` },
        { updated: post.publishedAt },
        { description: post.summary },
        {
          image: `${siteURL}/static/images/blog/${post.slug}/${post.slug}.png`,
        },
        { 'content:encoded': post.content },
        {
          author: [{ name: 'Yuri Cunha' }, { email: 'contact@yuricunha.com' }],
        },
      ],
    });
  });

  writeFileSync('./public/feed.xml', feed.xml({ indent: true }));
}
