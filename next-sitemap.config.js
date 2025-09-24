/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://www.aroliya.com",
  generateRobotsTxt: true,
  sitemapSize: 5000, // number of URLs per sitemap file
  outDir: "./out", // optional if using static export
  changefreq: "daily",
  priority: 0.7,
  // If you have dynamic pages, you can add them here
  additionalPaths: async (config) => [
    await config.transform(config, "/career"),
    await config.transform(config, "/about"),
    await config.transform(config, "/contact"),
    // add all dynamic pages manually if needed
  ],
};
