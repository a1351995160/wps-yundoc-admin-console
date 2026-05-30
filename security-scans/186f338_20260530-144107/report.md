# Security Scan Report - E:\wps-yundoc-admin-console

## Executive Summary
No high/critical production frontend vulnerability was found. The meaningful issue is a development-environment exposure: the Vite dev server binds to all interfaces while proxying `/api` to the local backend.

## Finding

### F-001 Low/Medium - Dev server exposes local backend proxy on the LAN
Evidence:
- `package.json:11` runs `vite --host 0.0.0.0`.
- `vite.config.ts:30` proxies `/api` to `http://localhost:8080`.

Impact: while a developer is running frontend and backend locally, a same-LAN attacker can access `http://developer-host:5173/api/...` and reach APIs that may otherwise be assumed local-only.

Recommended fix: default dev script to localhost, for example `vite --host 127.0.0.1`, and add a separate explicit LAN script only when needed.

## Checked And Not Found
- XSS: no raw HTML/eval sinks were found; backend values render through React text interpolation.
- Token storage: `sessionStorage` stores only admin session expiry, not JWTs or WPS tokens.
- CSRF client: requests include credentials and send `X-CSRF-Token` from the CSRF cookie.
- Path construction: dynamic API path segments use `encodeURIComponent`.
- Frontend RBAC prefetch: privileged queries are gated by current admin role checks.
- Secret handling: client secrets are one-time modal values and are cleared after close.
- Dependency audit: `npm audit --registry=https://registry.npmjs.org --json` returned 0 vulnerabilities across 615 dependencies.
