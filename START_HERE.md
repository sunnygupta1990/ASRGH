# ASRGH V2 — Start Here

## 1. Install Node.js
Use Node.js 20 LTS or newer.

## 2. Open a terminal in this project folder

## 3. Install dependencies

    npm install

## 4. Start development

    npm run dev

Open the local URL printed by Vite, normally:

    http://localhost:5173

## 5. Production build

    npm run build

## 6. Type checking

    npm run typecheck

## UAT

Use `UAT_TEST_SCENARIOS_V2.md`.

The prototype intentionally uses browser localStorage so the complete public/admin workflow can be tested before the backend is built.

## Core business rule

One Event -> One Album -> Multiple Photos.

The admin can select multiple local photos from the computer for an event album. Images are resized in-browser for the prototype and stored locally.

## Reset demo data

Use the reset option in Admin Settings to return the browser demo to the seeded UAT data.
