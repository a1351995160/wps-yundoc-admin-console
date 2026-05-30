---
title: WPS 云文档管理后台 RBAC 交互重做计划
type: feat
status: active
date: 2026-05-28
origin: user goal
---

# WPS 云文档管理后台 RBAC 交互重做计划

## 问题边界

当前管理台已经具备登录、业务系统、接口授权和接入指南的基础页面，但整体仍偏“功能拼接”：页面结构、角色入口、危险操作确认、中文化字段和用户管理能力还没有形成真实管理员可长期使用的后台控制台。

本轮重做以前端仓库为主，后端仓库作为 RBAC 契约和权限边界来源。后端已提供用户管理与 RBAC 设计及实现，前端必须按该契约调用 `/api/v1/admin/me` 和 `/api/v1/admin/users`，并且只把隐藏入口作为体验层控制，不能假设前端隐藏等于安全。

## 范围

包含：

- 管理台登录后加载当前管理员身份，并用中文展示角色。
- 重做固定侧边栏、页面标题、工具栏、表格、详情、权限编辑和接入指南的后台交互结构。
- 新增 `用户管理` 页面，支持搜索、角色筛选、状态筛选、新增用户、编辑用户、启用/停用。
- 按角色控制导航入口与写操作：超级管理员可管理用户；系统管理员可管理业务系统和接口授权；只读审计员只读；接入支持人员只看业务系统和接入指南。
- 危险操作、角色调整、停用用户、密钥重置都必须有上下文提示和二次确认。
- 页面、表格、表单、测试和示例只使用用户能理解的中文，不展示密码摘要、盐、算法、JWT 载荷、真实 token 或密钥。
- 增加单元测试、集成式组件测试和 Playwright E2E，覆盖角色切换与横向/纵向越权入口。
- 运行 lint、test、build、Sonar 相关检查，并修复发现的问题。

不包含：

- 后端新增细粒度 RBAC 数据模型。
- SSO、邀请邮件、密码重置邮件。
- 前端 BFF、HttpOnly Cookie、CSRF 迁移。
- 管理操作审计表。

## 依据与契约

前端设计源：

- `DESIGN.md`

后端契约源：

- backend `docs/latest/2026-05-28-latest-wps-yundoc-admin-user-management-rbac.zh.md`
- backend `docs/plans/2026-05-28-admin-user-management-rbac-plan.zh.md`
- backend `docs/latest/2026-05-30-latest-wps-yundoc-capability-signature-design.zh.md`

关键接口：

- `GET /api/v1/admin/me`
- `GET /api/v1/admin/users?keyword=&status=&role=&page=1&pageSize=20`
- `POST /api/v1/admin/users`
- `PATCH /api/v1/admin/users/{username}`

## 决策

1. 使用现有 React、Ant Design、React Query、lucide-react，不引入新的 UI 框架。
2. 建立前端权限模型作为体验层：`SUPER_ADMIN`、`SYSTEM_ADMIN`、`AUDITOR`、`SUPPORT` 映射成中文角色与能力集合。
3. 会话仍暂存 `sessionStorage`，但登录后必须通过 `/me` 获取身份；401 时清理会话并回登录页。
4. 用户管理页不展示 `loginDigest`、`loginSalt`、`loginAlgorithm`、JWT payload 或原始 token；新增用户的初始密码仅作为表单提交字段，不写入持久 UI 状态。
5. 业务系统、接口授权等写入口根据角色禁用或隐藏；后端仍负责最终拒绝。
6. 危险操作使用明确中文影响说明：停用用户会阻止登录并使已有 token 在下次校验失效；重置密钥会使旧凭据失效；保存权限会影响业务系统可调用能力。
7. 接入指南必须按后端能力签名设计展示边界：`clientSecret` 只用于换取业务访问令牌，能力请求签名使用独立签名密钥；业务系统负责 `userId`、WPS 账号绑定关系和 `fileId` 归属，网关负责请求未篡改、防重放、权限码和 WPS 返回内容安全。

## 实施单元

### U1. 当前管理员身份和前端权限模型

文件：

- `src/features/auth/authSession.ts`
- `src/features/auth/api.ts`
- `src/features/auth/useAuth.ts`
- `src/features/auth/ProtectedRoute.tsx`
- `src/features/auth/LoginPage.tsx`
- `src/features/auth/permissions.ts`
- `src/shared/ui/AppLayout.tsx`
- `src/app/router.tsx`

测试：

- `src/features/auth/authSession.test.ts`
- `src/features/auth/LoginPage.test.tsx`
- `src/features/auth/ProtectedRoute.test.tsx`
- `src/shared/ui/AppLayout.test.tsx`

场景：

- 登录成功后保存 admin JWT，但页面身份来自 `/api/v1/admin/me`。
- 角色显示为中文，不显示后端原始值。
- 非超级管理员看不到 `用户管理` 入口。
- 审计员和接入支持人员看不到或不能触发写操作入口。
- 401 后清理会话并跳转登录。

### U2. 管理台结构与中文化基础控件

文件：

- `src/shared/ui/AppLayout.tsx`
- `src/shared/ui/StatusTag.tsx`
- `src/shared/ui/CopyButton.tsx`
- `src/styles/global.css`
- `src/features/business-systems/BusinessSystemListPage.tsx`
- `src/features/business-systems/BusinessSystemDetailPage.tsx`
- `src/features/permissions/PermissionsOverviewPage.tsx`
- `src/features/permissions/PermissionEditorPage.tsx`
- `src/features/integration-guide/IntegrationGuidePage.tsx`

测试：

- `src/shared/ui/AppLayout.test.tsx`
- `src/features/business-systems/BusinessSystemListPage.test.tsx`
- `src/features/permissions/PermissionsOverviewPage.test.tsx`
- `src/features/permissions/PermissionEditorPage.test.tsx`
- `src/features/integration-guide/IntegrationGuidePage.test.tsx`

场景：

- 导航为 `业务系统`、`权限管理`、`用户管理`、`接入指南`。
- `clientId`、版本号、接口编码可扫描，但技术字段标题改成中文说明。
- 接入指南要展示业务访问令牌、请求签名、防重放和授权责任边界，不能暗示业务系统直接传 WPS token 给网关。
- 空态、加载、禁用、复制成功和错误提示稳定。
- 窄屏时导航和表格不互相挤压。

### U3. 业务系统和接口授权按角色控制操作

文件：

- `src/features/business-systems/BusinessSystemListPage.tsx`
- `src/features/business-systems/BusinessSystemCreatePage.tsx`
- `src/features/business-systems/BusinessSystemDetailPage.tsx`
- `src/features/business-systems/BusinessSystemEditForm.tsx`
- `src/features/business-systems/ResetSecretAction.tsx`
- `src/features/permissions/PermissionEditorPage.tsx`
- `src/features/permissions/PermissionChangeSummary.tsx`

测试：

- `src/features/business-systems/BusinessSystemCreatePage.test.tsx`
- `src/features/business-systems/BusinessSystemDetailPage.test.tsx`
- `src/features/permissions/PermissionEditorPage.test.tsx`

场景：

- 系统管理员可创建业务系统、编辑业务系统、重置密钥、保存接口授权。
- 只读审计员只能查看，不能看到保存、编辑、重置等操作。
- 接入支持人员可查看业务系统和接入指南，不能进入权限管理写操作。
- 重置密钥需要二次确认，关闭一次性密钥弹窗后清空明文。
- 保存权限前展示新增和移除摘要。

### U4. 用户管理页面

文件：

- `src/features/admin-users/types.ts`
- `src/features/admin-users/api.ts`
- `src/features/admin-users/AdminUserManagementPage.tsx`
- `src/features/admin-users/AdminUserFormModal.tsx`
- `src/app/router.tsx`
- `src/shared/ui/AppLayout.tsx`

测试：

- `src/features/admin-users/AdminUserManagementPage.test.tsx`
- `src/features/admin-users/api.test.ts`
- `src/shared/ui/AppLayout.test.tsx`

场景：

- 仅超级管理员能看到并进入用户管理。
- 支持按登录账号或用户姓名搜索。
- 支持按角色、状态筛选。
- 表格展示登录账号、用户姓名、角色、状态、最近登录时间、更新时间、操作。
- 新增用户提交 `username`、`displayName`、`role`、`initialPassword`，但列表和持久状态不展示初始密码。
- 编辑用户只能修改用户姓名、角色、状态。
- 停用用户和角色调整必须二次确认，并说明影响。
- 数据中即使包含敏感字段也不会渲染。

### U5. E2E、Sonar 和发布质量门

文件：

- `playwright.config.ts`
- `e2e/admin-console-rbac.spec.ts`
- `src/test/`
- `sonar-project.properties`

验证：

- `npm run lint`
- `npm run test`
- `npm run build`
- `npm run lint:sonar`
- `npm run sonar` 或记录本地 Sonar 环境缺失原因
- backend `.\mvnw.cmd test`
- Playwright E2E 覆盖超级管理员、系统管理员、只读审计员、接入支持人员。

E2E 场景：

- 超级管理员能进入用户管理并看到新增用户入口。
- 系统管理员不能看到用户管理入口，也不能通过直达 URL 使用用户管理页面。
- 只读审计员不能看到业务系统创建、编辑、重置密钥、保存权限操作。
- 接入支持人员不能看到权限管理入口。
- 危险操作出现二次确认。
- 页面没有渲染 `loginDigest`、`loginSalt`、`loginAlgorithm`、JWT payload 或真实 secret 示例。

## 顺序

1. 完成 U1，先让应用有可靠的当前身份与权限判断。
2. 完成 U4 用户管理 API 和页面，因为它是 RBAC 的核心新增能力。
3. 完成 U2/U3 的结构、中文化、危险操作和角色门禁。
4. 补足单元/组件测试和 E2E。
5. 跑 lint/test/build/Sonar/backend tests，修复问题。
6. 运行代码评审，处理 P0/P1/P2 问题。
7. 提交、推送、创建 PR，并在确认质量门后合并 main。

## 风险

- 前端隐藏入口不能替代后端权限；所有测试都要明确这是体验层，后端接口仍可能返回 403。
- `sessionStorage` 保存 admin JWT 是当前阶段折中；页面和日志不得打印 token。
- 初始密码字段只应存在于新增表单提交瞬间，不应进入表格、查询缓存或测试快照。
- 现有仓库有未提交改动，实施时必须保留并整合，不回滚未知来源更改。
