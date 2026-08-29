import js from '@eslint/js'
import astro from 'eslint-plugin-astro'
import perfectionist from 'eslint-plugin-perfectionist'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default [
  {ignores: ['dist', '.astro', 'node_modules', 'sanity.types.ts']},
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs.recommended,
  perfectionist.configs['recommended-natural'],
  {
    rules: {
      'perfectionist/sort-modules': 'off',
      'perfectionist/sort-variable-declarations': 'off',
    },
  },
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  {
    files: ['**/*.astro'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
      },
    },
  },
]
