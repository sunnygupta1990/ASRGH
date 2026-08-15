# ASRGH.COM — Frontend V2 (Node/Vite)

Aggarwal Sabha Rohini Group Housing public website and browser-based Admin Panel prototype.

## Requirements

- Node.js 20 LTS or newer
- npm 10 or newer

## Run locally

```bash
npm install
npm run dev
```

Then open the URL printed by Vite (normally `http://localhost:5173`).

## Production build

```bash
npm run build
npm run preview
```

## What is included

### Public website
- Home
- About
- Current Management
- Members directory and profiles
- Social Work categories and activities
- Events
- One Event → One Album → Multiple Photos
- Gallery and lightbox
- Announcements
- Contact form
- Global search
- Mobile navigation
- Accessibility text-size controls

### Admin Panel
- Dashboard
- Members and current management
- Events and albums
- Multi-photo local upload preview
- Social Work
- Announcements
- Gallery
- Contact requests
- Excel import/validation
- Accepted/rejected record workflow
- Notifications
- Audit log
- Settings
- Employees/roles and permissions

## UAT behavior

The prototype uses browser `localStorage` for demo persistence. It does not require a backend or database.

Use the Admin button in the site header to open the admin portal. The demo credentials are shown on the login screen.

For the complete test plan see `UAT_TEST_SCENARIOS_V2.md`.

## Important architecture rule

An event has exactly one album. The album can contain many photos. This UI intentionally models that relationship so the eventual backend can enforce the same constraint.

## Backend phase

After UAT approval, the frontend data contracts can be connected to the production API/database without redesigning the public/admin workflows.
