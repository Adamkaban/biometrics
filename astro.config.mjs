import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import siteConfig from "./site.config";
import { execFileSync } from "node:child_process";
import { readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const projectDir = fileURLToPath(new URL(".", import.meta.url));
const TODAY = new Date().toISOString().slice(0, 10);

function gitLastmod(relPath) {
  try {
    const out = execFileSync("git", ["log", "-1", "--format=%ci", "--", relPath], {
      encoding: "utf-8",
      cwd: projectDir,
    }).trim();
    return out ? out.slice(0, 10) : TODAY;
  } catch {
    return TODAY;
  }
}

const vendorLastmod = Object.fromEntries(
  readdirSync(join(projectDir, "src/content/assessments"))
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => [f.replace(".mdx", ""), gitLastmod(`src/content/assessments/${f}`)])
);

const blogLastmod = Object.fromEntries(
  readdirSync(join(projectDir, "src/content/blog"))
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => [f.replace(".mdx", ""), gitLastmod(`src/content/blog/${f}`)])
);

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
        const segments = new URL(item.url).pathname.split("/").filter(Boolean);
        if (segments[0] === "vendors" && segments.length === 2) {
          item.lastmod = vendorLastmod[segments[1]] ?? TODAY;
        } else if (segments[0] === "blog" && segments.length === 2) {
          item.lastmod = blogLastmod[segments[1]] ?? TODAY;
        } else {
          item.lastmod = TODAY;
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
