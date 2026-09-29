type TurnstileOptions = {
	appearance?: 'always' | 'execute' | 'interaction-only'
	callback?: (token: string) => void
	'error-callback'?: (errorCode: string) => void
	'expired-callback'?: () => void
	sitekey: string
	size?: 'compact' | 'flexible' | 'normal'
	theme?: 'auto' | 'dark' | 'light'
}

interface TurnstileApi {
	getResponse: (widgetId?: string) => string
	remove: (widgetId?: string) => void
	render: (element: HTMLElement, options: TurnstileOptions) => string
	reset: (widgetId?: string) => void
}

export interface TurnstileHandle {
	getToken: () => Promise<string>
	reset: () => void
}

export interface TurnstileElement extends HTMLElement {
	getToken: () => Promise<string>
	reset: () => void
}

type TurnstileSize = 'compact' | 'flexible'

const API_TIMEOUT_MS = 30_000
const COMPACT_BREAKPOINT = 200
const TOKEN_TIMEOUT_MS = 30_000

const api = () => (window as unknown as {turnstile?: TurnstileApi}).turnstile

const waitForApi = (): Promise<null | TurnstileApi> =>
	new Promise((resolve) => {
		const startedAt = Date.now()

		const tick = () => {
			const turnstile = api()

			if (turnstile) {
				resolve(turnstile)
			} else if (Date.now() - startedAt > API_TIMEOUT_MS) {
				resolve(null)
			} else {
				setTimeout(tick, 100)
			}
		}

		tick()
	})

/* Always-visible widget: `flexible` fills the column and is scaled down if needed; `compact` is
   used only when the column drops below the compact breakpoint. Token arrives via the callback. */
export function mountTurnstile(container: HTMLElement): TurnstileHandle {
	let currentSize: TurnstileSize | undefined
	let resolvePending: ((token: string) => void) | null = null
	let token = ''
	let widgetId: string | undefined

	const preferredSize = (): TurnstileSize =>
		container.clientWidth < COMPACT_BREAKPOINT ? 'compact' : 'flexible'

	const settle = (value: string) => {
		token = value
		resolvePending?.(value)
		resolvePending = null
	}

	const renderWidget = (turnstile: TurnstileApi) => {
		const size = preferredSize()

		if (widgetId && size === currentSize) {
			return
		}

		if (widgetId) {
			turnstile.remove(widgetId)
			widgetId = undefined
			token = ''
		}

		currentSize = size
		widgetId = turnstile.render(container, {
			appearance: 'always',
			callback: settle,
			'error-callback': () => settle(''),
			'expired-callback': () => {
				token = ''
			},
			sitekey: container.dataset.sitekey ?? '',
			size,
			theme: 'light',
		})
	}

	// Render as soon as the Turnstile script is ready, so the widget is visible on load.
	void waitForApi().then((turnstile) => {
		if (turnstile) {
			renderWidget(turnstile)
		}
	})

	// Swap between flexible and compact when the column crosses the breakpoint.
	window.addEventListener('resize', () => {
		const turnstile = api()

		if (turnstile) {
			renderWidget(turnstile)
		}
	})

	return {
		async getToken(): Promise<string> {
			const turnstile = await waitForApi()

			if (!turnstile) {
				return ''
			}

			renderWidget(turnstile)

			if (token) {
				return token
			}

			const current = turnstile.getResponse(widgetId) || ''

			if (current) {
				token = current
				return current
			}

			return new Promise<string>((resolve) => {
				const timer = setTimeout(() => {
					resolvePending = null
					resolve('')
				}, TOKEN_TIMEOUT_MS)

				resolvePending = (value) => {
					clearTimeout(timer)
					resolve(value)
				}
			})
		},
		reset() {
			token = ''
			if (widgetId) {
				api()?.reset(widgetId)
			}
		},
	}
}
