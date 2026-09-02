import {visionTool} from '@sanity/vision'
import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'

import {schemaTypes} from './schemaTypes'
import {deleteCollectionAction} from './schemaTypes/documentActions/deleteCollectionAction'
import {deployToProdAction, deployToStageAction} from './schemaTypes/documentActions/deployActions'
import {structure} from './schemaTypes/structure'

const singletonTypes = ['home', 'about', 'contact', 'site']

export default defineConfig({
  dataset: 'production',
  document: {
    actions: (prev, context) => {
      const base =
        context.schemaType && singletonTypes.includes(context.schemaType)
          ? prev.filter(({action}) => !['delete', 'duplicate', 'unpublish'].includes(action ?? ''))
          : prev
      const collectionActions =
        context.schemaType === 'collection'
          ? base.map((action) => (action.action === 'delete' ? deleteCollectionAction : action))
          : base
      return context.schemaType && context.schemaType !== 'deploy.trigger'
        ? [...collectionActions, deployToStageAction, deployToProdAction]
        : collectionActions
    },
    newDocumentOptions: (prev) =>
      prev.filter((template) => {
        const schemaType = (template as {schemaType?: string}).schemaType
        return (
          !singletonTypes.includes(schemaType ?? '') &&
          schemaType !== 'deploy.trigger' &&
          schemaType !== 'painting'
        )
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
