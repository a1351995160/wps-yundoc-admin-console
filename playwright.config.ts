import { defineConfig, devices } from '@playwright/test'

const backendCwd = process.env.E2E_BACKEND_CWD ?? 'E:\\wps-admin-rbac-hardening'
const mysqlPassword = process.env.LOCAL_MYSQL_PASSWORD ?? '123456'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }]
  ],
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:5173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ],
  webServer: [
    {
      command:
        `powershell -NoProfile -ExecutionPolicy Bypass -Command "Set-Location '${backendCwd}'; $env:LOCAL_MYSQL_PASSWORD='${mysqlPassword}'; .\\mvnw.cmd spring-boot:run '-Dspring-boot.run.profiles=test'"`,
      url: 'http://127.0.0.1:8080/actuator/health',
      reuseExistingServer: !process.env.CI,
      timeout: 180_000
    },
    {
      command: 'npm.cmd run dev -- --host 127.0.0.1',
      url: 'http://localhost:5173',
      reuseExistingServer: !process.env.CI,
      timeout: 120_000
    }
  ]
})
