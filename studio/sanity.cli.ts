import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    dataset: 'production',
    projectId: 'w73pc8ge'
  },
  deployment: {
    appId: 'q5my8gnk3bxcy3xugnga1xf0',
    /**
     * Enable auto-updates for studios.
     * Learn more at https://www.sanity.io/docs/studio/latest-version-of-sanity#k47faf43faf56
     */
    autoUpdates: true,
  },
  typegen: {
    generates: '../web/sanity.types.ts',
    overloadClientMethods: true,
    path: '../web/src/**/*.{ts,tsx}',
    schema: 'schema.json',
  },
  /**
   * The Studio preview imports `shared/rich-text.css` from the repo root, which
   * sits outside Vite's default serving allow list (the workspace root is the
   * studio folder). Add the parent directory so dev and preview can serve it.
   */
  vite: (config) => {
    config.server ??= {}
    config.server.fs ??= {}
    config.server.fs.allow = [...(config.server.fs.allow ?? []), '..']
    return config
  },
})
