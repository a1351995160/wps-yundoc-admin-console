import { expect, test, type Page } from '@playwright/test'

const ADMIN_PASSWORD = 'admin-password'
const CREATED_USER_PASSWORD = 'InitialPass123!'
const RUN_ID = `${Date.now()}`
const BUSINESS_SYSTEM_ID = `e2e-biz-${RUN_ID}`
const USERS = {
  systemAdmin: `e2e-system-${RUN_ID}`,
  auditor: `e2e-auditor-${RUN_ID}`,
  support: `e2e-support-${RUN_ID}`,
  disabled: `e2e-disabled-${RUN_ID}`
} as const

test.describe.configure({ mode: 'serial' })

test.describe('管理后台真实角色权限', () => {
  test('超级管理员可以配置用户、业务系统、接口授权和危险操作确认', async ({ page }) => {
    await login(page, 'admin', ADMIN_PASSWORD)

    await expect(page.getByRole('heading', { name: '业务系统' })).toBeVisible()
    await expect(page.getByRole('link', { name: '用户管理' })).toBeVisible()
    await expect(page.getByRole('link', { name: '权限管理' })).toBeVisible()
    await expectNoSensitiveText(page)

    await createAdminUser(page, USERS.systemAdmin, `${USERS.systemAdmin} 系统管理员`, 'SYSTEM_ADMIN')
    await createAdminUser(page, USERS.auditor, `${USERS.auditor} 审计员`, 'AUDITOR')
    await createAdminUser(page, USERS.support, `${USERS.support} 接入支持`, 'SUPPORT')
    await createAdminUser(page, USERS.disabled, `${USERS.disabled} 停用用户`, 'SUPPORT')
    await disableAdminUser(page, USERS.disabled)
    await logout(page)
    await expectLoginFailure(page, USERS.disabled, CREATED_USER_PASSWORD)
    await login(page, 'admin', ADMIN_PASSWORD)

    await createBusinessSystem(page)
    await configurePermission(page)
    await verifyResetSecretConfirmation(page)
    await logout(page)
  })

  test('系统管理员不能管理后台用户，但可以管理业务系统和接口授权', async ({ page }) => {
    await login(page, USERS.systemAdmin, CREATED_USER_PASSWORD)

    await expect(page.getByRole('link', { name: '用户管理' })).toHaveCount(0)
    await expect(page.getByRole('link', { name: '权限管理' })).toBeVisible()
    await expect(page.getByRole('button', { name: '创建业务系统' })).toBeVisible()

    await page.goto('/admin-users')
    await expect(page.getByText('无权访问用户管理')).toBeVisible()

    await page.goto(`/business-systems/${BUSINESS_SYSTEM_ID}/permissions`)
    await expect(page.getByRole('heading', { name: '接口授权' })).toBeVisible()
    await page.getByRole('checkbox', { name: /查看用户文件列表/ }).click()
    await expect(page.getByRole('button', { name: '保存接口授权' })).toBeEnabled()
    await page.getByRole('button', { name: '保存接口授权' }).click()
    await expect(page.getByText('请确认保存接口授权')).toBeVisible()
    await page.getByRole('button', { name: '确认保存接口授权' }).click()
    await expect(page.getByText(/已保存，授权版本/)).toBeVisible()
    await expectNoSensitiveText(page)
    await logout(page)
  })

  test('只读审计员只能查看，不能写入业务系统或接口授权', async ({ page }) => {
    await login(page, USERS.auditor, CREATED_USER_PASSWORD)

    await expect(page.getByRole('link', { name: '权限管理' })).toBeVisible()
    await expect(page.getByRole('link', { name: '用户管理' })).toHaveCount(0)
    await expect(page.getByRole('button', { name: '创建业务系统' })).toHaveCount(0)

    await page.goto('/business-systems/new')
    await expect(page.getByText('无权创建业务系统')).toBeVisible()

    await page.goto(`/business-systems/${BUSINESS_SYSTEM_ID}`)
    await expect(page.getByText('当前角色只能查看业务系统')).toBeVisible()
    await expect(page.getByRole('button', { name: '重置密钥' })).toHaveCount(0)

    await page.goto(`/business-systems/${BUSINESS_SYSTEM_ID}/permissions`)
    await expect(page.getByText('当前角色只能查看接口授权，不能保存变更。')).toBeVisible()
    await expect(page.getByRole('button', { name: '保存接口授权' })).toBeDisabled()
    await expectNoSensitiveText(page)
    await logout(page)
  })

  test('接入支持人员看不到权限管理和用户管理入口，也不能直达越权页面', async ({ page }) => {
    await login(page, USERS.support, CREATED_USER_PASSWORD)

    await expect(page.getByRole('link', { name: '业务系统' })).toBeVisible()
    await expect(page.getByRole('link', { name: '接入指南' })).toBeVisible()
    await expect(page.getByRole('link', { name: '权限管理' })).toHaveCount(0)
    await expect(page.getByRole('link', { name: '用户管理' })).toHaveCount(0)

    await page.goto('/permissions')
    await expect(page.getByText('无权访问权限管理')).toBeVisible()

    await page.goto('/admin-users')
    await expect(page.getByText('无权访问用户管理')).toBeVisible()

    await page.goto('/business-systems/new')
    await expect(page.getByText('无权创建业务系统')).toBeVisible()
    await expectNoSensitiveText(page)
    await logout(page)
  })
})

async function login(page: Page, username: string, password: string) {
  await page.goto('/login')
  await page.getByLabel('账号').fill(username)
  await page.getByLabel('密码').fill(password)
  await page.getByRole('button', { name: '登录' }).click()
  await expect(page.getByRole('heading', { name: '业务系统' })).toBeVisible()
}

async function logout(page: Page) {
  await page.getByRole('button', { name: '退出' }).click()
  await expect(page.getByRole('heading', { name: '管理员登录' })).toBeVisible()
}

async function expectLoginFailure(page: Page, username: string, password: string) {
  await page.goto('/login')
  await page.getByLabel('账号').fill(username)
  await page.getByLabel('密码').fill(password)
  await page.getByRole('button', { name: '登录' }).click()
  await expect(page.getByRole('alert')).toContainText('登录失败')
}

async function createAdminUser(
  page: Page,
  username: string,
  displayName: string,
  role: 'SYSTEM_ADMIN' | 'AUDITOR' | 'SUPPORT'
) {
  await page.goto('/admin-users')
  await page.getByRole('button', { name: '新增用户' }).click()
  const dialog = page.getByRole('dialog', { name: '新增后台用户' })
  await dialog.getByLabel('登录账号').fill(username)
  await dialog.getByLabel('用户姓名').fill(displayName)
  await dialog.getByLabel('角色').selectOption(role)
  await dialog.getByLabel('初始密码').fill(CREATED_USER_PASSWORD)
  await dialog.getByRole('button', { name: '创建用户' }).click()
  const createdRow = page.getByRole('row', { name: new RegExp(escapeRegExp(username)) })
  await expect(createdRow).toBeVisible()
  await expect(createdRow).toContainText(displayName)
  await expectNoSensitiveText(page)
}

async function disableAdminUser(page: Page, username: string) {
  await page.goto('/admin-users')
  await page.getByRole('row', { name: new RegExp(username) }).getByRole('button', { name: '编辑' }).click()
  const dialog = page.getByRole('dialog', { name: '编辑后台用户' })
  await dialog.getByLabel('状态').selectOption('DISABLED')
  await dialog.getByRole('button', { name: '保存用户' }).click()
  await expect(dialog.getByText('请确认本次变更')).toBeVisible()
  await dialog.getByRole('button', { name: '确认保存' }).click()
  await expect(dialog).toHaveCount(0)
  await expect(page.getByRole('row', { name: new RegExp(`${username}.*停用`) })).toBeVisible()
}

async function createBusinessSystem(page: Page) {
  await page.goto('/business-systems')
  await page.getByRole('button', { name: '创建业务系统' }).click()
  await expect(page.getByRole('heading', { name: '创建业务系统' })).toBeVisible()
  await page.getByLabel('系统标识').fill(BUSINESS_SYSTEM_ID)
  await page.getByLabel('系统名称').fill('端到端业务系统')
  await page.getByLabel('令牌有效期').fill('1800')
  await page.getByLabel('描述').fill('用于端到端权限验证')
  await page.getByRole('button', { name: '创建业务系统' }).click()

  const secretDialog = page.getByRole('dialog', { name: '创建成功' })
  await expect(secretDialog.getByText('请立即保存客户端密钥')).toBeVisible()
  await expect(secretDialog.getByText('客户端密钥', { exact: true })).toBeVisible()
  await secretDialog.getByRole('button', { name: '我已保存' }).click()
  await expect(secretDialog).toHaveCount(0)

  await page.goto('/business-systems')
  await expect(page.getByRole('link', { name: BUSINESS_SYSTEM_ID })).toBeVisible()
  await expectNoSensitiveText(page)
}

async function configurePermission(page: Page) {
  await page.goto('/permissions')
  await page
    .getByRole('row', { name: new RegExp(BUSINESS_SYSTEM_ID) })
    .getByRole('link', { name: '配置接口授权' })
    .click()
  await expect(page.getByRole('heading', { name: '接口授权' })).toBeVisible()

  await page.getByRole('checkbox', { name: /创建文件预览/ }).click()
  await page.getByRole('button', { name: '保存接口授权' }).click()
  await expect(page.getByText('请确认保存接口授权')).toBeVisible()
  await page.getByRole('button', { name: '确认保存接口授权' }).click()
  await expect(page.getByText(/已保存，授权版本/)).toBeVisible()
  await expectNoSensitiveText(page)
}

async function verifyResetSecretConfirmation(page: Page) {
  await page.goto(`/business-systems/${BUSINESS_SYSTEM_ID}`)
  await page.getByRole('button', { name: '重置密钥' }).click()
  await expect(page.getByText('确认后旧客户端密钥立即失效')).toBeVisible()
  await page.getByRole('button', { name: '确认重置' }).click()
  const secretDialog = page.getByRole('dialog', { name: '密钥已重置' })
  await expect(secretDialog.getByText('请立即保存客户端密钥')).toBeVisible()
  await secretDialog.getByRole('button', { name: '我已保存' }).click()
  await expect(secretDialog).toHaveCount(0)
  await expectNoSensitiveText(page)
}

async function expectNoSensitiveText(page: Page) {
  const body = page.locator('body')
  await expect(body).not.toContainText('loginDigest')
  await expect(body).not.toContainText('loginSalt')
  await expect(body).not.toContainText('loginAlgorithm')
  await expect(body).not.toContainText(/Bearer\s+eyJ/)
  await expect(body).not.toContainText('adminJwt')
  await expect(body).not.toContainText('clientId')
  await expect(body).not.toContainText('clientSecret')
  await expect(body).not.toContainText('wpsAccessToken')
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
