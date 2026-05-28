export function IntegrationGuidePage() {
  return (
    <section className="page-section">
      <div className="page-heading">
        <div>
          <h1>接入指南</h1>
          <p>给业务系统开发者使用的最小接入信息，所有敏感值均以占位符展示。</p>
        </div>
      </div>

      <div className="guide-grid">
        <section className="guide-section">
          <h2>1. 保存凭证</h2>
          <p>创建或重置业务系统后，只会展示一次密钥明文。</p>
          <dl className="guide-fields">
            <dt>clientId</dt>
            <dd>
              <code>{'<client-id>'}</code>
            </dd>
            <dt>clientSecret</dt>
            <dd>
              <code>{'<client-secret>'}</code>
            </dd>
          </dl>
        </section>

        <section className="guide-section">
          <h2>2. 换取业务 JWT</h2>
          <pre className="code-block">
            <code>{`POST /api/v1/auth/token
Content-Type: application/json

{
  "clientId": "<client-id>",
  "clientSecret": "<client-secret>"
}`}</code>
          </pre>
          <p>
            返回值中的 <code>{'<business-jwt>'}</code> 用于访问已授权能力接口。
          </p>
        </section>

        <section className="guide-section">
          <h2>3. 调用能力接口</h2>
          <dl className="guide-fields">
            <dt>wpsAccessToken</dt>
            <dd>
              <code>{'<wps-access-token>'}</code>
            </dd>
          </dl>
          <pre className="code-block">
            <code>{`POST /api/v1/capabilities/app-preview
Authorization: Bearer <business-jwt>
Content-Type: application/json

{
  "wpsAccessToken": "<wps-access-token>",
  "fileId": "<wps-file-id>"
}`}</code>
          </pre>
          <p>权限调整后，业务系统需要重新换取业务 JWT，避免继续使用旧权限版本。</p>
        </section>
      </div>
    </section>
  )
}
