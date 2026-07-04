# Opslync Frontend

A React dashboard for **Opslync**, an internal developer platform. It lets teams connect GitHub repositories, organize applications into projects, build and deploy them to Kubernetes, and operate running workloads — build/deployment history, live cluster and pod metrics, an in-browser pod shell, and container-registry / GitHub App management.

> Repository name (`react-admin-dashboard`) and `package.json` name (`newapp`) are historical: the project started from an admin-dashboard template and evolved into the Opslync product UI.

## Features

- **Authentication** — login, registration, forgot/change password; JWT stored in `localStorage`, private routing, and a 30-minute session timeout with a 5-minute warning (`src/components/session/SessionTimeout.jsx`).
- **Onboarding wizard** — guided first-run setup (organization → GitHub → cluster → first project), driven by a singleton `onboardingManager` that polls `onboarding/status` (`src/components/onboarding/`, which has its own README).
- **Projects & apps** — create/list projects, create apps from GitHub repos, per-app detail pages with tab navigation (details, build & deploy, build history, deployment history, metrics, configuration).
- **Build & deploy** — trigger builds, watch live build logs over WebSockets, view deployment history, and a visual workflow canvas (`src/components/workflow/WorkflowCanvas.jsx`).
- **Cluster operations** — cluster/node metrics dashboards (recharts), pod status with a 5-minute `localStorage` cache, pod events, and an interactive **pod shell** in the browser (`@xterm/xterm` over WebSocket).
- **Integrations** — GitHub App registration/installation/callback flow with automatic token refresh every 10 minutes (`src/utils/githubTokenManager.js`), and container (OCI) registry configuration.
- **UX infrastructure** — global error boundary, toast notifications (react-toastify `ToastContainer` plus a Redux-driven PrimeReact toast), responsive layout with collapsible sidebar.

## Tech Stack

| Concern | Technology |
|---|---|
| Framework | React 18 (JavaScript + JSX — no TypeScript) |
| Build tooling | Create React App (`react-scripts` 5, patched via `patch-package` for webpack-dev-server 5) |
| Routing | React Router **v5** (`Switch`, `component=`, `useHistory`) |
| State | Redux Toolkit + react-redux 7 |
| HTTP | axios 1.x via a thin wrapper (`src/library/api.js`) |
| Realtime | Native `WebSocket` (pod shell, build logs, metrics) |
| UI libraries | PrimeReact 10, MUI 5, Radix UI primitives (shadcn-style `src/components/ui/`); lucide-react / MUI / FontAwesome / Heroicons icons |
| Styling | Tailwind CSS 3 (+ `tailwindcss-animate`), PrimeReact theme (`lara-light-indigo`), PrimeFlex, bundled Bootstrap CSS, a few plain CSS files |
| Forms | Formik + Yup |
| Charts | recharts |
| Terminal | `@xterm/xterm` + fit/web-links addons |
| Dates | dayjs and moment (both present) |
| Testing | Jest + React Testing Library (CRA defaults) |

## Project Structure

```
├── public/                  # CRA static assets (index.html, manifest, icons)
├── patches/                 # patch-package patches (react-scripts → webpack-dev-server 5)
├── kubernetes/              # Deployment/Service/Ingress manifests for the frontend
├── Dockerfile               # Container image (see Deployment)
├── _redirects               # Netlify SPA fallback (/* → /index.html)
└── src/
    ├── App.jsx              # All route definitions (public + private)
    ├── index.js             # Entry: Redux Provider, ErrorBoundary, global CSS
    ├── components/
    │   ├── ui/              # shadcn-style Radix primitives (button, dialog, select…)
    │   ├── common/          # PrivateRoute, ToastManager, GitHubTokenStatus
    │   ├── layout/          # Layout, Header, Sidebar (the ones used by App.jsx)
    │   ├── app/, app-detail/, cluster/, dashboard/, metrics/, service/,
    │   │   workflow/, onboarding/, session/    # feature components by domain
    │   └── *.js             # older root-level components (header.js, sidebar.js,
    │                        #   layout.js…) — legacy duplicates of layout/
    ├── containers/          # Page-level components, grouped by domain
    │   ├── auth/  dashboard/  projects/  apps/  settings/  user/  test/
    ├── pages/               # ClusterPage, ServicesPage (newer pages outside containers/)
    ├── hooks/               # useAppDeployments, usePodStatus, useClusterMetrics…
    ├── library/             # Core plumbing
    │   ├── api.js           # get/post/put/deleteMethod (auth header, 401 handling)
    │   ├── constant.js      # Base URLs from env vars + API endpoint paths
    │   ├── helper.js        # getToken/CheckToken + a second PrivateRoute (legacy)
    │   └── store/           # THE Redux store (sidebar, toast, authentication)
    ├── store/               # Legacy duplicate store (sidebar only) — NOT used by index.js
    ├── constants/routes.js  # APP_ROUTES route-path constants + APP_TABS
    ├── config/              # github.config.js (GitHub App endpoints)
    ├── utils/               # githubTokenManager, onboardingManager, sessionTimeout,
    │                        #   formatters, metricsCalculator, github.utils
    ├── lib/utils.js         # cn() = clsx + tailwind-merge (duplicated in library/utils.js)
    ├── types/               # JSDoc typedef files (build, commit, workflow)
    ├── data/                # Mock/initial data (workflow, builds, commits)
    ├── styles/, assets/     # CSS, fonts, images
    └── app.test.js          # Smoke test
```

Note: `src/services/` and `src/components/features/` exist but are currently empty.

## Installation

Requires Node.js 18+ (the Docker image uses Node 22).

```bash
npm install
```

`npm install` runs a `postinstall` step (`patch-package`) that applies `patches/react-scripts+5.0.1.patch`. The `patches/` directory must be present or the dev server will not start.

## Running Development

```bash
npm start
```

Serves at `http://localhost:3000` (CRA dev server). There is no `npm run dev` alias.

## Build

```bash
npm run build        # production build into build/
```

## Environment Variables

CRA inlines env vars at **build time**; only `REACT_APP_`-prefixed vars reach the browser. Create a `.env` in the project root (none is committed):

```bash
# Backend REST API base (must end with /api/ — endpoint paths are appended directly)
REACT_APP_BASE_URL=http://localhost:8080/api/

# WebSocket base for pod shell / build logs / metrics
REACT_APP_WS_BASE_URL=ws://localhost:8080/

# Where the frontend itself is served (used to build GitHub App callback URLs)
REACT_APP_GITHUB_BASE_URL=http://localhost:3000

# Full sign-in endpoint (optional — defaults to <backend>/api/users/signin)
REACT_APP_LOGIN_URL=http://localhost:8080/api/users/signin
```

All have `localhost` defaults in `src/library/constant.js`. That file also references `process.env.BASE_URL` / `process.env.LOGIN_URL` as fallbacks — those are **dead code** under CRA (non-`REACT_APP_` vars are never inlined).

## Available Scripts

| Script | What it does |
|---|---|
| `npm start` | CRA development server with hot reload |
| `npm run build` | Production build into `build/` |
| `npm test` | Jest in watch mode (use `CI=true npm test -- --watchAll=false` for one-shot) |
| `npm run cp_redirect` | Copies `_redirects` into `build/` (Netlify SPA fallback) |
| `npm run build_netlify` | `build` + `cp_redirect` — the Netlify deploy artifact |
| `npm run eject` | CRA eject (one-way; avoid — the project relies on `patch-package` instead) |
| `postinstall` | Runs `patch-package` automatically after install |

## Architecture Overview

- **Routing** — every route is declared in `src/App.jsx` using React Router v5. Public auth routes come first; everything else nests under a `PrivateRoute` wrapping the shared `Layout`. Route path constants live in `src/constants/routes.js` (`APP_ROUTES`), though several routes in `App.jsx` are still string literals. `PrivateRoute` (`src/components/common/PrivateRoute.jsx`) redirects to `/login` when no token exists.
- **Components** — page-level components live in `src/containers/<domain>/` (plus two newer ones in `src/pages/`); they compose feature components from `src/components/<domain>/` and primitives from `src/components/ui/`.
- **API layer** — all REST calls go through `getMethod` / `postMethod` / `putMethod` / `deleteMethod` in `src/library/api.js`, which prepend `baseUrl`, attach `Authorization: Bearer <token>` from `localStorage`, and on a 401 clear storage and hard-redirect to `/login`. Realtime features open native WebSockets against `wsBaseUrl`.
- **State management** — the Redux store used by the app is `src/library/store/store.js` with three slices: `sidebar`, `toast`, `authentication` (login thunk + token). Server data is generally **not** kept in Redux; pages and custom hooks fetch via the API layer and hold results in local state (sometimes cached in `localStorage`, e.g. pod status for 5 minutes).
- **Authentication** — JWT in `localStorage.token`; `SessionTimeout` enforces a 30-minute inactivity logout; `githubTokenManager` (a singleton class with its own event system) keeps GitHub App tokens fresh on a 10-minute interval.
- **Reusable utilities** — `cn()` class-merging helper (`src/lib/utils.js`), formatters and metrics calculators in `src/utils/`, shared route/tab constants in `src/constants/`.

## Coding Standards

- JavaScript with JSX (`.jsx` for components, `.js` for logic); no TypeScript — lightweight JSDoc typedefs live in `src/types/`.
- Functional components with hooks throughout; the only class-based code is the `ErrorBoundary` and the non-React singleton managers.
- PascalCase files for components (`AppDetailPage.jsx`), camelCase for hooks/utils (`usePodStatus.js`), kebab-case for `components/ui` primitives (shadcn convention).
- Custom hooks per data domain (`useAppDeployments`, `useClusterMetrics`, …) wrap fetching and polling.
- Forms use Formik with Yup validation schemas.
- Linting is CRA's built-in ESLint (`react-app` config), run during `npm start`/`build`. Prettier 3 is a dev dependency, but its config file is misnamed `src/.preetierrc` (typo, non-standard location, invalid `singleQuite` key), so it is effectively unused.

## Deployment

**Docker / Kubernetes** (primary path):

```bash
docker build -t opslync/opslync-frontend:<tag> .
kubectl apply -f kubernetes/deployment.yaml
```

The Dockerfile installs with `npm ci` (copying `patches/` first so `patch-package` applies), runs a production build, and — deliberately — starts the CRA dev server (`npm start`) as the container command: `kubernetes/deployment.yaml` injects `REACT_APP_BASE_URL` / `REACT_APP_WS_BASE_URL` at **runtime**, and CRA can only pick env vars up at compile time. The Service exposes port 3000; host/TLS routing is handled by `kubernetes/ingress.yaml`.

**Netlify**: `npm run build_netlify` produces `build/` including the `_redirects` SPA fallback.

## Future Improvements

- **Serve a static build in production** — replace the dev-server-in-container pattern with build args or a runtime `env.js`, plus a static file server.
- **Migrate off Create React App** (unmaintained) to Vite; this would also remove the `patch-package`/`overrides` maintenance burden.
- **Consolidate duplicates**: two Redux stores (`src/library/store` vs unused `src/store`), two `cn()` utilities, legacy root-level `header.js`/`sidebar.js`/`layout.js` beside `components/layout/`, two toast systems, moment + dayjs, and two `module.exports` blocks in `tailwind.config.js` (only the second takes effect).
- **Reduce UI-library overlap** (PrimeReact + MUI + Radix/shadcn in one bundle; main JS is ~620 kB gzipped) and add route-level code splitting.
- Remove dev/test routes (`/dev/onboarding`, `/test/onboarding`) from production builds.
- Move the JWT out of `localStorage` (XSS-readable) toward httpOnly cookies, and strip `console.log` calls from production code.
- Fix the misnamed Prettier config and adopt a single enforced format.
- Grow test coverage beyond the single smoke test.
