const { pathsToModuleNameMapper } = require('ts-jest/utils');
const { compilerOptions } = require('./tsconfig');

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverageFrom: ['**/__tests__/**/*.spec.[jt]s?(x)'],
  transform: { '.(ts|tsx)$': 'ts-jest/dist' },
  transformIgnorePatterns: ['[/\\\\]node_modules[/\\\\].+\\.(js|jsx)$'],
  // blocking on CI, remove testPathIgnorePatterns on dev
  testPathIgnorePatterns: [
    '__tests__/cache.spec.ts',
    '__tests__/jsonResolver1.spec.ts',
    '__tests__/jsonResolver.spec.ts',
    '__tests__/piping-resolver.spec.ts',
    '__tests__/callbackPackageResolver.spec.ts',
    '__tests__/fakerResolver.spec.ts',
    '__tests__/fakerResolver1.spec.ts',
    '__tests__/callbackResolver.spec.ts',
    '__tests__/callbackResolver1.spec.ts',
    '__tests__/proxy-pub.spec.ts'
  ],
  testMatch: ['**/__tests__/**/*.spec.[jt]s?(x)'],
  testTimeout: 15000,
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
    },
  },
};
