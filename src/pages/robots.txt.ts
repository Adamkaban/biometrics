import type { APIRoute } from "astro";
import siteConfig from "../../site.config";

export const GET: APIRoute = () =>
  new Response(
    [
      "# Block bulk AI training scrapers (low SEO value for B2B west)",
      "User-agent: Bytespider",
      "Disallow: /",
      "",
      "User-agent: CCBot",
      "Disallow: /",
      "",
      "# Allow all other crawlers including AI search (GPTBot, PerplexityBot, ClaudeBot)",
      "User-agent: *",
      "Allow: /",
      "Disallow: /go/",
      "",
      `Sitemap: ${siteConfig.seo.siteUrl}/sitemap-index.xml`,
      "",
    ].join("\n"),
    { headers: { "Content-Type": "text/plain; charset=utf-8" } },
  );
