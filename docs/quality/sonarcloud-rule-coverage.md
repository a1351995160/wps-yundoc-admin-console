# SonarCloud Rule Coverage

This document maps frontend coding standards to CI/SonarCloud reporting.

## Frontend CI Path

GitHub Actions runs coverage, build, then:

```bash
npm run lint:sonar || true
```

`lint:sonar` writes `eslint-report.json`, and SonarCloud imports it through:

```properties
sonar.eslint.reportPaths=eslint-report.json
```

`sonar:external` writes `sonar-external-issues.json`, and SonarCloud imports
it through:

```properties
sonar.externalIssuesReportPaths=sonar-external-issues.json
```

The lint command intentionally keeps `|| true` so the report is still uploaded
even when report-only rules find issues.

## Developer Lint

`.eslintrc.cjs` is the developer-facing baseline used by:

```bash
npm run lint
```

It keeps fast, low-noise rules:

- recommended ESLint rules
- recommended TypeScript rules
- React hooks rules
- no `any`
- consistent type imports
- unused variables

## Sonar Report-Only Lint

`.eslintrc.sonar.cjs` adds stricter checks that are imported into SonarCloud:

| Standard | ESLint rule | Threshold |
| --- | --- | --- |
| Keep UI functions readable | `max-lines-per-function` | 240 lines |
| Keep feature files focused | `max-lines` | 300 lines |
| Keep branch complexity reasonable | `complexity` | 22 |
| Avoid long argument lists | `max-params` | 5 |
| Do not use eval-like APIs | `no-eval`, `no-implied-eval`, `no-new-func` | Enabled |
| Do not use script URLs | `no-script-url` | Enabled |
| Do not leave TODO/FIXME markers | `no-warning-comments` | Enabled |
| Do not inject raw HTML | `no-restricted-syntax` for `dangerouslySetInnerHTML`, `innerHTML`, `outerHTML`, `insertAdjacentHTML` | Enabled |
| Do not assign inside conditions | `no-restricted-syntax` selector for conditional assignments | Enabled |

Tests are excluded from the size/complexity/max-params checks to avoid noisy fixture and scenario setup reports.

## Automated External Security Issues

`scripts/sonar-external-issues.mjs` covers security checks that are normally
Sonar Quality Profile rules but need to be visible from CI without changing
SonarCloud settings:

| Standard | External rule | Notes |
| --- | --- | --- |
| Do not hardcode secrets | `ts-hardcoded-secret` | Secret-like assignments and call arguments |
| Do not put tokens in URLs | `ts-token-in-url` | Query string token/secret parameters |
| Do not use weak random for security values | `ts-weak-random` | `Math.random()` near token/nonce/secret names |

## SonarCloud Quality Profile Recommended

These should also be enabled or reviewed in the SonarCloud JavaScript/TypeScript
Quality Profile for deeper semantic analysis. The CI rules above provide
repository-owned coverage when the profile is not configured:

- duplicated string literals
- cognitive complexity
- security hotspots around cookies, tokens, DOM sinks, and URLs
- suspicious regular expressions
- hardcoded credentials or secret-like literals

The repository cannot set SonarCloud Quality Profile parameters directly.

## Manual Review Coverage

These standards remain review-driven:

- Whether a page composition is understandable to administrators.
- Whether role-gated UI is only experience-layer gating and not treated as security.
- Whether secrets appear in product copy, screenshots, demos, or docs.
- Whether a large component should be split by workflow rather than by arbitrary line count.
