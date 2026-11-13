import { AppError } from '@/types/xprod'
import { MSG, parseServerMessage } from './errors'

/** Called when Frappe says the session is gone; set by main.ts. */
let onSessionExpired: (() => void) | null = null
export function setSessionExpiredHandler(handler: () => void) {
  onSessionExpired = handler
}

function csrfToken(): string {
  const token = window.csrf_token ?? ''
  // in `yarn dev` the Jinja placeholder is not rendered
  return token.startsWith('{{') ? '' : token
}

/**
 * Call a whitelisted Frappe method on the same site, using the browser's session cookie.
 * GET for reads, POST for writes.
 */
export async function call<T>(
  method: string,
  args: Record<string, unknown> = {},
  httpMethod: 'GET' | 'POST' = 'GET'
): Promise<T> {
  let url = `/api/method/${method}`
  const init: RequestInit = {
    method: httpMethod,
    credentials: 'same-origin',
    headers: { Accept: 'application/json', 'X-Frappe-CSRF-Token': csrfToken() }
  }

  if (httpMethod === 'GET') {
    const params = new URLSearchParams()
    for (const [key, value] of Object.entries(args)) {
      if (value !== undefined && value !== null) params.set(key, String(value))
    }
    if ([...params].length) url += `?${params}`
  } else {
    ;(init.headers as Record<string, string>)['Content-Type'] = 'application/json'
    init.body = JSON.stringify(args)
  }

  let res: Response
  try {
    res = await fetch(url, init)
  } catch {
    throw new AppError('network', MSG.network)
  }

  const body = await res.json().catch(() => null)
  if (res.ok) return (body?.message ?? null) as T

  const serverMsg = parseServerMessage(body)
  if (res.status === 401) {
    onSessionExpired?.()
    throw new AppError('auth', MSG.session, res.status)
  }
  if (res.status === 403) throw new AppError('permission', serverMsg || MSG.permission, res.status)
  if (serverMsg) throw new AppError('validation', serverMsg, res.status)
  throw new AppError('unknown', `The server returned an error (HTTP ${res.status}).`, res.status)
}
