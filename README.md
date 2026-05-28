# WPS Yundoc Admin Console

React admin console for WPS Yundoc business-system and permission management.

This repository is intentionally separate from the backend repository. Keep frontend code,
Node tooling, UI tests, and frontend standards here; keep Java services, database migrations,
and backend contracts in the backend repository.

## Runtime

- Node: `>=16 <17`
- npm: `>=8 <10`
- React: 18
- Vite: 4.5.x

Use `.nvmrc` before installing dependencies:

```bash
nvm use
npm ci
```

On machines that cannot switch away from a newer global Node version, dependency install may
need `npm install --engine-strict=false` for local recovery only. CI should use Node 16.

## Local Development

Start the backend first on `http://localhost:8080`, then start the frontend:

```bash
npm run dev
```

Vite proxies `/api` to the backend. Do not copy backend secrets into frontend files or docs.
Local database credentials belong in shell environment variables for the backend process.

## Verification

Run these before opening a PR:

```bash
npm test
npm run lint
npm run build
```

Browser E2E is intentionally not enabled while the project is pinned to Node 16. The patched
Playwright versions that clear current high-severity audit findings require Node 18+, so add
browser E2E after the runtime constraint changes.

## Sonar

Generate coverage before Sonar when CI expects coverage metrics:

```bash
npm run coverage
npm run sonar
```

See `docs/coding-standards.md` for code style, security rules, testing scope, and Sonar policy.

## Git

Remote repository:

```text
https://github.com/a1351995160/wps-yundoc-admin-console.git
```
