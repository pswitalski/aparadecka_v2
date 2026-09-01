import type {DocumentActionComponent} from 'sanity'

import {CheckmarkCircleIcon} from '@sanity/icons/CheckmarkCircle'
import {CopyIcon} from '@sanity/icons/Copy'
import {ErrorOutlineIcon} from '@sanity/icons/ErrorOutline'
import {RefreshIcon} from '@sanity/icons/Refresh'
import {useEffect, useState} from 'react'
import {useClient} from 'sanity'

const TRIGGER_ID = 'deploy.trigger'
const RUN_ID_PREFIX = 'deploy.run.'
const TIMEOUT_MS = 10 * 60 * 1000

type DeployRun = {
  _id: string
  _type: string
  branch?: string
  deployUrl?: string
  message?: string
  status?: 'failed' | 'in_progress' | 'success'
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

const makeDeployAction = (branch: string, label: string, stableUrl: string): DocumentActionComponent => {
  const DeployAction: DocumentActionComponent = () => {
    const client = useClient()
    const [dialogOpen, setDialogOpen] = useState(false)
    const [isDeploying, setIsDeploying] = useState(false)
    const [run, setRun] = useState<DeployRun | null>(null)
    const [timedOut, setTimedOut] = useState(false)
    const [triggerError, setTriggerError] = useState<null | string>(null)

    const runId = `${RUN_ID_PREFIX}${branch}`

    useEffect(() => {
      if (!dialogOpen) {
        return
      }

      setTimedOut(false)
      setRun(null)

      const subscription = client
        .listen(
          '*[_type == "deploy.run" && _id == $id][0]',
          {id: runId},
          {includeMutations: false, includeResult: true},
        )
        .subscribe((event) => {
          if (event.type === 'mutation' && event.result) {
            setRun(event.result as DeployRun)
          }
        })

      const timeout = setTimeout(() => setTimedOut(true), TIMEOUT_MS)

      return () => {
        subscription.unsubscribe()
        clearTimeout(timeout)
      }
    }, [client, dialogOpen, runId])

    const onHandle = async () => {
      setIsDeploying(true)
      setTriggerError(null)
      try {
        await client.createOrReplace({
          _id: TRIGGER_ID,
          _type: 'deploy.trigger',
          branch,
        })
        setDialogOpen(true)
      } catch (error) {
        setTriggerError(error instanceof Error ? error.message : 'Unexpected error while triggering deploy.')
        setDialogOpen(true)
      } finally {
        setIsDeploying(false)
      }
    }

    const onClose = () => setDialogOpen(false)

    const content = (() => {
      if (triggerError) {
        return (
          <p>
            <ErrorOutlineIcon /> {triggerError} <CopyLink url={stableUrl} />
          </p>
        )
      }
      if (run?.status === 'success') {
        return (
          <p>
            <CheckmarkCircleIcon /> The site deployed successfully. <CopyLink url={run.deployUrl || stableUrl} />
          </p>
        )
      }
      if (run?.status === 'failed') {
        return (
          <p>
            <ErrorOutlineIcon /> The deploy failed. {run.message || 'Check GitHub Actions for details.'} <CopyLink url={stableUrl} />
          </p>
        )
      }
      if (timedOut) {
        return (
          <p>
            The build has not reported a final status yet. Check GitHub Actions for progress. <CopyLink url={stableUrl} />
          </p>
        )
      }
      return <p>Deploying to {branch}… The site is being rebuilt and can take a few minutes.</p>
    })()

    const header = (() => {
      if (triggerError) {
        return 'Deploy failed'
      }
      if (run?.status === 'success') {
        return 'Deploy successful'
      }
      if (run?.status === 'failed') {
        return 'Deploy failed'
      }
      if (timedOut) {
        return 'Deploy still running'
      }
      return `Deploying to ${branch}…`
    })()

    return {
      dialog:
        dialogOpen && {
          content,
          header,
          onClose,
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