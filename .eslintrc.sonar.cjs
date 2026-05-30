module.exports = {
  root: true,
  env: {
    browser: true,
    es2020: true
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'prettier'
  ],
  ignorePatterns: ['dist', 'coverage', 'node_modules'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react-refresh'],
  parserOptions: {
    project: './tsconfig.json'
  },
  rules: {
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    '@typescript-eslint/consistent-type-imports': 'error',
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'complexity': ['error', { max: 22 }],
    'max-lines': ['error', { max: 300, skipBlankLines: true, skipComments: true }],
    'max-lines-per-function': ['error', { max: 240, skipBlankLines: true, skipComments: true }],
    'max-params': ['error', 5],
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-new-func': 'error',
    'no-script-url': 'error',
    'no-warning-comments': ['error', { terms: ['todo', 'fixme'], location: 'anywhere' }],
    'no-restricted-syntax': [
      'error',
      {
        selector: "JSXAttribute[name.name='dangerouslySetInnerHTML']",
        message: 'Render text through React escaping instead of dangerouslySetInnerHTML.'
      },
      {
        selector: "MemberExpression[property.name='innerHTML']",
        message: 'Do not read or write innerHTML with application data.'
      },
      {
        selector: "MemberExpression[property.name='outerHTML']",
        message: 'Do not read or write outerHTML with application data.'
      },
      {
        selector: "CallExpression[callee.property.name='insertAdjacentHTML']",
        message: 'Do not inject HTML strings into the DOM.'
      },
      {
        selector:
          'IfStatement > AssignmentExpression.test, WhileStatement > AssignmentExpression.test, DoWhileStatement > AssignmentExpression.test, ForStatement > AssignmentExpression.test, ConditionalExpression > AssignmentExpression.test',
        message: 'Avoid assignments inside conditional expressions.'
      }
    ]
  },
  overrides: [
    {
      files: ['src/**/*.test.ts', 'src/**/*.test.tsx', 'src/test/**/*'],
      rules: {
        'complexity': 'off',
        'max-lines': 'off',
        'max-lines-per-function': 'off',
        'max-params': 'off'
      }
    }
  ]
}
