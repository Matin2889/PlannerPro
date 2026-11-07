# PlannerPro — PWA Package

Smart Study & Routine Planner (bilingual EN / FA)

## Contents
- `index.html` — full self-contained app
- `manifest.webmanifest` — Web App Manifest (installable)
- `sw.js` — Service Worker (offline cache + notification support)
- `icons/` — all required icon sizes (16 → 1024) + maskable + Apple touch + favicon

## How to use / deploy
1. Upload the **entire folder** to any static host (GitHub Pages, Netlify, Vercel, Cloudflare Pages, your own server, etc.).
2. Open the site over **HTTPS** (required for Service Worker + Notifications).
3. On Android Chrome: menu → “Add to Home screen” / Install app.
4. On iPhone Safari: Share → “Add to Home Screen”.

## Features already integrated
- Day / Night theme with **device preference** sync (`prefers-color-scheme`)
- Language (EN / FA) persistence
- Notification system (master toggle, types, diagnostics, test notification)
- Service Worker shows notifications and handles click → focus app
- Offline caching of core assets
- Standalone display, status bar styling for iOS

## Icon source
The provided logo (graduation cap + calendar + clock + open book, neon style) was resized to all standard PWA sizes.

## Notes
- For best notification experience keep the site open or installed as PWA.
- Theme color meta is updated dynamically by the app when switching day/night.
- No external dependencies — everything is offline-capable after first visit.

---
PlannerPro © 2026
