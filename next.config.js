const withPWA = require("next-pwa");

module.exports = withPWA({
  pwa: {
    dest: "public",
  },
  images: {
    domains: [
      "localhost",
      "<Insert Deployment URL without the protocol i.e., without 'https://' or 'http://'>",
    ],
  },
});
