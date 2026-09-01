import {defineField, defineType} from 'sanity'

export const deployTrigger = defineType({
  fields: [
    defineField({
      initialValue: 'prod',
      name: 'branch',
      title: 'Branch',
      type: 'string',
    }),
  ],
  name: 'deploy.trigger',
  title: 'Deploy trigger',
  type: 'document',
})