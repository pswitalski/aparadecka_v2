interface Env {
  CLOUDFLARE_ACCOUNT_ID: string
  CLOUDFLARE_EMAIL_API_TOKEN: string
  CONTACT_FROM_EMAIL?: string
  CONTACT_NOTIFICATION_EMAIL: string
  SANITY_API_TOKEN: string
  SANITY_DATASET: string
  SANITY_PROJECT_ID: string
}

interface ContactPayload {
  email?: string
  message?: string
  name?: string
  surname?: string
  website?: string // honeypot
}

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

interface ContactMessage {
  email: string
  message: string
  name: string
  surname: string
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
  let body: ContactPayload
  try {
    body = await request.json<ContactPayload>()
  } catch {
    return Response.json({error: 'Nieprawidłowe dane', ok: false}, {status: 400})
  }

  const {email, message, name, surname, website} = body

  // Honeypot — silently succeed for bots
  if (website) {
    return Response.json({ok: true})
  }

  if (!name?.trim() || !surname?.trim() || !email?.trim() || !message?.trim()) {
    return Response.json({error: 'Wszystkie pola są wymagane', ok: false}, {status: 400})
  }

  if (!EMAIL_RE.test(email.trim())) {
    return Response.json({error: 'Nieprawidłowy adres e-mail', ok: false}, {status: 400})
  }

  if (message.trim().length > MAX_MESSAGE_LENGTH) {
    return Response.json(
      {error: 'Wiadomość jest za długa (max 2000 znaków)', ok: false},
      {status: 400},
    )
  }

  const projectId = env.SANITY_PROJECT_ID || 'w73pc8ge'
  const dataset = env.SANITY_DATASET || 'production'
  const url = `https://${projectId}.api.sanity.io/v2021-06-07/data/mutate/${dataset}`

  const document = {
    _type: 'contactMessage',
    createdAt: new Date().toISOString(),
    email: email.trim(),
    message: message.trim(),
    name: name.trim(),
    read: false,
    surname: surname.trim(),
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
    const errorText = await res.text()
    console.error('Sanity API error:', res.status, errorText)
    return Response.json({error: 'Błąd serwera', ok: false}, {status: 500})
  }

  try {
    await sendOwnerNotification(env, {
      email: email.trim(),
      message: message.trim(),
      name: name.trim(),
      surname: surname.trim(),
    })
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
