module.exports = {
  root: true,
  env: {
    browser: true,
    es6: true,
    node: true,
    'jest/globals': true,
  },
  plugins: ['prettier', 'jest'],
  rules:{'prettier/prettier':"warn"},
  extends: ['tui', 'plugin:prettier/recommended', 'plugin:jest/recommended'],
  parserOptions: {
    sourceType: 'module',
  },
};
