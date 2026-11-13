import { AppError } from '@/types/xprod'

export const MSG = {
  network: 'Cannot reach the server. Check your connection.',
  session: 'Session expired. Please login again.',
  permission: 'You do not have permission to do this.'
}

function stripHtml(text: string): string {
  return text.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim()
}

/**
 * Frappe puts user-facing errors in `_server_messages` (a JSON string holding a
 * list of JSON strings), or in `exception`.
 */
export function parseServerMessage(data: unknown): string {
  if (!data || typeof data !== 'object') return ''
  const body = data as Record<string, unknown>

  if (typeof body._server_messages === 'string') {
    try {
      const list = JSON.parse(body._server_messages) as string[]
      const messages = list
        .map((item) => {
          try {
            return (JSON.parse(item) as { message?: string }).message ?? item
          } catch {
            return item
          }
        })
        .map(stripHtml)
        .filter(Boolean)
      if (messages.length) return messages.join('\n')
    } catch {
      // fall through to the other fields
    }
  }

  if (typeof body.exception === 'string' && body.exception) {
    // e.g. "frappe.exceptions.ValidationError: Debit and Credit not equal"
    const idx = body.exception.indexOf(':')
    return stripHtml(idx >= 0 ? body.exception.slice(idx + 1) : body.exception)
  }

  return ''
}

export function toAppError(err: unknown): AppError {
  if (err instanceof AppError) return err
  if (err instanceof Error) return new AppError('unknown', err.message)
  return new AppError('unknown', 'Something went wrong.')
}

export function describeError(err: unknown): string {
  return toAppError(err).message
}
