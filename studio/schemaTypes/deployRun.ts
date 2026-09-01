import {defineField, defineType} from 'sanity'

export const deployRun = defineType({
  fields: [
    defineField({
      name: 'branch',
      title: 'Branch',
      type: 'string',
    }),
    defineField({
      name: 'status',
      options: {
        list: [
          {title: 'In progress', value: 'in_progress'},
          {title: 'Success', value: 'success'},
          {title: 'Failed', value: 'failed'},
        ],
      },
      title: 'Status',
      type: 'string',
    }),
    defineField({
      name: 'message',
      title: 'Message',
      type: 'text',
    }),
    defineField({
      name: 'deployUrl',
      title: 'Deploy URL',
      type: 'url',
    }),
    defineField({
      name: 'startedAt',
      title: 'Started at',
      type: 'datetime',
    }),
    defineField({
      name: 'updatedAt',
      title: 'Updated at',
      type: 'datetime',
    }),
  ],
  name: 'deploy.run',
  title: 'Deploy run',
  type: 'document',
})
