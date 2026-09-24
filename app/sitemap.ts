import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";

// PLACEHOLDER — replace with the real deployed URL once the project has one.
const SITE_URL = "https://example.com";

export default function sitemap(): MetadataRoute.Sitemap {
  return routing.locales.map((locale) => ({
    url: `${SITE_URL}/${locale}`,
    lastModified: new Date(),
  }));
}
