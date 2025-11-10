/* eslint-env node */
try {
  require('@rushstack/eslint-patch/modern-module-resolution')
} catch {
  // Module is optional; continue without the patch when not installed.
}

const baseExtends = [
  'plugin:vue/vue3-essential',
  'eslint:recommended',
  '@vue/eslint-config-typescript'
]

try {
  require.resolve('@vue/eslint-config-prettier/skip-formatting')
  baseExtends.push('@vue/eslint-config-prettier/skip-formatting')
} catch {
  // Optional prettier bridge; continue if not installed.
}

module.exports = {
  root: true,
  extends: baseExtends,
  parserOptions: {
    ecmaVersion: 'latest'
  },
  env: {
    node: true
  },
  rules: {
    'vue/multi-word-component-names': 'off',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'prefer-const': 'error',
    'no-var': 'error',
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'vue/no-unused-components': 'warn',
    'vue/no-unused-vars': 'warn',
    'vue/component-definition-name-casing': ['error', 'PascalCase'],
    'vue/component-name-in-template-casing': ['error', 'PascalCase'],
    'vue/prop-name-casing': ['error', 'camelCase'],
    'vue/attribute-hyphenation': ['error', 'always'],
    'vue/v-on-event-hyphenation': ['error', 'always'],
  }
}
