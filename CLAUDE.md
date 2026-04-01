# CLAUDE.md

## Approach
- Think before acting. Read existing files before writing code.
- Be concise in output but thorough in reasoning.
- Prefer editing over rewriting whole files.
- Do not re-read files you have already read unless the file may have changed.
- Test your code before declaring done.
- No sycophantic openers or closing fluff.
- Keep solutions simple and direct. No over-engineering.
- If unsure: say so. Never guess or invent file paths.
- User instructions always override this file.

## Efficiency
- Read before writing. Understand the problem before coding.
- No redundant file reads. Read each file once.
- One focused coding pass. Avoid write-delete-rewrite cycles.
- Test once, fix if needed, verify once. No unnecessary iterations.
- Budget: 50 tool calls maximum. Work efficiently.

---

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server at http://0.0.0.0:80
npm run build     # TypeScript check + Vite production build
npm run lint      # ESLint validation
npm run preview   # Preview production build
```

No test framework is configured.

## Architecture

This is a **Manufacturing Execution System (MES) frontend** — a React + TypeScript SPA for managing production, quality control, inventory, and equipment.

### Module Structure

Feature code lives in `src/modules/{domain}/`, organized domain-first:

```
src/
├── api/{domain}/          # API service functions (axios calls)
├── modules/{domain}/
│   ├── index.tsx          # Nested <Routes> for the domain
│   ├── {feature}/
│   │   ├── Page.tsx       # Main page component
│   │   ├── *Types.ts      # Local TypeScript interfaces
│   │   ├── *Service.ts    # Module-level service (sometimes here, sometimes in api/)
│   │   └── components/    # Feature-specific components
│   └── types.ts           # Shared types for the domain
├── components/            # Shared UI (Sidebar, Topbar, SubmenuBar, DateInput, etc.)
├── hooks/                 # useAuth, useActiveSubmenu
├── layouts/               # BaseLayout (wraps authenticated routes)
├── pages/                 # Login, Register
└── styles/{domain}/       # CSS Modules mirroring module structure
```

**Domains:** `dashboard`, `project`, `quality` (IQC/LQC/OQC), `plant`, `stock`, `draw`, `etc`

### Routing & Navigation

- `App.tsx` — top-level routes with `<ProtectedRoute>` wrapper
- Each domain has its own `modules/{domain}/index.tsx` with nested `<Routes>`
- `src/modules/menuConfig.ts` — centralized menu/navigation structure
- Sub-page state passed via query params (e.g. `?menu=Summary`)
- `processConfig.ts` files generate dynamic submenus (e.g. for OQC processes)

### Data Layer

All API calls use axios with `withCredentials: true` (cookie auth):

```typescript
const API_BASE = import.meta.env.VITE_API_BASE_URL; // resolves to /api
const res = await axios.get(`${API_BASE}/some/endpoint`, { withCredentials: true });
```

React Query manages server state — queries use 5-minute staleTime by default. Custom hooks in module files wrap `useQuery`/`useMutation` and encapsulate query keys and transformations.

### Authentication

- `useAuth` hook calls `/api/auth/status` on load
- `<ProtectedRoute>` redirects unauthenticated users to `/login`
- Dev proxy in `vite.config.ts` forwards `/api` to `VITE_API_TARGET` (set in `.env`)

### Key Conventions

- **Types:** defined close to usage in `*Types.ts` files; shared domain types in `modules/{domain}/types.ts`
- **Styling:** CSS Modules (`.module.css`), organized parallel to module structure
- **Notifications:** `react-hot-toast` for user feedback
- **Charts:** Chart.js via `react-chartjs-2`
- **Excel export:** ExcelJS + file-saver
