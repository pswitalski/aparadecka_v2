import type {NumberInputProps} from 'sanity'

import {Select} from '@sanity/ui'
import {useToast} from '@sanity/ui/toast'
import {type ChangeEvent, useCallback, useEffect, useState} from 'react'
import {useClient, useFormValue} from 'sanity'

import {apiVersion} from '../../apiVersion'

type SourceCollection = {
  _id: string
  isThumbnail?: boolean
  key?: string
  year: number
}

type TargetCollection = {
  _id: string
  year: number
}

const COLLECTIONS_QUERY = `*[_type == "collection"] | order(year desc){_id, year}`

const SOURCES_QUERY = `*[_type == "collection" && $id in paintings[]._ref]{
  _id,
  year,
  "isThumbnail": thumbnail._ref == $id,
  "key": paintings[_ref == $id][0]._key
}`

const TARGET_VERSIONS_QUERY = `*[_id in [$id, $draftId]]{_id}`

const createKey = () => `${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`

export function YearSelectInput(props: NumberInputProps) {
  const client = useClient({apiVersion})
  const toast = useToast()
  const docId = useFormValue(['_id']) as string | undefined
  const paintingId = docId?.replace(/^drafts\./, '') ?? ''

  const [collections, setCollections] = useState<TargetCollection[]>([])
  const [sources, setSources] = useState<SourceCollection[]>([])
  const [error, setError] = useState<null | string>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const currentYear = sources.find((item) => !item._id.startsWith('drafts.'))?.year ?? sources[0]?.year

  const load = useCallback(async () => {
    if (!paintingId) {
      setIsLoading(false)
      return
    }
    try {
      const [all, mine] = await Promise.all([
        client.fetch<TargetCollection[]>(COLLECTIONS_QUERY),
        client.fetch<SourceCollection[]>(SOURCES_QUERY, {id: paintingId}, {perspective: 'raw'}),
      ])
      setCollections(all)
      setSources(mine)
      setError(null)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Failed to load years.')
    } finally {
      setIsLoading(false)
    }
  }, [client, paintingId])

  useEffect(() => {
    setIsLoading(true)
    void load()
  }, [load])

  useEffect(() => {
    const subscription = client
      .listen('*[_type == "collection"]', {}, {includeResult: false, visibility: 'query'})
      .subscribe(() => {
        void load()
      })
    return () => subscription.unsubscribe()
  }, [client, load])

  const onSelect = async (event: ChangeEvent<HTMLSelectElement>) => {
    const year = Number(event.target.value)
    const target = collections.find((item) => item.year === year)
    if (!target || !paintingId || currentYear === year) return
    setIsSaving(true)
    setError(null)
    try {
      const targetVersions = await client.fetch<{_id: string}[]>(
        TARGET_VERSIONS_QUERY,
        {draftId: `drafts.${target._id}`, id: target._id},
        {perspective: 'raw'},
      )
      const transaction = client.transaction()
      for (const source of sources) {
        const path = source.key ? `paintings[_key=="${source.key}"]` : `paintings[_ref=="${paintingId}"]`
        transaction.patch(source._id, (patch) =>
          patch.unset(source.isThumbnail ? ['thumbnail', path] : [path]),
        )
      }
      for (const version of targetVersions) {
        transaction.patch(version._id, (patch) =>
          patch
            .setIfMissing({paintings: []})
            .insert('after', 'paintings[-1]', [{_key: createKey(), _ref: paintingId, _type: 'reference'}]),
        )
      }
      await transaction.commit()
      const refreshed = await client.fetch<SourceCollection[]>(
        SOURCES_QUERY,
        {id: paintingId},
        {perspective: 'raw'},
      )
      setSources(refreshed)
      toast.push({status: 'success', title: `Moved to year ${year}`})
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Failed to move the painting.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      <Select
        disabled={isLoading || isSaving || props.readOnly}
        onChange={onSelect}
        value={currentYear ? String(currentYear) : ''}
      >
        <option value="">{isLoading ? 'Loading…' : 'Select year…'}</option>
        {collections.map((item) => (
          <option key={item._id} value={String(item.year)}>
            {item.year}
          </option>
        ))}
      </Select>
      {error ? <p style={{color: 'red', margin: '0.5rem 0 0'}}>{error}</p> : null}
    </>
  )
}