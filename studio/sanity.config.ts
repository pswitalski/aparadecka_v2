import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'
import {structure} from './schemaTypes/structure'

const singletonTypes = ['home', 'about', 'contact', 'site']

export default defineConfig({
  name: 'default',
  title: 'aparadecka_v2',

  projectId: 'w73pc8ge',
  dataset: 'production',

  plugins: [structureTool({structure}), visionTool()],

  schema: {
    types: schemaTypes,
  },

  document: {
    newDocumentOptions: (prev) =>
      prev.filter((template) => {
        const schemaType = (template as {schemaType?: string}).schemaType
        return !singletonTypes.includes(schemaType ?? '')
      }),
    actions: (prev, context) =>
      context.schemaType && singletonTypes.includes(context.schemaType)
        ? prev.filter(({action}) => !['duplicate', 'delete', 'unpublish'].includes(action ?? ''))
        : prev,
  },
})
