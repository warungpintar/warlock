const base = require('@warungpintar/warpin-scripts/config/eslint.config');

module.exports = {
  ...base,
  extends: [...base.extends, 'plugin:react/recommended'],
};
