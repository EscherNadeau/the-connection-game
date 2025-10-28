module.exports = {
  root: true,
  env: { browser: true, es2021: true, node: true },
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-recommended',
    '@vue/eslint-config-prettier',
    'prettier'
  ],
  plugins: ['import'],
  rules: {
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'import/no-cycle': ['warn', { maxDepth: 1 }]
  },
  settings: {
    'import/resolver': {
      alias: {
        map: [
          ['@', './src'],
          ['@services', './src/services'],
          ['@components', './src/components'],
          ['@views', './src/views'],
          ['@modes', './src/modes'],
          ['@utils', './src/utils'],
          ['@store', './src/store']
        ],
        extensions: ['.js', '.vue']
      }
    }
  }
}


