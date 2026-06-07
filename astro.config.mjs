import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import siteConfig from "./site.config";

export default defineConfig({
  output: "static",
  trailingSlash: "never",
  build: { format: "file" },
  site: siteConfig.seo.siteUrl,
  integrations: [
    mdx(),
    react(),
    sitemap({
      filter: (page) => !page.includes("/go/"),
      serialize(item) {
        if (item.url.includes("/vendors/")) {
          item.lastmod = "2026-06-01";
        } else if (item.url.includes("/blog/")) {
          item.lastmod = "2026-06-02";
        } else if (item.url.includes("/categories/")) {
          item.lastmod = "2026-06-01";
        } else {
          item.lastmod = new Date().toISOString().slice(0, 10);
        }
        return item;
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"],
    },
  },
});
