# Dev Setup — PrimeBiometry

## Vite — три версии одновременно

`@tailwindcss/vite@4.x` устанавливает `vite@8.0.15` как зависимость. `@vitejs/plugin-react` импортирует `vite/internal` из неё → получает rolldown native plugin → несовместим с Astro's bundled `vite@6.4.2` → `Missing field 'moduleType'` в dev-консоли.

**Это не баг сайта.** Страницы грузятся (200). Только шум в логах.

## После каждого `npm install <пакет>`

```bash
sed -i '' 's/nativePlugin = (await import("vite\/internal"))/\/\/ nativePlugin = (await import("vite\/internal"))/' node_modules/@vitejs/plugin-react/dist/index.js
```

`package.json` содержит `overrides` для `@vitejs/plugin-react → vite@7.3.3`, но из-за peer dep это не всегда создаёт nested install — поэтому нужен ручной патч.

## Версии

| Пакет | Версия |
|---|---|
| astro | 5.18.2 |
| @astrojs/react | 5.0.6 |
| @vitejs/plugin-react | 5.2.0 |
| vite (top-level, от @tailwindcss/vite) | 8.0.15 |
| vite (astro bundled) | 6.4.2 |
| vite (@astrojs/react bundled) | 7.3.3 |
