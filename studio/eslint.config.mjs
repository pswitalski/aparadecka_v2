import studio from '@sanity/eslint-config-studio'
import perfectionist from 'eslint-plugin-perfectionist'

export default [
  ...studio,
  perfectionist.configs['recommended-natural'],
  {
    rules: {
      'perfectionist/sort-modules': 'off',
      'perfectionist/sort-variable-declarations': 'off',
    },
  },
]
