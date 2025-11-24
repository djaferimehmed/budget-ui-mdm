// @ts-check
const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');

module.exports = tseslint.config(
  {
    // https://github.com/angular-eslint/angular-eslint/tree/main/packages/eslint-plugin/docs/rules
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.stylistic,
      ...angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      '@angular-eslint/component-class-suffix': ['error', { suffixes: ['Component', 'Page'] }],
      '@angular-eslint/component-selector': ['error', { type: 'element', prefix: 'app', style: 'kebab-case' }],
      '@angular-eslint/directive-selector': ['error', { type: 'attribute', prefix: 'app', style: 'camelCase' }],
      '@angular-eslint/no-duplicates-in-metadata-arrays': ['error'],
      '@angular-eslint/no-empty-lifecycle-method': ['error'],
      '@angular-eslint/prefer-output-readonly': ['error'],
      // '@angular-eslint/prefer-signals': ['error'],
      '@angular-eslint/prefer-standalone': ['error'],
      '@angular-eslint/relative-url-prefix': ['error'],
      '@angular-eslint/require-lifecycle-on-prototype': ['error'],
      '@angular-eslint/sort-lifecycle-methods': ['error'],
      '@angular-eslint/use-component-view-encapsulation': ['error'],
      '@angular-eslint/use-injectable-provided-in': ['error'],
      '@angular-eslint/use-lifecycle-interface': ['error'],
      '@angular-eslint/use-pipe-transform-interface': ['error'],
      'no-restricted-imports': [
        'error',
        { name: `@ionic/angular`, message: `Use standalone imports only` },
        { name: `@ionic/angular/common`, message: `Use standalone imports only` },
      ],
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: `^_$`, caughtErrorsIgnorePattern: `^_$` }],
    },
  },
  {
    // https://github.com/angular-eslint/angular-eslint/tree/main/packages/eslint-plugin-template/docs/rules
    files: ['**/*.html'],
    extends: [...angular.configs.templateRecommended, ...angular.configs.templateAccessibility],
    rules: {
      '@angular-eslint/template/attributes-order': ['error'],
      '@angular-eslint/template/elements-content': ['warn'],
      '@angular-eslint/template/eqeqeq': ['error'],
      '@angular-eslint/template/no-any': ['warn'],
      '@angular-eslint/template/no-duplicate-attributes': ['error'],
      '@angular-eslint/template/no-negated-async': ['error'],
      // '@angular-eslint/template/prefer-contextual-for-variables': ['error'],
      '@angular-eslint/template/prefer-control-flow': ['error'],
      '@angular-eslint/template/prefer-self-closing-tags': ['error'],
      '@angular-eslint/template/prefer-static-string-properties': ['error'],
    },
  },
);
