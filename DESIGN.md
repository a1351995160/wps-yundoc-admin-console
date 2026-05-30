---
version: 1
name: WPS Yundoc Admin Console Design System
source: Adapted from the Supabase developer-console direction, localized for WPS Yundoc administration.
description: A dense, trustworthy, developer-facing admin console for business-system registration, permission control, admin user management, credentials, and integration guidance. The UI should feel calm, precise, operational, and easy to scan during repeated daily use. It is not a marketing site.

colors:
  primary: "#0B64D8"
  primary-hover: "#0957C2"
  primary-soft: "#E8F1FF"
  primary-subtle: "#F3F7FF"
  sidebar: "#0F1F2E"
  sidebar-hover: "#1E3A52"
  sidebar-active: "#173A5E"
  text: "#17202A"
  text-secondary: "#536475"
  text-muted: "#7B8794"
  canvas: "#F6F8FB"
  surface: "#FFFFFF"
  surface-subtle: "#F8FAFC"
  border: "#D9E2EC"
  border-subtle: "#EDF2F7"
  code-bg: "#111827"
  code-text: "#F8FAFC"
  success: "#0F7B43"
  success-bg: "#EAF7F0"
  warning: "#B76E00"
  warning-bg: "#FFF7E6"
  danger: "#CF1322"
  danger-bg: "#FFF1F0"
  focus: "#69A7FF"

typography:
  fontFamily: "'Microsoft YaHei', 'PingFang SC', 'Segoe UI', sans-serif"
  monoFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace"
  page-title:
    fontSize: 24px
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: 0
  section-title:
    fontSize: 18px
    fontWeight: 700
    lineHeight: 1.35
    letterSpacing: 0
  body:
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: 0
  table:
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.45
    letterSpacing: 0
  code:
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: 0

rounded:
  xs: 4px
  sm: 6px
  md: 8px
  lg: 10px

spacing:
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px
  page: 28px

components:
  app-shell:
    layout: "232px fixed sidebar plus fluid main content"
    backgroundColor: "{colors.canvas}"
  sidebar:
    backgroundColor: "{colors.sidebar}"
    textColor: "#EDF5FB"
    activeBackgroundColor: "{colors.sidebar-active}"
    hoverBackgroundColor: "{colors.sidebar-hover}"
  primary-button:
    backgroundColor: "{colors.primary}"
    hoverBackgroundColor: "{colors.primary-hover}"
    textColor: "#FFFFFF"
    rounded: "{rounded.sm}"
    minHeight: 32px
  danger-button:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.danger}"
    borderColor: "#FF4D4F"
    rounded: "{rounded.sm}"
    minHeight: 32px
  data-panel:
    backgroundColor: "{colors.surface}"
    borderColor: "{colors.border}"
    rounded: "{rounded.md}"
    padding: 16px
  data-table:
    headerBackgroundColor: "{colors.surface-subtle}"
    rowBorderColor: "{colors.border-subtle}"
    minWidth: 920px
  code-block:
    backgroundColor: "{colors.code-bg}"
    textColor: "{colors.code-text}"
    rounded: "{rounded.sm}"
    padding: 14px
---

# WPS Yundoc Admin Console DESIGN.md

## Product Direction

This repository is an internal/developer-facing admin console for WPS Yundoc business-system, API permission, credential, and admin-user management. The visual direction is a restrained developer console: compact, trustworthy, precise, and optimized for repeated operational workflows.

The interface should borrow the useful parts of Supabase-style product UI: visible system chrome, strong code readability, tight controls, and clear panels. It should not copy Supabase's green brand accent. The project accent is WPS control-blue (`#0B64D8`).

## Non-Negotiables

- Build the app as a dense operational console, not a landing page.
- Use the existing React + Ant Design + lucide-react stack.
- Prefer existing components and CSS classes before inventing a new visual system.
- Keep the dark surface limited to the sidebar and code blocks.
- Use white or very light panels for tables, details, forms, and permission lists.
- Keep typography compact. Do not use hero-scale display text inside the app.
- Preserve stable dimensions for tables, toolbars, permission groups, and side panels.
- Make focus, hover, disabled, loading, empty, success, warning, and destructive states visible.

## Color System

Primary action blue is `#0B64D8`. Use it for the highest-priority action in a view: create business system, save permissions, submit login, or confirm a normal form.

Use status colors semantically:

- Success: enabled state, completed save, copied value, healthy connection.
- Warning: one-time secret visibility, permission changes not saved, integration reminders.
- Danger: disabled state, reset secret, destructive confirmations, failed requests.

Avoid green as the primary brand/action color. Green should mean success or enabled only.

## Layout Rules

The default shell is a fixed dark sidebar plus a light main surface. Keep the sidebar calm and predictable: product mark, navigation groups, then logout at the bottom.

Primary navigation should be:

- Business Systems: `业务系统`
- API Permissions: `权限管理`
- Admin Users: `用户管理`
- Integration Guide: `接入指南`

Only show `用户管理` when `/api/v1/admin/me` returns `superAdmin: true`. This is a usability rule only; the backend remains the authorization boundary.

Main content should use a maximum content width around `1200px` for list and detail pages. Permission editing may use a wider two-column layout with a sticky right summary panel.

Use page headings with:

- Title on the left.
- One concise helper line below the title.
- Primary action on the right when the page has one.

Do not add marketing sections, hero banners, decorative gradients, floating blob backgrounds, or nested card stacks.

## Component Rules

### Tables

Tables are the main scanning surface. Keep header rows subtle, row borders light, and cells stable. Use horizontal scrolling rather than squeezing identifiers.

Important identifiers such as `businessSystemId`, `clientId`, `tokenVersion`, and `permissionVersion` should use monospace styling or compact code treatment when it improves scanability.

Rows should expose obvious next actions. Prefer icon buttons with labels/tooltips for common actions such as copy, view, edit, reset, and configure permissions.

### Forms

Forms should be narrow enough to read comfortably, usually `640px` to `760px`. Labels are left-aligned in simple vertical rhythm. Required fields, validation errors, and async save state must be explicit.

Avoid placeholder-only labeling. The console is operational and should remain clear under stress.

### Permission Editor

The permission editor is a risk-sensitive workflow. Group permissions by identity type and make each permission item easy to compare.

Each permission item should show:

- `apiCode` as the strongest scan target.
- Display name as the human label.
- Risk level and description as secondary detail.
- Clear checked/unchecked state with large enough click target.

The right summary panel should stay sticky and show added/removed permissions, unsaved changes, save status, and the primary save action.

### User Management

The user management page is a security-sensitive administration surface for deciding who can enter the admin console. It should be visually calm, but its risk states must be unmistakable.

The page should include:

- Search by login account or display name.
- Filters for role and status.
- A compact table with login account, display name, role, status, last login time, updated time, and actions.
- A primary `新增用户` action visible only to super administrators.
- Edit controls for display name, role, and status.
- Clear disabled-user messaging: stopping a user prevents login and invalidates existing tokens on the next backend check.

Do not expose password implementation fields. Never render `loginDigest`, `loginSalt`, `loginAlgorithm`, JWT payloads, or raw token internals.

Use role descriptions that a non-backend operator can understand:

- `超级管理员`: highest-privilege account from backend configuration, can manage admin users.
- `系统管理员`: manages business systems and API permissions, cannot manage admin users.
- `只读审计员`: reads data only.
- `接入支持人员`: views business systems and integration guidance for troubleshooting.

The create-user flow should make the initial password feel temporary and sensitive. If the backend later changes to invitation delivery, preserve the same table and role model but replace the initial-password field with invitation status.

### Credentials And Secrets

Secret values are sensitive. The one-time secret modal should visually feel important without becoming alarming.

Use warning styling for "only shown once". Use monospace blocks for `clientId` and `clientSecret`. Provide copy actions. Clear secret values when the modal closes.

### Integration Guide

The integration guide is documentation inside an admin console, not a marketing docs site. Use readable sections, precise examples, and dark code blocks. All secrets in examples must be placeholders.

Use Mintlify-like clarity only for this page: clean prose, copyable code, and simple steps. Do not let this page dictate the visual style of the whole console.

### Login

Login should be quiet and trustworthy. Use a centered panel, product identity, direct form labels, visible error state, and a single primary submit action. Avoid illustration-heavy or marketing copy.

After login, call `/api/v1/admin/me` before rendering role-specific navigation. The current user's role should be presented as human-readable text, not raw backend values.

## Backend Contract

The current backend design source is:

```text
E:\wps\docs\latest\2026-05-28-latest-wps-yundoc-admin-user-management-rbac.zh.md
```

Admin user APIs:

- `GET /api/v1/admin/me`
- `GET /api/v1/admin/users?keyword=&status=&role=&page=1&pageSize=20`
- `POST /api/v1/admin/users`
- `PATCH /api/v1/admin/users/{username}`

The configured backend super administrator is the only `SUPER_ADMIN`. Database-backed users may only use `SYSTEM_ADMIN`, `AUDITOR`, or `SUPPORT`.

### User-Facing Copy Dictionary

Use these labels in the UI instead of raw backend field names:

| Backend field/value | UI copy |
| --- | --- |
| `username` | 登录账号 |
| `displayName` | 用户姓名 |
| `role` | 角色 |
| `status` | 状态 |
| `lastLoginAt` | 最近登录时间 |
| `createdAt` | 创建时间 |
| `updatedAt` | 更新时间 |
| `SUPER_ADMIN` | 超级管理员 |
| `SYSTEM_ADMIN` | 系统管理员 |
| `AUDITOR` | 只读审计员 |
| `SUPPORT` | 接入支持人员 |
| `ENABLED` | 启用 |
| `DISABLED` | 停用 |
| `initialPassword` | 初始密码 |

Sensitive backend fields that must not appear in UI copy, tables, examples, logs, or persistent state:

- `loginDigest`
- `loginSalt`
- `loginAlgorithm`
- JWT signing secrets
- raw admin JWT payloads

## Interaction Rules

- All clickable controls need hover and focus-visible states.
- Destructive actions require confirmation in context.
- Role changes and user disable actions require confirmation in context.
- Copy actions should show immediate success feedback.
- Loading states should preserve layout and avoid large jumps.
- Empty states should explain what is missing and provide the next action when appropriate.
- Search and filters should stay compact and near the table they control.

## Responsive Behavior

At narrow widths, collapse the sidebar into a top navigation region. Tables may remain horizontally scrollable. Permission editor columns should collapse into a single column with the summary panel below the permission groups.

Touch targets should be at least `36px` high. Long Chinese labels and long identifiers must wrap or scroll intentionally, never overflow into neighboring controls.

## Accessibility

- Maintain WCAG AA contrast for text and controls.
- Do not rely on color alone for status.
- Ensure focus-visible rings are clear on light and dark surfaces.
- Keep `aria-label` values human-readable Chinese, not mojibake or internal codes.
- Code examples and secret fields must remain selectable and copyable.

## Do

- Use restrained blue, dark navy, white, and cool gray as the core palette.
- Use lucide icons for familiar actions.
- Use Ant Design components where they improve consistency.
- Make permission and credential risk visible.
- Make user-role and disabled-user risk visible.
- Keep data dense but organized.
- Prefer precise operational copy over explanatory marketing language.

## Don't

- Do not use Supabase green as the product accent.
- Do not introduce purple/blue gradient hero sections.
- Do not create cards inside cards.
- Do not turn the console into a brand landing page.
- Do not use oversized typography in panels, tables, forms, or sidebars.
- Do not hide critical state changes behind animation.
- Do not place secrets in URLs, logs, persistent docs, or realistic examples.
- Do not show user-management actions to non-super administrators, but never rely on frontend hiding as the security boundary.

## Agent Prompt Guide

When asking an AI agent to redesign or implement UI in this repo, use this pattern:

```text
Read DESIGN.md first and follow it as the visual source of truth.
This is a dense WPS Yundoc admin console, not a landing page.
Use the existing React + Ant Design + lucide-react stack.
Improve the [page/component] interaction and layout while preserving security rules around credentials and permissions.
Verify responsive behavior and text fit.
```

For permission work:

```text
Read DESIGN.md first. Redesign the permission editor for fast comparison, clear unsaved changes, and safe saving.
Keep permissions grouped by identity type. Make apiCode, risk level, and added/removed changes easy to scan.
```

For integration docs:

```text
Read DESIGN.md first. Improve the integration guide using compact documentation layout, copyable code blocks, and placeholder-only secrets.
Keep the page inside the admin-console visual system.
```

For user management:

```text
Read DESIGN.md first. Implement the user management page using /api/v1/admin/me and /api/v1/admin/users.
Show the page only for super administrators. Use Chinese labels from the User-Facing Copy Dictionary.
Make role changes and disabled-user effects clear, and never render password digest, salt, algorithm, token payloads, or raw secrets.
```
