import { CheckCircle2, FileKey2, KeyRound } from 'lucide-react'

export function IntegrationGuidePage() {
  return (
    <section className="page-section">
      <div className="page-heading">
        <div>
          <h1>接入指南</h1>
          <p>给业务系统开发者使用的最小接入信息，所有敏感值均以占位符展示。</p>
        </div>
      </div>

      <div className="guide-overview" aria-label="接入流程概览">
        <div>
          <span className="section-kicker">接入流程</span>
          <h2>先保存凭证，再换取令牌，最后调用已授权能力</h2>
        </div>
        <div className="guide-step-strip" aria-label="接入步骤">
          <span>
            <KeyRound size={16} aria-hidden="true" />
            保存凭证
          </span>
          <span>
            <FileKey2 size={16} aria-hidden="true" />
            换取令牌
          </span>
          <span>
            <CheckCircle2 size={16} aria-hidden="true" />
            调用能力
          </span>
        </div>
      </div>

      <div className="guide-grid">
        <section className="guide-section">
          <h2>保存凭证</h2>
          <p>创建或重置业务系统后，只会展示一次密钥明文。</p>
          <dl className="guide-fields">
            <dt>接入标识</dt>
            <dd>
              <code>{'<接入标识>'}</code>
            </dd>
            <dt>客户端密钥</dt>
            <dd>
              <code>{'<客户端密钥>'}</code>
            </dd>
          </dl>
        </section>

        <section className="guide-section">
          <h2>换取业务访问令牌</h2>
          <pre className="code-block">
            <code>{`POST /api/v1/auth/token
Content-Type: application/json

{
  "clientId": "<接入标识>",
  "clientSecret": "<客户端密钥>"
}`}</code>
          </pre>
          <p>
            返回值中的业务访问令牌用于访问已授权能力接口，示例中只使用占位符。
          </p>
        </section>

        <section className="guide-section">
          <h2>调用能力接口</h2>
          <dl className="guide-fields">
            <dt>请求签名密钥</dt>
            <dd>
              <code>{'<请求签名密钥>'}</code>
            </dd>
          </dl>
          <pre className="code-block">
            <code>{`POST /api/v1/app/previews
Authorization: Bearer <业务访问令牌>
Content-Type: application/json

{
  "source": {
    "type": "WPS_FILE",
    "fileId": "<文件标识>"
  },
  "options": {
    "expireSeconds": 3600
  }
}`}</code>
          </pre>
          <pre className="code-block">
            <code>{`GET /api/v1/user/files?userId=<用户标识>&parentFileId=root&limit=50
Authorization: Bearer <业务访问令牌>
X-Yundoc-User-Id: <用户标识>
X-Yundoc-User-Timestamp: <时间戳>
X-Yundoc-User-Nonce: <随机串>
X-Yundoc-User-Signature: <请求签名>`}</code>
          </pre>
          <pre className="code-block">
            <code>{`USER 签名内容
GET
/api/v1/user/files
userId=<用户标识>&parentFileId=root&limit=50
<业务系统标识>
<接入标识>
<用户标识>
<时间戳>
<随机串>

签名算法
base64url(HMAC-SHA256(签名内容, <请求签名密钥>))`}</code>
          </pre>
          <p>权限调整后，业务系统需要重新换取业务访问令牌，避免继续使用旧授权版本。</p>
        </section>
      </div>
    </section>
  )
}
