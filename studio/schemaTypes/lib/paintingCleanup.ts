import type {SanityClient} from 'sanity'

type ReferencingDoc = {
  _id: string
  _type: string
  thumbRef?: string
}

const REFERENCING_DOCS_QUERY = `*[_type in ["home", "collection"] && references($id)]{
  _id,
  _type,
  "thumbRef": thumbnail._ref
}`

const ASSET_QUERY = `*[_type == "painting" && _id in [$id, $draftId]][0].mainImage.asset._ref`

const ASSET_IN_USE_QUERY = `count(*[references($id)])`

export async function getPaintingAssetId(client: SanityClient, paintingId: string): Promise<null | string> {
  return client.fetch(
    ASSET_QUERY,
    {draftId: `drafts.${paintingId}`, id: paintingId},
    {perspective: 'raw'},
  )
}

export async function deletePainting(
  client: SanityClient,
  paintingId: string,
  excludeIds: string[] = [],
): Promise<void> {
  const referencing = await client.fetch<ReferencingDoc[]>(
    REFERENCING_DOCS_QUERY,
    {id: paintingId},
    {perspective: 'raw'},
  )
  const excluded = new Set(excludeIds)
  const transaction = client.transaction()
  for (const doc of referencing) {
    if (excluded.has(doc._id)) continue
    if (doc._type === 'home') {
      transaction.patch(doc._id, (patch) => patch.unset([`featured[_ref=="${paintingId}"]`]))
    } else {
      transaction.patch(doc._id, (patch) => {
        let builder = patch.unset([`paintings[_ref=="${paintingId}"]`])
        if (doc.thumbRef === paintingId) builder = builder.unset(['thumbnail'])
        return builder
      })
    }
  }
  transaction.delete(paintingId).delete(`drafts.${paintingId}`)
  await transaction.commit()
}

export async function deleteAssetIfUnused(client: SanityClient, assetId: string): Promise<void> {
  const count = await client.fetch<number>(ASSET_IN_USE_QUERY, {id: assetId})
  if (count === 0) {
    await client.delete(assetId)
  }
}