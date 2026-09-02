import {TrashIcon} from '@sanity/icons/Trash'
import {useState} from 'react'
import {type DocumentActionComponent, useClient} from 'sanity'

import {apiVersion} from '../../apiVersion'
import {deleteAssetIfUnused, deletePainting, getPaintingAssetId} from '../lib/paintingCleanup'

const COLLECTION_QUERY = `*[_type == "collection" && _id in [$id, $draftId]][0]{
  "paintings": paintings[]._ref
}`

const CollectionDeleteAction: DocumentActionComponent = (props) => {
  const client = useClient({apiVersion})
  const [isDeleting, setIsDeleting] = useState(false)
  const [open, setOpen] = useState(false)
  const [count, setCount] = useState(0)

  const collectionId = props.id.replace(/^drafts\./, '')

  const onHandle = async () => {
    try {
      const result = await client.fetch<null | {paintings?: string[]}>(
        COLLECTION_QUERY,
        {draftId: `drafts.${collectionId}`, id: collectionId},
        {perspective: 'raw'},
      )
      setCount(result?.paintings?.length ?? 0)
      setOpen(true)
    } catch (error) {
      console.error('Failed to load collection paintings.', error)
    }
  }

  const onConfirm = async () => {
    setIsDeleting(true)
    try {
      const result = await client.fetch<null | {paintings?: string[]}>(
        COLLECTION_QUERY,
        {draftId: `drafts.${collectionId}`, id: collectionId},
        {perspective: 'raw'},
      )
      const paintingIds = result?.paintings ?? []
      const assetIds: string[] = []
      for (const paintingId of paintingIds) {
        const assetId = await getPaintingAssetId(client, paintingId)
        if (assetId) assetIds.push(assetId)
        await deletePainting(client, paintingId)
      }
      const transaction = client.transaction()
      transaction.delete(collectionId).delete(`drafts.${collectionId}`)
      await transaction.commit()
      for (const assetId of assetIds) {
        await deleteAssetIfUnused(client, assetId)
      }
      setOpen(false)
    } catch (error) {
      console.error('Failed to delete collection and its paintings.', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const message =
    count === 0
      ? 'Usuniesz ten rocznik. Nie zawiera żadnych obrazów.'
      : `Usuniesz ten rocznik oraz ${count} obrazów. Obrazy zostaną trwale usunięte, również ze strony głównej. Tej operacji nie można cofnąć.`

  return {
    dialog: open
      ? {
          cancelButtonText: 'Anuluj',
          confirmButtonText: 'Usuń',
          message,
          onCancel: () => setOpen(false),
          onConfirm: () => void onConfirm(),
          tone: 'critical',
          type: 'confirm',
        }
      : null,
    disabled: isDeleting,
    icon: TrashIcon,
    label: 'Delete',
    onHandle: () => void onHandle(),
  }
}

export {CollectionDeleteAction as deleteCollectionAction}