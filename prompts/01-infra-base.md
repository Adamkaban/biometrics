# PrimeBiometry — Инфраструктурная база (Astro 5 SSG)

Создай Astro 5 SSG инфраструктурную базу для primebiometry.com.
Это НЕ сайт и НЕ шаблон. Только фундамент: конфиг, SEO-модуль, layout, CSS-токены.
Поверх этой базы будут добавляться страницы отдельно.

Перед началом прочитай:
- CLAUDE.md — обзор проекта, стек, команды
- .claude/rules/design.md — цвета, шрифты, токены
- .claude/rules/seo.md — SEO требования и schema

Сайт на одном языке — английский. i18n НЕ нужен. hreflang НЕ нужен.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 1. ЗАВИСИМОСТИ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```bash
npm create astro@latest primebiometry -- --template minimal --install --no-git
cd primebiometry
npx astro add react tailwind sitemap
npm install @astrojs/check typescript
npm install @fontsource/geist
npm install @phosphor-icons/react
```

Tailwind: используй `@tailwindcss/vite` плагин в astro.config.mjs.
НЕ используй postcss.config.js для Tailwind.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 2. ГЛАВНЫЙ КОНФИГ — site.config.ts
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Файл в корне проекта. Всё настраивается только здесь.

```ts
const siteConfig = {
  brand: {
    name: "PrimeBiometry",
    domain: "primebiometry.com",
    logo: "/images/logo.svg",
    description: "Independent comparison of biometric authentication and identity verification software",
  },

  seo: {
    siteUrl: "https://primebiometry.com",  // без / в конце
    titleTemplate: "%s | PrimeBiometry",
    defaultDescription: "Compare 69+ biometric authentication and identity verification vendors. Pricing, reviews, and expert analysis for B2B buyers.",
    ogImage: "/images/og-default.webp",
  },

  theme: {
    accentColor: "#2563EB",   // blue-600
    fontBody: "Geist",
    fontMono: "Geist Mono",
  },

  monetization: {
    affiliateRedirectBase: "/go/",  // /go/[slug] → vendor URL
    featuredLabel: "Featured",      // текст бейджа платного размещения
    leadFormWebhook: "",            // заполнить после создания Cloudflare Worker
  },

  catalog: {
    vendorsPerPage: 24,
    defaultSort: "rating",  // "rating" | "reviews" | "name"
  },
};

export default siteConfig;
export type SiteConfig = typeof siteConfig;
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 3. ASTRO КОНФИГ — astro.config.mjs
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```mjs
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";
import siteConfig from "./site.config";

export default defineConfig({
  output: "static",
  site: siteConfig.seo.siteUrl,
  integrations: [
    react(),
    tailwind({ applyBaseStyles: false }),
    sitemap({
      filter: (page) => !page.includes("/go/"),  // affiliate редиректы не в sitemap
    }),
  ],
});
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 4. SEO МОДУЛЬ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### src/components/seo/SEOHead.astro

Пропсы:
- title: string
- description?: string (fallback: siteConfig.seo.defaultDescription)
- canonicalUrl?: string (fallback: siteConfig.seo.siteUrl + Astro.url.pathname)
- ogImage?: string (fallback: siteConfig.seo.ogImage)
- noindex?: boolean (default: false)
- schema?: object (JSON-LD schema объект)

Генерирует:
- `<title>` через siteConfig.seo.titleTemplate (замена %s на title)
- `<meta name="description">`
- `<link rel="canonical" href="https://...">` — всегда HTTPS
- `<meta name="robots" content="index, follow">` по умолчанию
  OR `<meta name="robots" content="noindex, nofollow">` если noindex=true
- Open Graph: og:title, og:description, og:image, og:url, og:type="website", og:site_name
- Twitter Card: summary_large_image
- JSON-LD schema если передан пропс schema (вставить как `<script type="application/ld+json">`)
- Geist шрифт через @fontsource/geist (import в глобальном CSS, не через <link>)

### src/components/seo/BreadcrumbSchema.astro

Пропс: items: Array<{ name: string; url: string }>

Генерирует JSON-LD BreadcrumbList schema + физически рендерит хлебные крошки в `<nav aria-label="Breadcrumb">`.

### src/pages/robots.txt.ts

```ts
import type { APIRoute } from "astro";
import siteConfig from "../../site.config";

export const GET: APIRoute = () => {
  return new Response(
    `User-agent: *\nAllow: /\nDisallow: /go/\nSitemap: ${siteConfig.seo.siteUrl}/sitemap-index.xml`
  );
};
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 5. БАЗОВЫЙ LAYOUT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### src/layouts/BaseLayout.astro

Пропсы: title, description?, canonicalUrl?, ogImage?, noindex?, schema?

```astro
---
import SEOHead from "../components/seo/SEOHead.astro";
import "../styles/global.css";
// пропсы прокидываются в SEOHead
---
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <SEOHead {...Astro.props} />
  </head>
  <body>
    <slot name="header" />
    <main>
      <slot />
    </main>
    <slot name="footer" />
  </body>
</html>
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 6. CSS ТОКЕНЫ — src/styles/global.css
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```css
@import "@fontsource/geist/400.css";
@import "@fontsource/geist/500.css";
@import "@fontsource/geist/600.css";
@import "tailwindcss";

:root {
  --color-accent: #2563eb;
  --color-accent-hover: #1d4ed8;
  --font-sans: "Geist", system-ui, sans-serif;
  --font-mono: "Geist Mono", monospace;

  --container-max: 80rem;
  --content-max: 65ch;

  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
  --radius-full: 9999px;

  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);

  --transition-fast: 150ms ease;
}

body {
  font-family: var(--font-sans);
  background-color: theme(colors.zinc.50);
  color: theme(colors.zinc.900);
}

.container {
  width: 100%;
  max-width: var(--container-max);
  margin-inline: auto;
  padding-inline: 1rem;
}

@media (min-width: 640px) {
  .container { padding-inline: 1.5rem; }
}

@media (prefers-color-scheme: dark) {
  body {
    background-color: theme(colors.zinc.950);
    color: theme(colors.zinc.100);
  }
}
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 7. МИНИМАЛЬНАЯ ПРОВЕРОЧНАЯ СТРАНИЦА
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

src/pages/index.astro — только чтобы проверить что всё собирается.
Использует BaseLayout. Выводит: название сайта, описание, ссылку на /vendors.
Без дизайна.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## ПОРЯДОК СОЗДАНИЯ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Установить зависимости
2. site.config.ts
3. astro.config.mjs
4. src/styles/global.css
5. src/components/seo/SEOHead.astro
6. src/components/seo/BreadcrumbSchema.astro
7. src/layouts/BaseLayout.astro
8. src/pages/robots.txt.ts
9. src/pages/index.astro

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## КРИТЕРИЙ ГОТОВНОСТИ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

`npm run build` проходит без ошибок.

В dist/:
  index.html
  robots.txt
  sitemap-index.xml

В index.html в `<head>`:
  - `<html lang="en">`
  - canonical с https://primebiometry.com
  - meta description
  - og:title, og:description, og:image
  - meta name="robots" content="index, follow"
  - Geist шрифт подключён
