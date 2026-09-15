interface Env {
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

const MAX_MESSAGE_LENGTH = 2000
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

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

  return Response.json({ok: true})
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  return handleContactFormMessage(context.request, context.env)
}

export const onRequest: PagesFunction<Env> = async () => {
  return new Response('Method Not Allowed', {status: 405})
}
