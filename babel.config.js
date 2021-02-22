const BABEL_ENV = process.env.BABEL_ENV;
const isCommonJS = BABEL_ENV !== undefined && BABEL_ENV === 'cjs';
const isESM = BABEL_ENV !== undefined && BABEL_ENV === 'esm';
const BASE = require('@warungpintar/warpin-scripts/config/babel.config');

module.exports = function(api) {
  const base = BASE(api);
  const overrides = [
    {
      presets: [
        [
          '@babel/env',
          {
            loose: true,
            modules: isCommonJS ? 'commonjs' : false,
            targets: {
              esmodules: isESM ? true : undefined,
            },
          },
        ],
      ],
    },
  ];
  const ignore = [
    '**/__tests__', // ignore the whole test directory
    '**/*.test.js', // ignore test files only
  ];

  return {
    ...base,
    overrides,
    ignore,
  };
};
