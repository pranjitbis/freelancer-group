/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://www.aroliya.com",
  generateRobotsTxt: true,
  changefreq: "weekly",
  priority: 0.7,
  transform: async (config, path) => {
    const priorities = {
      "/": 1.0,
      "/about-us": 0.8,
      "/services": 0.9,
      "/services/freelancer-hub": 0.8,
      "/services/form-filling-services": 0.8,
      "/services/virtual-assistance": 0.8,
      "/services/ecommerce-solutions": 0.8,
      "/services/travel-hotel-booking": 0.8,
      "/our-team": 0.7,
      "/career": 0.6,
      "/contact-us": 0.7,
      "/login": 0.5,
      "/register": 0.5,
    };
    return {
      loc: path,
      changefreq: config.changefreq,
      priority: priorities[path] || config.priority,
      lastmod: new Date().toISOString(),
    };
  },
};
