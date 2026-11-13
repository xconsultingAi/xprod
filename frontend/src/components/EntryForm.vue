<template>
  <div>
    <ion-list lines="full">
      <!-- 1. Date -->
      <ion-item>
        <ion-label>Date</ion-label>
        <ion-datetime-button :datetime="dateId" slot="end" />
      </ion-item>
      <ion-modal :keep-contents-mounted="true">
        <ion-datetime
          :id="dateId"
          v-model="dateValue"
          presentation="date"
          :show-default-buttons="true"
        />
      </ion-modal>

      <!-- 2. Amount -->
      <ion-item>
        <ion-input
          v-model="amount"
          type="number"
          inputmode="decimal"
          :label="`Amount${session.currency ? ` (${session.currency})` : ''}`"
          label-placement="stacked"
          placeholder="0.00"
          min="0"
          step="0.01"
        />
      </ion-item>
      <div v-if="errors.amount" class="helper-error">{{ errors.amount }}</div>

      <!-- 3. Expense / Income account -->
      <AccountSelect
        v-model="mainAccount"
        :label="text.mainLabel"
        :company="session.company"
        :source="kind"
        :required="true"
        :error="errors.mainAccount"
      />

      <!-- 4. Cash / Bank account -->
      <AccountSelect
        v-model="cashAccount"
        :label="text.cashLabel"
        :company="session.company"
        source="cash"
        :required="true"
        :error="errors.cashAccount"
      />

      <!-- 5. Cost center (optional) -->
      <AccountSelect
        v-model="costCenter"
        label="Cost Center (optional)"
        source="cost_center"
        :company="session.company"
      />

      <!-- 6. Description -->
      <ion-item>
        <ion-textarea
          v-model="description"
          label="Description"
          label-placement="stacked"
          :rows="3"
          :auto-grow="true"
          placeholder="Narration"
        />
      </ion-item>
    </ion-list>

    <div class="ion-padding">
      <LoadingButton
        :label="text.submit"
        :loading="submitting"
        :color="kind === 'expense' ? 'danger' : 'success'"
        @click="submit"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  IonDatetime,
  IonDatetimeButton,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonModal,
  IonTextarea,
  alertController
} from '@ionic/vue'
import AccountSelect from './AccountSelect.vue'
import LoadingButton from './LoadingButton.vue'
import { createEntry } from '@/api/xprod'
import type { EntryPayload } from '@/types/xprod'
import { useSessionStore } from '@/stores/session'
import { todayISO } from '@/utils/date'
import { showError } from '@/utils/notify'

const props = defineProps<{ kind: 'expense' | 'income' }>()
const router = useRouter()
const session = useSessionStore()

const text = computed(() =>
  props.kind === 'expense'
    ? {
        mainLabel: 'Expense Account',
        cashLabel: 'Paid From (Cash/Bank)',
        submit: 'Submit Expense',
        doneTitle: 'Expense Recorded'
      }
    : {
        mainLabel: 'Income Account',
        cashLabel: 'Received In (Cash/Bank)',
        submit: 'Submit Income',
        doneTitle: 'Income Recorded'
      }
)

const dateId = `${props.kind}-date`
const dateValue = ref<string>(todayISO())
const amount = ref<string | number | null>('')
const mainAccount = ref('')
const cashAccount = ref('')
const costCenter = ref('')
const description = ref('')
const submitting = ref(false)
const errors = reactive({ amount: '', mainAccount: '', cashAccount: '' })

function postingDate(): string {
  return String(dateValue.value || todayISO()).slice(0, 10)
}

function parsedAmount(): number {
  const n = typeof amount.value === 'number' ? amount.value : parseFloat(String(amount.value ?? ''))
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : 0
}

function validate(): boolean {
  errors.amount = parsedAmount() > 0 ? '' : 'Enter an amount greater than 0'
  errors.mainAccount = mainAccount.value ? '' : `${text.value.mainLabel} is required`
  errors.cashAccount = cashAccount.value ? '' : 'Select a cash or bank account'
  return !errors.amount && !errors.mainAccount && !errors.cashAccount
}

function buildPayload(): EntryPayload {
  return {
    kind: props.kind,
    company: session.company,
    posting_date: postingDate(),
    amount: parsedAmount(),
    account: mainAccount.value,
    cash_account: cashAccount.value,
    cost_center: costCenter.value || undefined,
    remark: description.value.trim()
  }
}

function resetForm() {
  dateValue.value = todayISO()
  amount.value = ''
  mainAccount.value = ''
  cashAccount.value = ''
  costCenter.value = ''
  description.value = ''
  errors.amount = errors.mainAccount = errors.cashAccount = ''
}

async function submit() {
  if (!validate()) return
  submitting.value = true
  try {
    const name = await createEntry(buildPayload())
    const alert = await alertController.create({
      header: text.value.doneTitle,
      message: `Draft Journal Entry ${name} created`,
      backdropDismiss: false,
      buttons: [
        { text: 'New Entry', handler: () => resetForm() },
        { text: 'Go Home', handler: () => { router.replace('/') } }
      ]
    })
    await alert.present()
  } catch (err) {
    await showError(err)
  } finally {
    submitting.value = false
  }
}
</script>
