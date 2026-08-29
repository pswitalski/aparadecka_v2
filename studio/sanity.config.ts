import {visionTool} from '@sanity/vision'
import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'

import {schemaTypes} from './schemaTypes'
import {structure} from './schemaTypes/structure'

const singletonTypes = ['home', 'about', 'contact', 'site']

export default defineConfig({
  dataset: 'production',
  document: {
    actions: (prev, context) =>
      context.schemaType && singletonTypes.includes(context.schemaType)
        ? prev.filter(({action}) => !['delete', 'duplicate', 'unpublish'].includes(action ?? ''))
        : prev,
    newDocumentOptions: (prev) =>
      prev.filter((template) => {
        const schemaType = (template as {schemaType?: string}).schemaType
        return !singletonTypes.includes(schemaType ?? '')
      }),
  },

  name: 'default',
  plugins: [structureTool({structure}), visionTool()],

  projectId: 'w73pc8ge',

  schema: {
    types: schemaTypes,
  },

  title: 'aparadecka_v2',
})
