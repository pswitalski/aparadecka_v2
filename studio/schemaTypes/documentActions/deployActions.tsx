import type {DocumentActionComponent} from 'sanity'

import {CopyIcon} from '@sanity/icons/Copy'
import {RefreshIcon} from '@sanity/icons/Refresh'
import {useState} from 'react'
import {useClient} from 'sanity'

const TRIGGER_ID = 'deploy.trigger'

type DialogState = {
  content: string
  header: string
  url: string
}

const CopyLink = ({url}: {url: string}) => {
  const [copied, setCopied] = useState(false)

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard unavailable — link remains clickable
    }
  }

  return (
    <span>
      {' '}
      <a href={url} rel="noopener noreferrer" target="_blank">
        {url}
      </a>{' '}
      <button onClick={onCopy} type="button">
        <CopyIcon /> {copied ? 'Copied' : 'Copy'}
      </button>
    </span>
  )
}

const makeDeployAction = (branch: string, label: string, url: string): DocumentActionComponent => {
  const DeployAction: DocumentActionComponent = () => {
    const client = useClient()
    const [isDeploying, setIsDeploying] = useState(false)
    const [dialog, setDialog] = useState<DialogState | null>(null)

    const onHandle = async () => {
      setIsDeploying(true)
      try {
        await client.createOrReplace({
          _id: TRIGGER_ID,
          _type: 'deploy.trigger',
          branch,
        })
        setDialog({
          content: `The site is rebuilding and deploying to ${branch}.`,
          header: 'Deploy triggered',
          url,
        })
      } catch (error) {
        setDialog({
          content: error instanceof Error ? error.message : 'Unexpected error while triggering deploy.',
          header: 'Deploy failed',
          url,
        })
      } finally {
        setIsDeploying(false)
      }
    }

    return {
      dialog: dialog && {
        content: (
          <>
            {dialog.content} <CopyLink url={dialog.url} />
          </>
        ),
        header: dialog.header,
        onClose: () => setDialog(null),
        showCloseButton: true,
        type: 'dialog',
      },
      disabled: isDeploying,
      icon: RefreshIcon,
      label: isDeploying ? `Deploying ${branch}…` : label,
      onHandle,
    }
  }

  DeployAction.displayName = label

  return DeployAction
}

export const deployToProdAction = makeDeployAction(
  'prod',
  'Deploy to prod',
  'https://aparadecka-v2.pages.dev',
)

export const deployToStageAction = makeDeployAction(
  'stage',
  'Deploy to stage',
  'https://stage.aparadecka-v2.pages.dev',
)
