module.exports = {
  'src/types/config.schema.json': [
    'json2ts -o src/types/config.ts',
    'git add src/types/config.ts ',
  ],
  'src/**/*.{js?(x),ts?(x)}': [
    'eslint --fix',
    'prettier --write',
    `cross-env NODE_ENV=test jest --bail --findRelatedTests`,
  ],
  'src/**/*.ts?(x)': () => 'tsc -p tsconfig.json --noEmit',
};
