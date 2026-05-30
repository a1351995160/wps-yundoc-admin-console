import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import { dirname, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const output = resolve(root, 'sonar-external-issues.json')

const rules = [
  {
    ruleId: 'ts-hardcoded-secret',
    name: 'Hardcoded secret-like value',
    description: 'Secret-like values must come from placeholders or runtime configuration.',
    cleanCodeAttribute: 'TRUSTWORTHY',
    severity: 'CRITICAL',
    type: 'VULNERABILITY',
    impactSeverity: 'HIGH',
    message: 'Secret-like value is hardcoded. Use placeholders or runtime configuration.',
    patterns: [
      /(secret|password|apiKey|api[_-]?key|accessKey|privateKey|clientSecret|signingKey|pepper)[^=\n]{0,80}=\s*['"`][^'"`${}]{8,}['"`]/i,
      /(secret|password|apiKey|api[_-]?key|accessKey|privateKey|clientSecret|signingKey|pepper)[^(\n]{0,80}\(\s*['"`][^'"`${}]{8,}['"`]/i
    ]
  },
  {
    ruleId: 'ts-token-in-url',
    name: 'Token or secret in URL',
    description: 'Tokens and secrets must not be placed in URLs or query strings.',
    cleanCodeAttribute: 'TRUSTWORTHY',
    severity: 'MAJOR',
    type: 'VULNERABILITY',
    impactSeverity: 'MEDIUM',
    message: 'Do not place tokens or secrets in URLs or query strings.',
    patterns: [
      /searchParams\.set\(\s*['"`](token|access_token|clientSecret|secret|password)['"`]/i,
      /new URLSearchParams\([^)]*(token|access_token|clientSecret|secret|password)/i
    ]
  },
  {
    ruleId: 'ts-weak-random',
    name: 'Weak random for security-sensitive value',
    description: 'Math.random must not be used for tokens, nonces, secrets, or signatures.',
    cleanCodeAttribute: 'TRUSTWORTHY',
    severity: 'MAJOR',
    type: 'VULNERABILITY',
    impactSeverity: 'MEDIUM',
    message: 'Do not use Math.random for tokens, nonces, passwords, or security-sensitive identifiers.',
    patterns: [
      /(token|nonce|password|secret|signature|jti)[^=\n]{0,80}=\s*Math\.random\(/i,
      /Math\.random\(\)[^;\n]{0,80}(token|nonce|password|secret|signature|jti)/i
    ]
  }
]

function issueFor(filePath, lineNumber, line, rule) {
  const startColumn = Math.max(1, line.length - line.trimStart().length + 1)
  const endColumn = Math.max(startColumn + 1, line.trimEnd().length + 1)
  return {
    ruleId: rule.ruleId,
    primaryLocation: {
      message: rule.message,
      filePath: relative(root, filePath).replaceAll('\\', '/'),
      textRange: {
        startLine: lineNumber,
        endLine: lineNumber,
        startColumn,
        endColumn
      }
    },
    effortMinutes: 30
  }
}

async function sourceFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const fullPath = resolve(dir, entry.name)
    const normalized = relative(root, fullPath).replaceAll('\\', '/')

    if (entry.isDirectory()) {
      if (normalized === 'src/test') {
        continue
      }
      files.push(...(await sourceFiles(fullPath)))
      continue
    }

    if (
      entry.isFile() &&
      (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) &&
      !entry.name.endsWith('.test.ts') &&
      !entry.name.endsWith('.test.tsx')
    ) {
      files.push(fullPath)
    }
  }

  return files
}

const files = await sourceFiles(resolve(root, 'src'))

const issues = []

for (const file of files) {
  const lines = (await readFile(file, 'utf8')).split(/\r?\n/)
  lines.forEach((line, index) => {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('*')) {
      return
    }

    for (const rule of rules) {
      if (rule.patterns.some((pattern) => pattern.test(line))) {
        issues.push(issueFor(file, index + 1, line, rule))
      }
    }
  })
}

await mkdir(dirname(output), { recursive: true })
const sonarRules = rules.map((rule) => ({
  id: rule.ruleId,
  name: rule.name,
  description: rule.description,
  engineId: 'yundoc-ci-rules',
  cleanCodeAttribute: rule.cleanCodeAttribute,
  type: rule.type,
  severity: rule.severity,
  impacts: [
    {
      softwareQuality: 'SECURITY',
      severity: rule.impactSeverity
    }
  ]
}))

await writeFile(output, `${JSON.stringify({ rules: sonarRules, issues }, null, 2)}\n`, 'utf8')
console.log(`Wrote ${issues.length} Sonar external issue(s) to ${relative(root, output)}`)
