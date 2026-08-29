import studio from '@sanity/eslint-config-studio'
import perfectionist from 'eslint-plugin-perfectionist'

export default [
  ...studio,
  perfectionist.configs['recommended-natural'],
]
