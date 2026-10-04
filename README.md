# CRAVINGS – Satisfy Your Hunger

React + Vite frontend, mock data only (no backend). Run:

    npm install
    npm run dev

## Images
By default every card shows a generated food illustration (`src/components/art.js`). If a real photo exists at the manifest path under `public/images/`, it is used instead, so you can add real photos any time.

## Real photos (optional, one command)
Get a free key at https://www.pexels.com/api/ then run:

    npm run images:download -- YOUR_KEY

This fetches a photo for every required image into `public/images/` and writes `PHOTO_CREDITS.md`. Results are search matches, so look through them and replace any that do not fit the dish (just overwrite the file).

All images are local files under `public/images/`. The app works before they exist: any missing photo shows a plain
"Photo missing" tile with the exact file path to add. No initials, gradients or emoji stand in for food.

- `IMAGE_MANIFEST.md` : checklist of all 128 required files, grouped by folder (regenerate: `npm run images:manifest`)
- `npm run images:check` : lists every missing file (also flags files under 8 KB); exits non-zero if any are missing
- In dev, a red bar appears when the current page has missing photos; open `http://localhost:5173/#/assets` for the live checklist
- Save photos as JPG with the exact filenames, about 1200px wide, under ~300 KB. Use only images you have rights to use (Unsplash, Pexels, or your own)
- `public/images/hero/hero-spread.jpg` is the home hero background (CSS background; plain dark green until added)

## Structure
    src/data/catalog.js     restaurants, dishes, regions, offers, categories, search, pricing (replace with /api/* calls)
    src/lib/helpers.js      router hook, localStorage hook, context
    src/components/         ui.js (Photo, cards, SearchBar), Layout.js (Nav, Footer)
    src/pages/              pages.js (all pages), Assets.js (image checklist)
    src/App.js              global state: cart, favourites, auth, orders, coupons, routes
Routing is a small hash router (`#/restaurant/1`); cart/favourites/orders persist in localStorage (keys `cr2_*`).
Demo login: demo@cravings.in / demo123. Restaurants are fictional.
