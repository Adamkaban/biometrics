# PrimeBiometry — Directory Module

Инфраструктурная база (промт 01) уже создана и `npm run build` проходит.
Теперь строим ядро сайта: каталог вендоров, страницы вендоров, категории, affiliate редиректы.

Перед началом прочитай:
- CLAUDE.md — обзор проекта
- .claude/rules/vendors.md — структура данных
- .claude/rules/design.md — дизайн решения
- .claude/rules/seo.md — SEO требования

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## ДАННЫЕ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Скопировать файл `biometrics_enriched_*.json` в `src/data/vendors.json`.

Каждый вендор имеет поля: name, company, description, rating, reviews_count, pricing,
vendor_website, product_url, categories[], source, all_sources[], website_data.pricing_plans[].

Добавить в vendors.json для каждого вендора (если ещё нет):
- `slug`: string — генерируется из name: lowercase, пробелы→дефисы, спецсимволы удалить
- `featured`: boolean — default false
- `affiliate_url`: string | null — default null

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## УТИЛИТЫ — src/lib/vendors.ts
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Создать файл с функциями:

```ts
import vendorsData from "../data/vendors.json";

export type Vendor = {
  name: string;
  company: string;
  description: string;
  rating: number;
  reviews_count: number;
  pricing: string;
  vendor_website: string;
  product_url: string;
  categories: string[];
  source: string;
  all_sources: string[];
  website_data: { pricing_plans: Array<{ name: string; price: string; features_included: string[] }> };
  slug: string;
  featured: boolean;
  affiliate_url: string | null;
};

export const vendors: Vendor[] = vendorsData.vendors;

// Все уникальные категории из данных
export const categories = [...new Set(vendors.flatMap(v => v.categories))].sort();

// Карта slug→категория для URL
export const CATEGORY_SLUGS: Record<string, string> = {
  "Biometric Authentication": "biometric-authentication",
  "KYC Compliance": "kyc-compliance",
  "Identity Verification": "identity-verification",
  "AML": "aml",
  "Fraud Prevention": "fraud-prevention",
};

export function getCategorySlug(name: string): string {
  return CATEGORY_SLUGS[name] ?? name.toLowerCase().replace(/\s+/g, "-");
}

export function getCategoryName(slug: string): string {
  return Object.entries(CATEGORY_SLUGS).find(([, s]) => s === slug)?.[0] ?? slug;
}

export function getVendorBySlug(slug: string): Vendor | undefined {
  return vendors.find(v => v.slug === slug);
}

export function getVendorsByCategory(categoryName: string): Vendor[] {
  return vendors.filter(v => v.categories.includes(categoryName));
}

export function getOutboundUrl(vendor: Vendor): string {
  if (vendor.affiliate_url) return vendor.affiliate_url;
  return vendor.vendor_website;
}
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## СТРАНИЦЫ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### src/pages/vendors/index.astro — Каталог

SEO:
- title: "Compare Biometric Authentication Software 2026"
- description: "Compare 69+ identity verification and biometric authentication vendors. Pricing, ratings, and expert analysis."
- schema: ItemList со всеми вендорами

Layout:
- Sidebar (w-64, sticky) + главная область
- Sidebar = фильтр-компонент (React island)
- Главная = grid вендор-карточек

Фильтры передаются через URL params: `?category=kyc-compliance&rating=4&trial=true&sort=rating`
На сервере (во время build) рендерятся все вендоры.
React island на клиенте фильтрует по URL params без перезагрузки.

Featured вендоры выводятся первыми в каждой группе.

### src/components/catalog/VendorFilters.tsx — React island

Пропсы: categories: string[], initialParams: URLSearchParams

Состояние только в URL. Никакого useState для фильтров — читать/писать URLSearchParams.

Фильтры:
- Category: checkboxes (все категории из данных)
- Min Rating: select (3.0 / 3.5 / 4.0 / 4.5)
- Free Trial: checkbox
- Sort: select (Highest Rated / Most Reviewed / Name A-Z)

При изменении фильтра: обновить URL без перезагрузки страницы (`history.pushState`).
Фильтрация: скрывать/показывать карточки через CSS class (не удалять из DOM).

### src/components/catalog/VendorCard.astro

Пропсы: vendor: Vendor

Структура карточки:
1. Верхняя строка: лого (favicon fallback) + name + featured badge если vendor.featured
2. Primary category badge (первый элемент categories[])
3. Rating (font-mono, крупно) + reviews_count (мелко)
4. Pricing (1 строка из vendor.pricing)
5. Кнопка: "Get Quote" если featured, иначе "View Profile"

Ссылка карточки: /vendors/[vendor.slug]
Featured стиль: `border-blue-200 bg-blue-50/50` (light) / `border-blue-600/30 bg-blue-950/10` (dark)
Обычный: border-zinc-200 bg-white

Favicon: `https://www.google.com/s2/favicons?domain={vendor_website}&sz=64`
При ошибке загрузки — показать первую букву имени вендора в синем круге.

### src/pages/vendors/[slug].astro — Профиль вендора

getStaticPaths(): из vendors — один путь на каждый вендор у которого есть assessment MDX.
(Если assessment нет — страница не генерируется пока.)

SEO:
- title: `{vendor.name} Review 2026: Pricing, Features & Alternatives`
- description: первые 160 символов из assessment или из vendor.description (переписанного)
- schema: SoftwareApplication + AggregateRating + FAQPage + BreadcrumbList

Layout (2 колонки на desktop):
- Левая 70%: основной контент из assessment MDX + pricing plans таблица
- Правая 30%: sticky sidebar

Sidebar содержит:
- Рейтинг (крупно, font-mono) + количество отзывов
- Pricing summary (первый тарифный план или vendor.pricing)
- Кнопка "Get Quote" (если vendor.featured) → Tally popup (см. ниже)
- Кнопка "Visit Website" → /go/[slug] с rel="nofollow noopener"
- Источники данных (G2, Gartner, Capterra бейджи)

Если assessment MDX не существует для вендора — не генерировать страницу.

### src/pages/categories/[slug].astro — Категория

getStaticPaths(): из CATEGORY_SLUGS — один путь на каждую категорию.

SEO:
- title: `Best {categoryName} Software 2026: Compare {count} Tools`
- schema: ItemList + BreadcrumbList

Контент:
- H1 с названием категории
- Краткое описание категории (2-3 предложения — написать вручную для каждой)
- Featured вендоры сверху
- Все остальные вендоры этой категории (отсортированные по рейтингу)
- Ссылки на связанные blog посты (пока пустой массив — добавить в Phase 2)

### src/pages/go/[slug].astro — Affiliate редирект

getStaticPaths(): все вендоры.

Мета: `<meta name="robots" content="noindex, nofollow">`
Логика: мгновенный redirect на getOutboundUrl(vendor).

```astro
---
// В <head>:
// <meta http-equiv="refresh" content="0; url={outboundUrl}">
// <meta name="robots" content="noindex, nofollow">
---
```

Все исходящие ссылки на сайте ведут через /go/[slug].

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## LEAD CAPTURE — Tally форма
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Форма собирает лиды от B2B-покупателей которые кликают "Get Quote" на featured вендоре.

### Настройка Tally (один раз вручную)

1. Зарегистрироваться на tally.so
2. Создать форму с полями:
   - Full Name (text, required)
   - Work Email (email, required)
   - Company (text, required)
   - Team Size (dropdown: 1-10 / 11-50 / 51-200 / 200+)
   - What are you looking for? (textarea, optional)
   - Hidden field: vendor_name (заполняется автоматически)
3. В настройках формы: включить email уведомления на свой адрес
4. Скопировать Form ID из URL формы (например: `wMZkxB`)
5. Добавить Form ID в site.config.ts:

```ts
monetization: {
  affiliateRedirectBase: "/go/",
  featuredLabel: "Featured",
  tallyFormId: "wMZkxB",  // ← вставить свой ID
  leadFormWebhook: "",
},
```

### Подключение в BaseLayout.astro

Добавить перед закрывающим `</body>`:

```html
<script async src="https://tally.so/widgets/embed.js"></script>
```

### Кнопка "Get Quote" на vendor page

```astro
{vendor.featured && (
  <button
    data-tally-open={siteConfig.monetization.tallyFormId}
    data-tally-overlay="1"
    data-tally-hide-title="1"
    data-tally-vendor={vendor.name}
    class="w-full bg-blue-600 text-white rounded-md px-4 py-2.5 text-sm font-medium hover:bg-blue-700 transition-colors"
  >
    Get Quote
  </button>
)}
```

Tally автоматически добавляет vendor name как hidden field через `data-tally-vendor`.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## CONTENT COLLECTION — Assessments
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### src/content/config.ts

```ts
import { defineCollection, z } from "astro:content";

const assessments = defineCollection({
  type: "content",
  schema: z.object({
    vendor: z.string(),           // совпадает с vendor.slug
    lastUpdated: z.date(),
    author: z.string(),
    bestFor: z.string(),
    avoidIf: z.string(),
    integrationComplexity: z.enum(["Low", "Medium", "High"]),
    hasFreeTrialVerified: z.boolean().optional(),
  }),
});

const blog = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string(),
    author: z.string(),
    pubDate: z.date(),
    updatedDate: z.date().optional(),
    category: z.string(),
    featured: z.boolean().default(false),
    ogImage: z.string().optional(),
  }),
});

export const collections = { assessments, blog };
```

Создать папки: `src/content/assessments/` и `src/content/blog/`
Создать одну тестовую заглушку: `src/content/assessments/idenfy.mdx`

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## ПОРЯДОК СОЗДАНИЯ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Скопировать JSON → src/data/vendors.json, добавить slug/featured/affiliate_url поля
2. src/lib/vendors.ts
3. Создать Tally форму вручную → добавить tallyFormId в site.config.ts
4. Добавить Tally script в src/layouts/BaseLayout.astro
5. src/content/config.ts
6. src/content/assessments/idenfy.mdx (тестовая заглушка)
7. src/components/catalog/VendorCard.astro
8. src/components/catalog/VendorFilters.tsx
9. src/pages/vendors/index.astro
10. src/pages/vendors/[slug].astro
11. src/pages/categories/[slug].astro
12. src/pages/go/[slug].astro

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## КРИТЕРИЙ ГОТОВНОСТИ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

`npm run build` без ошибок.

В dist/:
  vendors/index.html
  vendors/idenfy/index.html (и другие вендоры с assessments)
  categories/kyc-compliance/index.html
  categories/identity-verification/index.html
  go/idenfy/index.html

Проверить в vendors/index.html:
- Все 69 вендоров в разметке
- Featured вендоры имеют класс с синей рамкой
- Фильтр-компонент подключён как React island

Проверить в vendors/idenfy/index.html:
- Schema JSON-LD: SoftwareApplication + AggregateRating
- Canonical: https://primebiometry.com/vendors/idenfy
- Sidebar с pricing и кнопками
- Кнопка "Visit Website" ведёт на /go/idenfy

Проверить в go/idenfy/index.html:
- meta robots: noindex, nofollow
- meta refresh redirect на idenfy.com
