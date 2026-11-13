import { defineStore } from 'pinia'
import * as api from '@/api/xprod'
import type { Company } from '@/types/xprod'

const COMPANY_KEY = 'xprod_company'

function savedCompany(): string {
  try {
    return localStorage.getItem(COMPANY_KEY) ?? ''
  } catch {
    return ''
  }
}

export const useSessionStore = defineStore('session', {
  state: () => ({
    user: '',
    fullName: '',
    companies: [] as Company[],
    company: '',
    canCreate: false,
    loaded: false
  }),
  getters: {
    currency: (state) => state.companies.find((c) => c.name === state.company)?.default_currency ?? ''
  },
  actions: {
    async load(): Promise<void> {
      const boot = await api.getBoot()
      const remembered = savedCompany()
      this.$patch({
        user: boot.user,
        fullName: boot.full_name,
        companies: boot.companies,
        company: boot.companies.some((c) => c.name === remembered) ? remembered : boot.default_company ?? '',
        canCreate: boot.can_create,
        loaded: true
      })
    },

    setCompany(company: string): void {
      this.company = company
      try {
        localStorage.setItem(COMPANY_KEY, company)
      } catch {
        // private mode: the choice just isn't remembered
      }
    },

    async logout(): Promise<void> {
      try {
        await api.logout()
      } finally {
        window.location.href = '/login?redirect-to=/xprod'
      }
    }
  }
})
