import { writeFileSync } from 'fs';
import { getAllFilesFrontMatter } from '@/utils/mdx';
import RSS from 'rss';

export default async function generateRSS() {
  const siteURL = 'https://yuricunha.com';
  let allBlogs = await getAllFilesFrontMatter();

  // Sort the allBlogs array by publishedAt in descending order
  allBlogs = allBlogs.sort(
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

  allBlogs.map((post) => {
    feed.item({
      title: post.title,
      custom_elements: [
        { id: `${siteURL}/blogs/${post.slug}` },
        { updated: post.publishedAt },
        { description: post.summary },
        {
          image: `${siteURL}/static/images/blogs/${post.slug}/${post.slug}.png`,
        },
        { 'content:encoded': post.content },
        { author: [{ name: 'Yuri Cunha' }, { email: 'hidden' }] },
      ],
    });
  });

  writeFileSync('./public/feed.xml', feed.xml({ indent: true }));
}
