/*
 * One-off migration for the O mnie block content:
 *
 * 1. Split text blocks that pack several lines together with soft breaks (a
 *    newline inside one block) into one block per line. In Portable Text
 *    `listItem` is a block property, so lines joined by soft breaks become a
 *    single list item, which makes the bullet button feel like it hits the
 *    whole block. Splitting renders the same for plain paragraphs and lets an
 *    editor bullet a single line.
 * 2. Drop `listItem`/`level` from blocks that are empty. A blank line that is
 *    also a list item renders as a stray empty bullet marker.
 *
 * Dry run by default. Write with:
 *   APPLY=1 npx sanity exec scripts/normalize-about-blocks.ts --with-user-token
 */
import {getCliClient} from 'sanity/cli'

const APPLY = process.env.APPLY === '1'
const DOC_IDS = ['about']

const KEY_ALPHABET = 'abcdefghijklmnopqrstuvwxyz0123456789'

type Span = {
  _key?: string
  _type: string
  marks?: string[]
  text?: string
}

type Block = {
  _key?: string
  _type: string
  children?: Span[]
  level?: number
  listItem?: string
  markDefs?: unknown[]
  style?: string
}

const client = getCliClient({apiVersion: '2026-08-15'})

function randomKey(): string {
  let out = ''
  for (let index = 0; index < 12; index += 1) {
    out += KEY_ALPHABET[Math.floor(Math.random() * KEY_ALPHABET.length)]
  }
  return out
}

function blockText(block: Block): string {
  return (block.children ?? [])
    .map((child) => (child._type === 'span' ? (child.text ?? '') : ''))
    .join('')
}

/** Splits one block into N blocks, one per line, preserving marks and markDefs. */
function splitBlock(block: Block): Block[] {
  if (block._type !== 'block' || !Array.isArray(block.children)) return [block]

  const lines: Span[][] = [[]]

  for (const child of block.children) {
    const text = child._type === 'span' ? child.text : undefined

    if (typeof text !== 'string' || !text.includes('\n')) {
      lines[lines.length - 1].push(child)
      continue
    }

    text.split('\n').forEach((part, index) => {
      if (index > 0) lines.push([])
      if (part !== '') lines[lines.length - 1].push({...child, _key: randomKey(), text: part})
    })
  }

  if (lines.length === 1) return [block]

  return lines.map((spans) => ({
    ...block,
    _key: randomKey(),
    children: spans.length > 0 ? spans : [{_key: randomKey(), _type: 'span', marks: [], text: ''}],
  }))
}

/** An empty block must not be a list item, or it renders a stray bullet. */
function normalizeBlock(block: Block): Block {
  if (blockText(block).trim() !== '') return block
  if (block.listItem === undefined && block.level === undefined) return block

  const next = {...block}
  delete next.listItem
  delete next.level
  return next
}

function transformSections(sections: unknown): unknown {
  if (!Array.isArray(sections)) return sections

  return sections.map((section) => {
    const value = section as null | {text?: Block[]}
    if (!value || !Array.isArray(value.text)) return section

    return {...value, text: value.text.flatMap(splitBlock).map(normalizeBlock)}
  })
}

function collectBlocks(sections: unknown): Block[] {
  if (!Array.isArray(sections)) return []
  return sections.flatMap((section) => (section as null | {text?: Block[]})?.text ?? [])
}

async function main() {
  console.log(APPLY ? 'MODE: apply' : 'MODE: dry run (set APPLY=1 to write)')

  for (const id of DOC_IDS) {
    const doc = await client.getDocument(id)
    if (!doc) {
      console.log(`\n${id}: not found, skipping`)
      continue
    }

    const before = collectBlocks(doc.sections)
    const nextSections = transformSections(doc.sections)
    const after = collectBlocks(nextSections)

    if (before.length === after.length && before.every((block, index) => block === after[index])) {
      console.log(`\n${id}: nothing to change (${before.length} blocks)`)
      continue
    }

    const beforeText = before.map(blockText).join('\n')
    const afterText = after.map(blockText).join('\n')

    console.log(`\n${id}: ${before.length} blocks -> ${after.length} blocks`)

    if (beforeText !== afterText) {
      console.log('  ABORT: text content would change, refusing to touch this document')
      continue
    }
    console.log('  text content preserved (verified)')

    const multiline = before.filter((block) => splitBlock(block).length > 1)
    multiline.forEach((block) => {
      console.log(`\n  split (${splitBlock(block).length} lines -> 1 block):`)
      blockText(block)
        .split('\n')
        .forEach((line) => console.log(`    | ${line}`))
    })

    const strayBullets = after.filter((block) => block.listItem).length
    const beforeBullets = before.filter((block) => block.listItem).length
    if (strayBullets !== beforeBullets) {
      console.log(`\n  list items: ${beforeBullets} -> ${strayBullets} (empty blocks unlisted)`)
    }

    if (APPLY) {
      await client.patch(id).set({sections: nextSections}).commit()
      console.log('\n  applied')
    } else {
      console.log('\n  dry run only — not written')
    }
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
