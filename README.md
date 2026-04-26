# CinemaFrontend

Cinema-themed frontend application built with **React 19 + TypeScript + Vite**.

## Project structure

- `app/` – main frontend source code and configuration.
- `app/src/sections` – page-level sections and route views.
- `app/src/components/ui` – reusable UI components.
- `app/src/hooks` – API and authentication hooks.

## Requirements

- Node.js 20+
- npm 10+

## Local development

```bash
cd app
npm install
npm install kimi-plugin-inspect-react
npm run dev
```

The Vite dev server runs on `http://localhost:3000` by default.

## Build

```bash
cd app
npm run build
```

## Lint

```bash
cd app
npm run lint
```

## Backend API

The frontend currently calls the backend at:

- `http://localhost:8080/cinema`

If your backend runs elsewhere, update the `API_BASE` constant in:

- `app/src/hooks/useAuth.tsx`
- `app/src/hooks/useApi.ts`
