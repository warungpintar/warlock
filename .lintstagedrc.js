module.exports = {
  'src/**/*.{js?(x),ts?(x)}': [
    'eslint --fix',
    'prettier --write',
    // @TODO: {jest} 'yarn test --findRelatedTests',
  ],
  '**/*.ts?(x)': () => 'tsc -p tsconfig.json --noEmit',
};
