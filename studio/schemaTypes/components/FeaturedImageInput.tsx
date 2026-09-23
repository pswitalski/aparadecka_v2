import type {ObjectInputProps, ReferenceValue} from 'sanity'

import {useCallback, useEffect, useState} from 'react'
import {set, unset, useClient, useFormValue} from 'sanity'

import {apiVersion} from '../../apiVersion'

type FeaturedImageInputProps = ObjectInputProps<ReferenceValue>

const EXISTING_PAINTINGS_QUERY = `*[_id in $ids]._id`

export function FeaturedImageInput(props: FeaturedImageInputProps) {
  const {onChange, renderDefault, value} = props
  const client = useClient({apiVersion})
  const paintings = useFormValue(['paintings']) as Array<{_ref?: string}> | undefined
  const signature = (paintings ?? [])
    .map((item) => item?._ref)
    .filter((ref): ref is string => Boolean(ref))
    .join(',')
  const valueRef = (value as undefined | {_ref?: string})?._ref
  const [existingIds, setExistingIds] = useState<null | Set<string>>(null)

  const loadExisting = useCallback(async () => {
    const ids = signature ? signature.split(',') : []
    if (ids.length === 0) {
      setExistingIds(new Set())
      return
    }

    try {
      const found = await client.fetch<string[]>(
        EXISTING_PAINTINGS_QUERY,
        {ids},
        {perspective: 'previewDrafts'},
      )
      setExistingIds(new Set(found))
    } catch {
      setExistingIds(new Set())
    }
  }, [client, signature])

  useEffect(() => {
    void loadExisting()
  }, [loadExisting])

  useEffect(() => {
    const subscription = client
      .listen('*[_type == "painting"]', {}, {includeResult: false, visibility: 'query'})
      .subscribe(() => {
        void loadExisting()
      })
    return () => subscription.unsubscribe()
  }, [client, loadExisting])

  useEffect(() => {
    if (!existingIds) return
    const current = valueRef ?? null
    const firstValid =
      (signature ? signature.split(',') : []).find((id) => existingIds.has(id)) ?? null
    const target = current && existingIds.has(current) ? current : firstValid
    if (target === current) return
    onChange(target === null ? unset() : set({_ref: target, _type: 'reference'}))
  }, [existingIds, onChange, signature, valueRef])

  return renderDefault(props)
}
