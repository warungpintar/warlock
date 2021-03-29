const base = require('@warungpintar/warpin-scripts/config/eslint.config');

module.exports = {
  ...base,
  extends: [...base.extends, 'plugin:react/recommended', 'eslint:recommended'],
  rules: {
    '@typescript-eslint/camelcase': 'off',
    '@typescript-eslint/class-name-casing': 'off',
    '@typescript-eslint/generic-type-naming': 'off',
    '@typescript-eslint/member-naming': 'off',
    '@typescript-eslint/no-untyped-public-signature': 'off',
  },
  env: {
    browser: true,
    commonjs: true,
    node: true,
    es6: true,
  },
};
