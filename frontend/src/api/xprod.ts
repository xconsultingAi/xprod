import { call } from './client'
import type { Account, AccountKind, Boot, EntryPayload } from '@/types/xprod'

const API = 'xprod.api'

export function getBoot(): Promise<Boot> {
  return call<Boot>(`${API}.get_boot`)
}

export function getAccounts(company: string, accountKind: AccountKind): Promise<Account[]> {
  return call<Account[]>(`${API}.get_accounts`, { company, account_kind: accountKind })
}

export function getCostCenters(company: string): Promise<string[]> {
  return call<string[]>(`${API}.get_cost_centers`, { company })
}

/** Creates a draft Journal Entry and returns its name. */
export function createEntry(payload: EntryPayload): Promise<string> {
  return call<string>(`${API}.create_entry`, { ...payload }, 'POST')
}

export function logout(): Promise<unknown> {
  return call('logout', {}, 'POST')
}
