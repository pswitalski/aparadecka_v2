interface Env {
  CLOUDFLARE_ACCOUNT_ID: string
  CLOUDFLARE_EMAIL_API_TOKEN: string
  CONTACT_FROM_EMAIL?: string
  CONTACT_NOTIFICATION_EMAIL: string
  CONTACT_RATE_LIMIT?: KVNamespace
  TURNSTILE_SECRET_KEY?: string
}

interface ContactMessage {
  email: string
  message: string
  name: string
  surname: string
}

interface ContactPayload {
  'cf-turnstile-response'?: string
  email?: string
  message?: string
  name?: string
  surname?: string
  website?: string // honeypot
}

type ValidationResult =
  | {data: ContactMessage; kind: 'valid'}
  | {error: string; kind: 'invalid'; status: number}
  | {kind: 'spam'}

const DEFAULT_FROM_EMAIL = 'kontakt@agnieszkaparadecka.pl'
const MAX_MESSAGE_LENGTH = 2000
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const RATE_LIMIT_MAX = 5
const RATE_LIMIT_WINDOW_SECONDS = 60
const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

const emailSendUrl = (accountId: string) =>
  `https://api.cloudflare.com/client/v4/accounts/${accountId}/email/sending/send`

const escapeHtml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')

function parseContactPayload(body: unknown): ValidationResult {
  const {email, message, name, surname, website} = (body ?? {}) as ContactPayload

  // Honeypot — silently succeed for bots
  if (website) {
    return {kind: 'spam'}
  }

  if (!name?.trim() || !surname?.trim() || !email?.trim() || !message?.trim()) {
    return {error: 'Wszystkie pola są wymagane', kind: 'invalid', status: 400}
  }

  if (!EMAIL_RE.test(email.trim())) {
    return {error: 'Nieprawidłowy adres e-mail', kind: 'invalid', status: 400}
  }

  if (message.trim().length > MAX_MESSAGE_LENGTH) {
    return {
      error: `Wiadomość jest za długa (max ${MAX_MESSAGE_LENGTH} znaków)`,
      kind: 'invalid',
      status: 400,
    }
  }

  return {
    data: {
      email: email.trim(),
      message: message.trim(),
      name: name.trim(),
      surname: surname.trim(),
    },
    kind: 'valid',
  }
}

async function sendOwnerNotification(env: Env, contact: ContactMessage): Promise<void> {
  const from = env.CONTACT_FROM_EMAIL || DEFAULT_FROM_EMAIL
  const to = env.CONTACT_NOTIFICATION_EMAIL.split(',')
    .map((address) => address.trim())
    .filter(Boolean)
  const fullName = `${contact.name} ${contact.surname}`.trim()

  const subject = `Nowa wiadomość z formularza: ${fullName}`
  const text = [`Imię i nazwisko: ${fullName}`, `E-mail: ${contact.email}`, '', contact.message].join(
    '\n',
  )
  const html = `
    <h1>Nowa wiadomość z formularza kontaktowego</h1>
    <p><strong>Imię i nazwisko:</strong> ${escapeHtml(fullName)}<br>
       <strong>E-mail:</strong> ${escapeHtml(contact.email)}</p>
    <p style="white-space:pre-wrap">${escapeHtml(contact.message)}</p>
  `

  const res = await fetch(emailSendUrl(env.CLOUDFLARE_ACCOUNT_ID), {
    body: JSON.stringify({
      from: { address: from, name: 'Formularz kontaktowy' },
      html,
      reply_to: contact.email,
      subject,
      text,
      to,
    }),
    headers: {
      Authorization: `Bearer ${env.CLOUDFLARE_EMAIL_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    method: 'POST',
  })

  const result = (await res.json().catch(() => null)) as null | {success?: boolean}
  if (!res.ok || !result?.success) {
    throw new Error(`Email API error: ${res.status} ${JSON.stringify(result)}`)
  }
}

function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get('Origin')

  if (!origin) {
    return false
  }

  try {
    return new URL(origin).host === new URL(request.url).host
  } catch {
    return false
  }
}

async function isRateLimited(env: Env, ip: null | string): Promise<boolean> {
  if (!env.CONTACT_RATE_LIMIT || !ip) {
    return false
  }

  const key = `contact:${ip}`
  const count = Number(await env.CONTACT_RATE_LIMIT.get(key)) || 0

  if (count >= RATE_LIMIT_MAX) {
    return true
  }

  try {
    await env.CONTACT_RATE_LIMIT.put(key, String(count + 1), {
      expirationTtl: RATE_LIMIT_WINDOW_SECONDS,
    })
  } catch {
    // KV is best-effort: a transient write error must not block a real submission.
  }

  return false
}

async function verifyTurnstile(
  env: Env,
  token: string | undefined,
  ip: null | string,
): Promise<boolean> {
  if (!env.TURNSTILE_SECRET_KEY) {
    console.error('TURNSTILE_SECRET_KEY is not configured')
    return false
  }

  if (!token) {
    return false
  }

  const form = new URLSearchParams({response: token, secret: env.TURNSTILE_SECRET_KEY})

  if (ip) {
    form.set('remoteip', ip)
  }

  try {
    const res = await fetch(TURNSTILE_VERIFY_URL, {body: form, method: 'POST'})
    const result = (await res.json()) as null | {success?: boolean}
    return Boolean(result?.success)
  } catch (error) {
    console.error('Turnstile verification error:', error)
    return false
  }
}

async function handleContactFormMessage(request: Request, env: Env): Promise<Response> {
  if (!isSameOrigin(request)) {
    return Response.json({error: 'Nieprawidłowe źródło żądania', ok: false}, {status: 403})
  }

  const ip = request.headers.get('cf-connecting-ip')

  if (await isRateLimited(env, ip)) {
    return Response.json(
      {error: 'Zbyt wiele wiadomości. Spróbuj ponownie za chwilę.', ok: false},
      {status: 429},
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json({error: 'Nieprawidłowe dane', ok: false}, {status: 400})
  }

  const result = parseContactPayload(body)

  if (result.kind === 'spam') {
    return Response.json({ok: true})
  }

  if (result.kind === 'invalid') {
    return Response.json({error: result.error, ok: false}, {status: result.status})
  }

  if (!(await verifyTurnstile(env, (body as ContactPayload)['cf-turnstile-response'], ip))) {
    return Response.json(
      {error: 'Weryfikacja nie powiodła się. Odśwież stronę i spróbuj ponownie.', ok: false},
      {status: 400},
    )
  }

  const contact = result.data

  try {
    await sendOwnerNotification(env, contact)
  } catch (error) {
    console.error('Email notification error:', error)
    return Response.json(
      {error: 'Nie udało się wysłać wiadomości. Spróbuj ponownie.', ok: false},
      {status: 500},
    )
  }

  return Response.json({ok: true})
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  return handleContactFormMessage(context.request, context.env)
}

export const onRequest: PagesFunction<Env> = async () => {
  return new Response('Method Not Allowed', {status: 405})
}
