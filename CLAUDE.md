# CLAUDE.md

## Approach

- Read existing files before writing. Don't re-read unless changed.
- Thorough in reasoning, concise in output.
- Skip files over 100KB unless required.
- No sycophantic openers or closing fluff.
- No emojis or em-dashes.
- Do not guess APIs, versions, flags, commit SHAs, or package names. Verify by reading code or docs before asserting.
- Keep solutions simple and direct. No over-engineering.
- User instructions always override this file.

---

## Commands

```bash
npm run dev     # Dev server at http://0.0.0.0:80
npm run build   # TypeScript check + Vite build
npm run lint    # ESLint
```

No test framework configured.

## Architecture

React + TypeScript SPA (MES) — production, quality, inventory, equipment management.

### Structure

```
src/
├── api/{domain}/       # axios API calls
├── modules/{domain}/   # domain-first feature code
│   ├── index.tsx       # nested <Routes>
│   ├── {feature}/
│   │   ├── Page.tsx
│   │   ├── *Types.ts
│   │   └── components/
│   └── types.ts        # shared domain types
├── components/         # Sidebar, Topbar, SubmenuBar, DateInput, etc.
├── hooks/              # useAuth, useActiveSubmenu
├── layouts/            # BaseLayout
├── pages/              # Login, Register
└── styles/{domain}/    # CSS Modules
```

Domains: `dashboard`, `project`, `quality` (IQC/LQC/OQC), `plant`, `stock`, `draw`, `etc`

### Routing

- `App.tsx` — top-level routes with `<ProtectedRoute>`
- `src/modules/menuConfig.ts` — centralized nav config
- Sub-page state via query params (`?menu=Summary`)
- `processConfig.ts` — dynamic submenus (OQC processes)

### Data

- axios with `withCredentials: true` (cookie auth)
- `VITE_API_BASE_URL` resolves to `/api`
- React Query — 5-min staleTime, custom hooks per module

### Auth

- `useAuth` calls `/api/auth/status` on load
- `<ProtectedRoute>` redirects to `/login`
- Dev proxy: `vite.config.ts` forwards `/api` to `VITE_API_TARGET`

### Conventions

- Types in `*Types.ts` (local) or `modules/{domain}/types.ts` (shared)
- CSS Modules (`.module.css`)
- Notifications: `react-hot-toast`
- Charts: `react-chartjs-2`
- Excel export: ExcelJS + file-saver
