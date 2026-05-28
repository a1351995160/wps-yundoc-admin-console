module.exports = {
  root: true,
  env: {
    browser: true,
    es2020: true
  },
  extends: ['eslint-config-ali/typescript/react', 'prettier'],
  ignorePatterns: ['dist', 'coverage', 'node_modules'],
  parserOptions: {
    project: './tsconfig.json'
  },
  rules: {
    '@typescript-eslint/consistent-type-imports': 'error',
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }]
  }
}
