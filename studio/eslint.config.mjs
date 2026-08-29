import studio from '@sanity/eslint-config-studio'
import perfectionist from 'eslint-plugin-perfectionist'

export default [
  ...studio,
  perfectionist.configs['recommended-natural'],
  {
    rules: {
      // These reorder module-level declarations alphabetically, which can
      // introduce TDZ ReferenceErrors (const used before its definition).
      'perfectionist/sort-modules': 'off',
      'perfectionist/sort-variable-declarations': 'off',
    },
  },
]
