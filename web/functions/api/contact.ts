interface Env {
  CLOUDFLARE_ACCOUNT_ID: string
  CLOUDFLARE_EMAIL_API_TOKEN: string
  CONTACT_FROM_EMAIL?: string
  CONTACT_NOTIFICATION_EMAIL: string
  SANITY_API_TOKEN: string
  SANITY_DATASET: string
  SANITY_PROJECT_ID: string
}

interface ContactMessage {
  email: string
  message: string
  name: string
  surname: string
}

interface ContactPayload {
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

async function saveContactMessage(env: Env, contact: ContactMessage): Promise<void> {
  const projectId = env.SANITY_PROJECT_ID || 'w73pc8ge'
  const dataset = env.SANITY_DATASET || 'production'
  const url = `https://${projectId}.api.sanity.io/v2021-06-07/data/mutate/${dataset}`

  const document = {
    _type: 'contactMessage',
    createdAt: new Date().toISOString(),
    email: contact.email,
    message: contact.message,
    name: contact.name,
    read: false,
    surname: contact.surname,
  }

  const res = await fetch(url, {
    body: JSON.stringify({mutations: [{create: document}]}),
    headers: {
      Authorization: `Bearer ${env.SANITY_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    method: 'POST',
  })

  if (!res.ok) {
    throw new Error(`Sanity API error: ${res.status} ${await res.text()}`)
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

async function handleContactFormMessage(request: Request, env: Env): Promise<Response> {
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

  const contact = result.data

  try {
    await saveContactMessage(env, contact)
  } catch (error) {
    console.error('Sanity API error:', error)
    return Response.json({error: 'Błąd serwera', ok: false}, {status: 500})
  }

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
