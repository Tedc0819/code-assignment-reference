module.exports = {
  ignorePatterns: ['*.spec.js'],
  env: {
    commonjs: true,
    es2021: true,
    node: true,
  },
  extends: [
    'airbnb-base',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
  },
  rules: {
    'max-classes-per-file': 0,
    'class-methods-use-this': 0,
    'default-param-last': 0,
    'max-len': 0,
  },
};
