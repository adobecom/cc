module.exports = {
  root: true,
  extends: 'airbnb-base',
  env: {
    browser: true,
    mocha: true,
  },
  parser: '@babel/eslint-parser',
  parserOptions: {
    allowImportExportEverywhere: true,
    sourceType: 'module',
    requireConfigFile: false,
  },
  rules: {
    'no-param-reassign': [
      2,
      { props: false },
    ],
    'linebreak-style': [
      'error',
      'unix',
    ],
    'import/extensions': [
      'error',
      { js: 'always' },
    ],
    'object-curly-newline': [
      'error',
      {
        ObjectExpression: {
          multiline: true,
          minProperties: 6,
        },
        ObjectPattern: {
          multiline: true,
          minProperties: 6,
        },
        ImportDeclaration: {
          multiline: true,
          minProperties: 6,
        },
        ExportDeclaration: 'never',
      },
    ],
    'no-unused-expressions': 0,
    'chai-friendly/no-unused-expressions': 2,
  },
  overrides: [
    {
      files: [
        'test/**/*.js',
      ],
      rules: { 'no-console': 'off' },
    },
    {
      files: [
        'nala/**/*.js',
        'nala/**/*.test.js',
      ],
      rules: {
        'no-console': 0,
        'import/no-extraneous-dependencies': 0,
        'max-len': 0,
        'chai-friendly/no-unused-expressions': 0,
        'no-plusplus': 0,
        'no-restricted-syntax': 0,
        'import/prefer-default-export': 'off',
        'global-require': 'off',
        'default-param-last': 'off',
      },
    },
  ],
  plugins: [
    'chai-friendly',
  ],
  ignorePatterns: [
    '/creativecloud/deps/*',
  ],
};
