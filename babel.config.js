const BUILD_ENV = process.env.BUILD_ENV;
const isCommonJS = BUILD_ENV !== undefined && BUILD_ENV === 'cjs';
const isESM = BUILD_ENV !== undefined && BUILD_ENV === 'esm';

const targets = {
  esmodules: isESM ? true : undefined,
};
module.exports = {
  presets: [
    '@babel/preset-react',
    [
      '@babel/env',
      {
        loose: true,
        modules: isCommonJS ? 'commonjs' : false,
        targets: {
          ...targets,
          ...(isCommonJS ? { node: '10' } : {}),
        },
      },
    ],
  ],
  plugins: ['@babel/plugin-transform-runtime', ['inline-json-import', {}]],
  ignore: [
    '**/__tests__', // ignore the whole test directory
    '**/*.test.js', // ignore test files only
  ],
};
