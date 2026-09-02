import {TrashIcon} from '@sanity/icons/Trash'
import {Button, Dialog, Flex, Stack, Text} from '@sanity/ui'
import {useToast} from '@sanity/ui/toast'
import {useState} from 'react'
import {
  type ArrayOfObjectsInputProps,
  type ObjectItemProps,
  unset,
  useClient,
  useFormValue,
} from 'sanity'

import {apiVersion} from '../../apiVersion'
import {deleteAssetIfUnused, deletePainting, getPaintingAssetId} from '../lib/paintingCleanup'

type PendingRemove = {
  itemProps: Omit<ObjectItemProps, 'renderDefault'>
  paintingId: string
}

export function PaintingsArrayInput(props: ArrayOfObjectsInputProps) {
  const client = useClient({apiVersion})
  const toast = useToast()
  const docId = useFormValue(['_id']) as string | undefined
  const thumbnail = useFormValue(['thumbnail']) as undefined | {_ref?: string}
  const [pending, setPending] = useState<null | PendingRemove>(null)
  const [isRemoving, setIsRemoving] = useState(false)

  const onRemoveRequest = (itemProps: Omit<ObjectItemProps, 'renderDefault'>) => {
    const item = (props.value ?? [])[itemProps.index]
    const paintingId = (item as undefined | {_ref?: string})?._ref
    if (!paintingId) {
      itemProps.onRemove()
      return
    }
    setPending({itemProps, paintingId})
  }

  const closeDialog = () => {
    if (isRemoving) return
    setPending(null)
  }

  const confirmRemove = async () => {
    if (!pending) return
    const {itemProps, paintingId} = pending
    setIsRemoving(true)
    try {
      itemProps.onRemove()
      if (thumbnail?._ref === paintingId) {
        props.onChange(unset(['thumbnail']))
      }
      const baseId = (docId ?? '').replace(/^drafts\./, '')
      const excludeIds = new Set([baseId, docId ?? ''])
      const assetId = await getPaintingAssetId(client, paintingId)
      await deletePainting(client, paintingId, [...excludeIds])
      if (assetId) {
        await deleteAssetIfUnused(client, assetId)
      }
      toast.push({status: 'success', title: 'Obraz został usunięty'})
      setPending(null)
    } catch (error) {
      toast.push({
        status: 'error',
        title: error instanceof Error ? error.message : 'Nie udało się usunąć obrazu.',
      })
    } finally {
      setIsRemoving(false)
    }
  }

  return (
    <>
      {props.renderDefault({
        ...props,
        renderItem: (itemProps: Omit<ObjectItemProps, 'renderDefault'>) =>
          props.renderItem({
            ...itemProps,
            onRemove: () => onRemoveRequest(itemProps),
          }),
      })}
      {pending ? (
        <Dialog
          footer={
            <Flex gap={2} justify="flex-end">
              <Button disabled={isRemoving} onClick={closeDialog} text="Anuluj" />
              <Button
                icon={TrashIcon}
                loading={isRemoving}
                onClick={() => void confirmRemove()}
                text="Usuń"
                tone="critical"
              />
            </Flex>
          }
          header="Usunąć obraz?"
          id="remove-painting-dialog"
          onClose={closeDialog}
        >
          <Stack gap={3}>
            <Text>
              Obraz zostanie trwale usunięty z Sanity — również ze strony głównej i miniatur. Tej
              operacji nie można cofnąć.
            </Text>
          </Stack>
        </Dialog>
      ) : null}
    </>
  )
}