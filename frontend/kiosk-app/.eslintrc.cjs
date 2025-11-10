/* eslint-env node */
try {
  require('@rushstack/eslint-patch/modern-module-resolution')
} catch {
  // Optional patch; skip when unavailable.
}

module.exports = {
  root: true,
  extends: [
    'plugin:vue/vue3-essential',
    'eslint:recommended',
    '@vue/eslint-config-typescript'
  ],
  parserOptions: {
    ecmaVersion: 'latest'
  },
  rules: {
    'vue/multi-word-component-names': 'off'
  }
}
