# CLAUDE.md

Permanent project instructions for Claude sessions working on this repository.

## Project Overview

This is the **Opslync frontend** — a React dashboard for an internal developer platform. Users connect GitHub repositories, group applications into projects, build and deploy them to Kubernetes, and operate them: build/deployment history, live cluster and pod metrics, an in-browser pod shell (xterm over WebSocket), GitHub App and container-registry management, plus a first-run onboarding wizard. The names `react-admin-dashboard` (repo) and `newapp` (package.json) are leftovers from the template this grew out of.

## Tech Stack

- React 18, **JavaScript + JSX only** (no TypeScript; JSDoc typedefs in `src/types/`)
- Create React App (`react-scripts` 5) — **patched via `patch-package`**, see Build Tooling Warnings below
- React Router **v5** (`Switch`, `component=` props, `useHistory` — *not* v6 APIs)
- Redux Toolkit + react-redux 7 (UI/auth state only)
- axios 1.x behind `src/library/api.js`; native `WebSocket` for realtime
- UI: PrimeReact 10 + MUI 5 + Radix/shadcn-style primitives in `src/components/ui/`
- Styling: Tailwind CSS 3, PrimeReact `lara-light-indigo` theme, PrimeFlex, bundled Bootstrap CSS
- Forms: Formik + Yup · Charts: recharts · Terminal: `@xterm/xterm` · Dates: dayjs (preferred) and moment (legacy, both installed)
- Tests: Jest + React Testing Library (CRA defaults)

## Folder Structure

- `src/App.jsx` — **all** route definitions. `src/index.js` — Redux Provider, ErrorBoundary, global CSS imports.
- `src/containers/<domain>/` — page-level components (auth, dashboard, projects, apps, settings, user, test). `src/pages/` holds two newer pages (ClusterPage, ServicesPage); prefer `containers/` for consistency unless extending `pages/`.
- `src/components/<domain>/` — feature components (app, app-detail, cluster, dashboard, metrics, service, workflow, onboarding, session, layout, common).
- `src/components/ui/` — shadcn-style Radix primitives (kebab-case files). Use these for new UI before reaching for MUI/PrimeReact.
- `src/components/common/` — `PrivateRoute`, `ToastManager`, `GitHubTokenStatus`.
- `src/library/` — core plumbing: `api.js` (HTTP methods), `constant.js` (env-derived base URLs + endpoint path constants), `helper.js` (`getToken`), `store/` (**the** Redux store: sidebar, toast, authentication slices).
- `src/hooks/` — data-fetching hooks (`useAppDeployments`, `usePodStatus`, `useClusterMetrics`, …).
- `src/utils/` — singleton managers (`githubTokenManager`, `onboardingManager`), `sessionTimeout`, `formatters`, `metricsCalculator`, `github.utils`.
- `src/constants/routes.js` — `APP_ROUTES` and `APP_TABS`. `src/config/github.config.js` — GitHub App endpoints.
- `src/data/` — mock/initial data. `src/lib/utils.js` — the `cn()` helper used by `components/ui`.
- `patches/` — patch-package patches; `kubernetes/` — deploy manifests; `Dockerfile`; `_redirects` — Netlify SPA fallback.

### Known duplications — do not make them worse

- **Two Redux stores**: `src/library/store/store.js` is the real one (wired in `index.js`); `src/store/` (sidebar only) is legacy and unused. Never import from `src/store/`.
- **Two `cn()` helpers**: `src/lib/utils.js` and `src/library/utils.js` are identical. `components/ui` imports from `src/lib/utils.js` — use that one.
- **Two layout generations**: `src/components/layout/{Layout,Header,Sidebar}.jsx` are current (used by `App.jsx`); root-level `src/components/{layout,header,sidebar,toast}.js` are legacy (still referenced by the legacy `PrivateRoute` in `library/helper.js`).
- **Two `PrivateRoute`s**: use `src/components/common/PrivateRoute.jsx` (the one `App.jsx` uses), not the one in `library/helper.js`.
- **Two toast systems**: react-toastify (`toast(...)`) and the Redux `toast` slice rendered by PrimeReact. Match whichever the file you're editing already uses.
- `tailwind.config.js` contains **two** `module.exports` blocks; only the second (shadcn-style, with `tailwindcss-animate`) takes effect.
- `src/services/` and `src/components/features/` are empty placeholder directories.

## Architecture Rules

- **Routing**: declare routes only in `src/App.jsx`. Public auth routes sit outside; everything else nests under `PrivateRoute` + `Layout`. Add new path constants to `APP_ROUTES` in `src/constants/routes.js` rather than inlining strings. This is React Router **v5** — use `useHistory`/`useParams`/`Switch`, never v6 APIs (`useNavigate`, `Routes`).
- **API calls**: always go through `getMethod`/`postMethod`/`putMethod`/`deleteMethod` from `src/library/api.js` — they attach the Bearer token and handle 401 logout. Never instantiate raw `axios` in components (a few legacy files do; don't copy them). Endpoint paths are relative to `baseUrl` (which already ends in `/api/`).
- **State**: Redux is only for cross-cutting UI/auth state (sidebar, toast, authentication). Server data lives in component state or custom hooks — follow that split; don't add server-data slices.
- **Custom hooks**: one hook per data domain in `src/hooks/`, wrapping fetch + polling + caching. Reuse or extend an existing hook before writing a new one.
- **Singletons**: long-lived cross-page behavior (GitHub token refresh, onboarding status) lives in plain-class singletons in `src/utils/` with listener/subscribe APIs, initialized from `App.jsx`.
- **WebSockets**: connect to `wsBaseUrl` from `src/library/constant.js`; components own their socket lifecycle (open in `useEffect`, close in cleanup) — see `PodShell.jsx`.

## Coding Guidelines

- Never duplicate components — this repo already suffers from it; check the duplication list above first.
- Reuse existing utilities (`cn`, `formatters`, `metricsCalculator`) before writing new ones.
- Keep components small; extract feature components into `src/components/<domain>/`.
- Prefer composition over inheritance; functional components + hooks only (no new class components except error boundaries).
- Follow existing naming: PascalCase `.jsx` components, camelCase `.js` hooks/utils, kebab-case `components/ui` primitives.
- Keep business logic out of UI components — put it in hooks, `src/utils/`, or the API layer.
- No TypeScript — this is a JS project; add JSDoc typedefs in `src/types/` if type documentation helps.
- Do not introduce new dependencies without strong justification; the bundle already carries three UI libraries. In particular, don't add a fourth date or UI library — prefer dayjs and `components/ui`/PrimeReact.
- Maintain the existing code style of the file you're editing (the Prettier config is broken/unused — see below — so consistency is manual).

## Development Workflow

When making changes:

1. Read related files first.
2. Understand existing patterns (especially which of the duplicate systems the touched code uses).
3. Make the smallest possible change.
4. Avoid breaking public APIs (route paths, exported helpers, Redux action names).
5. Update documentation (README.md, this file, `src/components/onboarding/README.md`) if behavior changes.

Verification commands:

```bash
npm start                                   # dev server on :3000 (lint runs inline)
npm run build                               # production build (fails on lint errors)
CI=true npm test -- --watchAll=false        # one-shot test run
npm audit                                   # keep at 0 — see Build Tooling Warnings
```

## React Guidelines

- **Hooks**: data fetching lives in `src/hooks/` or in-component `useEffect` + async function; cleanup functions close sockets/intervals.
- **Props**: plain destructured props, no PropTypes; document non-obvious shapes with JSDoc.
- **State**: `useState` locally; Redux only for the three existing slices.
- **Effects**: initialization effects run once (`[]` deps) from `App.jsx` for app-wide managers.
- **Memoization**: not systematically used; don't add `useMemo`/`useCallback` speculatively.
- **Routing**: v5 idioms only (`useHistory().push(...)`, route params via `useParams`).
- **Forms**: Formik + Yup schema per form (see `containers/auth/*`).
- **Error handling**: API wrapper logs and rethrows; callers catch and show a toast. The global `ErrorBoundary` (class component in `src/components/errorboundary.js`) catches render errors. Auth failures (401) are handled centrally in `api.js`.

## Styling Rules

- Tailwind utility classes are the default for new components (`cn()` from `src/lib/utils.js` for conditional classes).
- PrimeReact components keep their theme (`lara-light-indigo`) with overrides in `src/assets/css/primereact-override.css`.
- Global CSS (bootstrap.css, fonts, index.css, app.css) is imported once in `src/index.js`; component-specific CSS files live in `src/styles/`. Prefer Tailwind over new CSS files.
- Dark mode is configured (`darkMode: ["class"]`) but not implemented app-wide.

## API Rules

- Use the `src/library/api.js` methods; never hand-roll fetch/axios calls in components.
- Add reusable endpoint path constants to `src/library/constant.js`.
- Auth token comes from `localStorage.token` via `getToken()` (`library/helper.js`); do not read localStorage directly for auth in new code.
- Base URLs come from `REACT_APP_BASE_URL`, `REACT_APP_WS_BASE_URL`, `REACT_APP_GITHUB_BASE_URL`, `REACT_APP_LOGIN_URL` (build-time inlined by CRA; `localhost` defaults in `constant.js`). Non-`REACT_APP_` fallbacks in that file are dead code.

## File Creation Rules

Before creating a new file:

- Search for an existing implementation — duplicates already exist here; don't add more.
- Extend existing modules (hooks, utils, constants) when appropriate.
- New pages go in `src/containers/<domain>/`; new feature components in `src/components/<domain>/`; new primitives in `src/components/ui/`.
- Avoid duplicate functionality across the legacy/current pairs listed under Known duplications.

## Refactoring Rules

- Preserve behavior; this app has no meaningful test safety net, so verify manually (build + dev server + affected flow).
- Keep commits small and focused.
- Avoid unnecessary rewrites — especially do not "modernize" React Router v5 code to v6 idioms or convert files to TypeScript as a side effect of another change.
- When consolidating a known duplication, migrate all imports and delete the legacy file in the same focused change.

## Build Tooling Warnings (load-bearing, do not undo)

- `package.json` `overrides` pin patched versions of vulnerable transitive deps (nth-check, postcss, serialize-javascript, underscore, uuid, @tootallnate/once, webpack-dev-server 5). react-scripts is unmaintained and will never ship these fixes — **do not remove the overrides**; `npm audit` should stay at 0.
- `patches/react-scripts+5.0.1.patch` (applied by the `postinstall` script) rewrites CRA's dev-server config for webpack-dev-server 5 (`setupMiddlewares`, `server:` option). Without it `npm start` fails with a schema validation error. The Dockerfile copies `patches/` before `npm ci` for this reason.
- The Dockerfile **deliberately** runs `CMD ["npm","start"]` (dev server) in production: `kubernetes/deployment.yaml` injects `REACT_APP_*` env vars at container runtime, and CRA inlines env only at build time. Switching to static serving requires moving env injection to build args or a runtime `env.js` first — don't change the CMD casually.
- The Prettier config at `src/.preetierrc` is misnamed (typo), in the wrong location, and contains invalid keys — Prettier does not pick it up. Don't reformat whole files based on it.

## Testing

- Jest + React Testing Library via CRA (`src/setupTests.js` loads `@testing-library/jest-dom`).
- Current coverage is a single smoke test (`src/app.test.js`) that renders `<App />` inside the Redux `Provider` — new tests must wrap components in `Provider` (and Router context where needed).
- Run one-shot with `CI=true npm test -- --watchAll=false`.
- There are no e2e tests. For risky changes, manually verify with `npm start`.

## AI Assistant Instructions

When working on this repository:

- Always understand context before editing — read the file and its imports first.
- Preserve the existing architecture (containers/components split, API wrapper, v5 routing, Redux slice boundaries).
- Avoid speculative changes and drive-by refactors.
- Explain major architectural decisions before implementing them.
- Keep changes incremental; one concern per commit.
- Prefer maintainability over cleverness.
- Ask questions when requirements are ambiguous — especially before touching the build tooling items listed above, auth/session behavior, or deployment files.
