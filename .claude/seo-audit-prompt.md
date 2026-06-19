# SEO Audit Prompt — PrimeBiometry

## Запуск

```
/seo audit https://primebiometry.com
```

Или точечные проверки:
```
/seo technical https://primebiometry.com
/seo schema https://primebiometry.com
/seo sitemap https://primebiometry.com
/seo content https://primebiometry.com
```

---

## Полный промт с контекстом

/seo audit https://primebiometry.com

## Контекст сайта (обязательно прочти перед анализом)

Сайт: primebiometry.com
Тип: B2B статический сайт (Astro 5 SSG + Cloudflare Pages)
Цель: директория + editorial blog для biometric software
Аудитория: IT-директора, security officers, compliance teams

Особенности технического стека:
- Astro 5, output: "static", trailingSlash: "never", build.format: "file" (плоские .html)
- Tailwind v4, React 19 (только острова)
- Деплой: Cloudflare Pages (Workers Assets) — без Server-Side Rendering
- /go/[slug] = affiliate redirects (noindex, nofollow, Disallow в robots.txt)
- Канониклы: без trailing slash, всегда HTTPS

## Обязательные проверки (приоритет Critical)

### 1. robots.txt
- Существует ли /robots.txt
- Disallow: /go/ — обязательно
- Ссылка на sitemap
- AI-краулеры: GPTBot, ClaudeBot, PerplexityBot — решение: блокировать или разрешить
- Googlebot НЕ заблокирован

### 2. Sitemap
- /sitemap.xml существует и валиден
- /go/* исключён из sitemap
- Все vendor pages (/vendors/[slug]) включены
- Все category pages (/categories/[slug]) включены
- Blog posts включены
- Нет дублей, нет 404-URL в sitemap

### 3. Canonical теги
- Присутствует на КАЖДОЙ странице
- Формат: https://primebiometry.com/[path] (без trailing slash)
- /go/[slug] имеет noindex, nofollow
- Нет конфликтов canonical ↔ noindex

### 4. Мета-теги
- Title: max 60 символов, формат "[Topic] [Year] | PrimeBiometry"
- Description: max 155 символов, ключевое слово в первых 100 символах
- robots meta: index,follow по умолчанию; noindex,nofollow на /go/*
- Open Graph и Twitter Card на всех страницах
- lang="en" на <html>

### 5. Заголовки (Heading Structure)
- H1: ровно один на каждой странице
- Vendor pages H1: "[Vendor] Review 2026: Pricing, Features & Alternatives"
- Category pages H1: "Best [Category] Software 2026: Compare N Tools"
- Blog H1: совпадает с title
- Иерархия H2→H3 без пропусков уровней

### 6. Breadcrumbs
- Визуальные breadcrumbs присутствуют на всех внутренних страницах
- BreadcrumbList schema (JSON-LD) на всех страницах
- Согласованность: визуальные breadcrumbs = schema breadcrumbs
- Пример: Home > Vendors > Veriff

### 7. Schema Markup (JSON-LD обязательно, не Microdata)
Проверить по типам страниц:
- Homepage: Organization + WebSite + SiteLinksSearchBox
- /vendors/[slug]: SoftwareApplication + AggregateRating + FAQPage + BreadcrumbList
- /categories/[slug]: ItemList + BreadcrumbList
- /blog/[slug]: Article + Person(author) + BreadcrumbList + FAQPage (если есть FAQ)
- /blog/ index: BreadcrumbList
- Все страницы: BreadcrumbList
FAQ схема: допустима для AI/LLM цитируемости (не для Google Rich Results — они ограничены)
AggregateRating: только при реальных данных rating + reviewCount

### 8. Производительность / Core Web Vitals
- LCP < 2.5s (целевой <1.8s)
- INP < 200ms (НЕ FID — FID устарел с марта 2024)
- CLS < 0.1
- Hero images: loading="eager", Astro <Image> компонент
- Остальные изображения: loading="lazy" + decoding="async"
- Форматы: WebP для растра, SVG для логотипов/иконок
- Нет тяжёлого client-side JS (только React острова)
- Cloudflare CDN: проверить кэш-заголовки

### 9. Мобильная адаптивность
- Viewport meta tag присутствует
- Нет горизонтального скролла
- Touch targets ≥ 48×48px
- Font-size base ≥ 16px
- Google Mobile-First Indexing активен с июля 2024

### 10. HTTPS и безопасность
- Редирект HTTP → HTTPS (301, не 302)
- www → non-www (301)
- Security headers: HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy
- Нет mixed content

### 11. URL Structure
- Все URL: строчные, с дефисами, без спецсимволов
- Trailing slash отсутствует везде (trailingSlash: "never")
- Redirect chains: не более 1 hop
- /vendors/[slug], /categories/[slug], /blog/[slug] — правильная иерархия

### 12. Internal Linking
- Каждый vendor page → ссылка на primary category page
- Каждый category page → 2-3 blog posts
- Каждый blog post → 3-5 vendor pages + 1 category page
- Homepage → featured vendors + blog + categories
- Нет orphan pages (страниц без входящих ссылок)

### 13. Индексируемость
- Нет случайных noindex на важных страницах
- JS-рендеринг: критичный контент в initial HTML (Astro SSG — должно быть OK)
- Canonical теги идентичны в HTML и JS
- Нет thin content (vendor pages без assessment MDX)
- Нет duplicate content (vendor в нескольких категориях — canonical решает)

### 14. AI Search / GEO
- Доступность для AI-краулеров: ChatGPT-User, PerplexityBot
- llms.txt: рекомендуется создать /llms.txt
- Passage-level цитируемость контента
- Structured data помогает AI Overviews

### 15. Footer pages (обязательные для E-E-A-T)
Проверить наличие ссылок на:
- /about, /methodology, /contact, /privacy, /terms, /blog

## Формат отчёта

1. SEO Health Score (0-100) с разбивкой по категориям
2. Critical Issues (немедленно)
3. High Priority (в течение недели)
4. Medium Priority (в течение месяца)
5. Low Priority (backlog)

Для каждого issue: что нарушено → где (URL/файл) → как исправить конкретно для Astro/Cloudflare Pages стека.
