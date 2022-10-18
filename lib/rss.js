import sorter from "sort-isostring";

const generateRssItem = (post) => `
  <item>
    <guid>https://www.website.garotogordo.codes/blog/${post.fields.slug}</guid>
    <title>${post.fields.title}</title>
    <link>https://www.website.garotogordo.codes/blog/${post.fields.slug}</link>
    <description>${post.fields.summary}</description>
    <pubDate>${new Date(post.fields.publishDate).toUTCString()}</pubDate>
  </item>
`;

const generateRss = (posts) => {
  const sortedPosts = posts
    .filter((p) => p.fields.status === "Published")
    .sort((x, y) => sorter(y.fields.publishDate, x.fields.publishDate));

  return `
  <rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
    <channel>
      <title>Blog - Yuri Cunha</title>
      <link>https://www.website.garotogordo.codes/blog</link>
      <description>Designer, developer and maker of things.</description>
      <language>en</language>
      <lastBuildDate>${new Date(
        sortedPosts[0].fields.publishDate
      ).toUTCString()}</lastBuildDate>
      <atom:link href="https://www.website.garotogordo.codes/rss.xml" rel="self" type="application/rss+xml"/>
      ${sortedPosts.map(generateRssItem).join("")}
    </channel>
  </rss>
`;
};

export default generateRss;
