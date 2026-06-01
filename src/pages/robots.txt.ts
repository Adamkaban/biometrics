import type { APIRoute } from "astro";
import siteConfig from "../../site.config";

export const GET: APIRoute = () =>
  new Response(
    [
      "User-agent: *",
      "Allow: /",
      "Disallow: /go/",
      `Sitemap: ${siteConfig.seo.siteUrl}/sitemap-index.xml`,
      "",
    ].join("\n"),
    { headers: { "Content-Type": "text/plain; charset=utf-8" } },
  );
