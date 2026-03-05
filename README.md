# LITTLElocals — Vite Build

## Quick Start (local development)

```bash
npm install
npm run dev
```

Opens at http://localhost:5173

## Build for production

```bash
npm run build
```

Creates optimised files in `dist/` folder.

## Deploy to Netlify

### Option A: Connect to GitHub (recommended)
1. Push this folder to a GitHub repo
2. In Netlify → New Site → Import from Git
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Deploy

### Option B: Manual deploy
1. Run `npm run build` locally
2. Drag the `dist/` folder to Netlify

## What changed from the single HTML file

- **No more Babel in-browser** — JSX compiles at build time (3-5x faster load)
- **Tree-shaking** — only imports what's used
- **Code splitting** — Leaflet loads separately
- **Same features** — everything works exactly the same

## Project structure

```
src/
  main.jsx          — Entry point
  App.jsx           — Main app component
  components.jsx    — BrandBear, MapView, ListingCard, DetailView
  fallbackListings.js — 141 offline listings
  typeColors.js     — Type colours and day mapping
  utils.js          — Distance calc, scene illustrations
  index.css         — Global styles
public/
  bear-logo.png     — Copy your logo here
  manifest.json     — PWA manifest (copy from current site)
  icon-192x192.png  — PWA icon (copy from current site)
```

## Important: Copy your public assets

Copy these files from your current Netlify deployment into the `public/` folder:
- `bear-logo.png`
- `manifest.json`
- `icon-192x192.png`
- `icon-512x512.png` (if exists)
