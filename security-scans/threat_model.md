# E:\wps-yundoc-admin-console Threat Model

## Assets
- Admin session state, CSRF token, admin role and permission view state.
- Business-system identifiers, client IDs, one-time client secrets shown after create/reset, API permission grants.
- Admin user management data and initial passwords during create flows.

## Trust Boundaries
- Browser to backend `/api/v1/admin/**` requests with cookie credentials.
- Frontend route guards and role UI are convenience controls; backend remains the authority.
- Local development Vite server can proxy `/api` to the backend.

## Attacker-Controlled Inputs
- Backend-rendered business-system names, descriptions, IDs, usernames, permission labels, and error messages.
- Query-string filters and React Router state.
- Cookies readable by frontend JavaScript, specifically the non-HttpOnly CSRF token.

## Security Invariants
- The frontend must not store admin JWTs or client secrets beyond the intended one-time display.
- User/back-end text must render as text, not HTML.
- Privileged pages should avoid fetching sensitive data before role checks complete.
- API path segments must be encoded.
- Development server exposure must not unintentionally expose local backend APIs to the LAN.
