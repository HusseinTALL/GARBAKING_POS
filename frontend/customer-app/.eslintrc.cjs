/* eslint-env node */
try {
  require('@rushstack/eslint-patch/modern-module-resolution')
} catch {
  // Optional patch; continue if the dependency is not available.
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
  // Prettier bridge optional; ignore when missing.
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
    'vue/multi-word-component-names': 'off'
  }
}
