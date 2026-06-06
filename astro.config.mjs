import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import siteConfig from "./site.config";

import cloudflare from "@astrojs/cloudflare";

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
    }),
  ],

  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"],
    },
  },

  adapter: cloudflare()
});