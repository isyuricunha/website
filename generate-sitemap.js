// Import the necessary modules
const fs = require('fs');
const { SitemapStream, streamToPromise } = require('sitemap');

// Your Next.js routes (you may need to adjust this depending on your project structure)
const routes = [
  '/',
  '/blog',
  '/about',
  '/projects', // Add more routes as needed
  '/research', // Add more routes as needed
  '/stats', // Add more routes as needed
  '/tools', // Add more routes as needed
  '/links', // Add more routes as needed
  '/spotify', // Add more routes as needed
];

// Function to generate the sitemap
async function generateSitemap() {
  const sitemap = new SitemapStream({ hostname: 'https://yuricunha.com/' }); // Replace with your website URL

  // Add each route to the sitemap
  routes.forEach((route) => {
    sitemap.write({ url: route, changefreq: 'daily', priority: 0.7 });
  });

  sitemap.end();

  // Return the sitemap as a string
  return streamToPromise(sitemap);
}

// Generate the sitemap and save it to a file
generateSitemap().then((sitemap) => {
  fs.writeFileSync('./public/sitemap.xml', sitemap);
  console.log('Sitemap generated successfully!');
});
