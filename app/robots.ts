import type { MetadataRoute } from "next";

// PLACEHOLDER — replace with the real deployed URL once the project has one.
const SITE_URL = "https://example.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
