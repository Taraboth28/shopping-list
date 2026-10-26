# Shopping List

Manage shopping lists, price each item (qty × unit price) and estimate what you'll pay — in USD and KHR.

- Laravel 12 serves the page shell; Vue 3 + Tailwind CSS v4 run the app.
- All data is stored in the browser's localStorage (`shopping-list:v1`). Use **Settings → Export JSON** to back it up.

## Run locally

Requires PHP 8.2+ (Laragon PHP 8.3), Composer and Node 20+.

```bash
composer install
npm install
npm run dev              # Vite dev server
php artisan serve        # http://127.0.0.1:8000
```

`npm run build` produces the production assets in `public/build`.

## Code map

- `resources/js/stores/shoppingStore.js` — state, localStorage persistence, list/item actions, import/export
- `resources/js/utils/totals.js` — line totals, estimate, bought/remaining, budget status
- `resources/js/utils/money.js` — USD/KHR conversion and formatting
- `resources/js/pages/` — lists overview, list detail, settings
