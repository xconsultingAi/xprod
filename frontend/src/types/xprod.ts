export type EntryKind = 'expense' | 'income'
export type AccountKind = EntryKind | 'cash'

export interface Account {
  name: string
  account_name: string
}

/** One option shown in AccountSelect (works for both accounts and cost centers). */
export interface SelectOption {
  value: string
  label: string
}

export interface Company {
  name: string
  default_currency: string
}

export interface Boot {
  user: string
  full_name: string
  companies: Company[]
  default_company: string | null
  can_create: boolean
}

export interface EntryPayload {
  kind: EntryKind
  company: string
  posting_date: string // YYYY-MM-DD
  amount: number
  account: string
  cash_account: string
  cost_center?: string
  remark?: string
}

export type AppErrorKind = 'network' | 'auth' | 'permission' | 'validation' | 'unknown'

export class AppError extends Error {
  kind: AppErrorKind
  status?: number

  constructor(kind: AppErrorKind, message: string, status?: number) {
    super(message)
    this.name = 'AppError'
    this.kind = kind
    this.status = status
  }
}
