# Frontend Coding Standards

## Scope

This document defines the baseline for the React admin console. The frontend lives in its own repository and consumes the backend only through HTTP APIs. Do not copy backend Java enums, Maven artifacts, secrets, or generated server code into this repo.

## Runtime And Tooling

- Use Node 16 for local development and CI. The project pins this through `.nvmrc`, `package.json#engines`, and `.npmrc`.
- Use React 18, TypeScript strict mode, Vite 4.5.x, ESLint 8.x, Vitest 0.34.x, and npm lockfiles.
- Do not upgrade to Vite 5, ESLint 9, or packages that require Node 18+ until the runtime constraint changes.

## Project Structure

- `src/app`: app bootstrap, providers, router, and global shell wiring.
- `src/features/<feature>`: feature API clients, pages, forms, hooks, and types.
- `src/shared/api`: transport, API response envelopes, and shared error handling.
- `src/shared/ui`: reusable presentational components without feature-specific business logic.
- `src/shared/utils`: pure helpers with unit tests.
- Keep files focused. Prefer several small feature files over one large page file.

## React And TypeScript Style

- Use function components and named exports.
- Keep state close to where it is used; promote it to hooks or providers only when multiple features need it.
- Use explicit domain types at API boundaries. Avoid `any`.
- Keep components readable: extract subcomponents when a component becomes hard to scan, not preemptively.
- Use immutable updates for arrays and objects.

## API And Security

- The backend is the authorization boundary. Frontend route guards and button states are experience controls only.
- Store the MVP admin JWT only in `sessionStorage`; never put tokens or secrets in URLs, logs, examples, or persistent docs.
- Clear admin session on 401 and redirect protected routes to login.
- Show `clientSecret` only in the one-time result modal returned by create/reset flows. Clear it when the modal closes.
- Integration examples must use placeholders such as `<CLIENT_ID>` and `<CLIENT_SECRET>`.

## UI Style

- Build the admin console as a dense operational interface, not a landing page.
- Use restrained color, stable table layouts, clear focus states, and predictable navigation.
- Use icons for toolbar and row actions when a common icon exists.
- Do not use decorative gradient blobs or marketing copy in the app surface.

## Testing

- Unit test pure helpers, session behavior, and API error mapping.
- Component test form validation, protected-route behavior, secret clearing, and permission selection summaries.
- E2E test the critical flow: login, create business system, edit permissions, reset secret, logout/protected redirect.
- Coverage target: 80% lines/statements/functions and 75% branches.

## Lint, Format, And Sonar

- `npm run lint` must pass before PR.
- `npm test` and `npm run build` must pass before PR.
- `npm run coverage` produces `coverage/lcov.info` for Sonar.
- Sonar should fail on new critical/high issues, duplicated large components, uncovered risky logic, and security hotspots around tokens or secrets.
- CI generates `eslint-report.json` with `.eslintrc.sonar.cjs` and imports it into SonarCloud through `sonar.eslint.reportPaths`.
- CI generates `sonar-external-issues.json` with `scripts/sonar-external-issues.mjs` and imports it into SonarCloud through `sonar.externalIssuesReportPaths`.
- `.eslintrc.sonar.cjs` carries stricter report-only checks for SonarCloud, including max params, complexity, max file/function size, raw HTML sinks, `eval`-style APIs, and TODO/FIXME markers.
- Keep `.eslintrc.cjs` as the developer-facing lint baseline; put noisy or refactor-heavy checks in `.eslintrc.sonar.cjs` first so they appear in SonarCloud before becoming hard local gates.
- Rule coverage details live in `docs/quality/sonarcloud-rule-coverage.md`.
