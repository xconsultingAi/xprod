<template>
  <div>
    <ion-item button :detail="true" :disabled="loading" @click="open">
      <ion-label position="stacked">
        {{ label }}<span v-if="required" class="req"> *</span>
      </ion-label>
      <div class="value">
        <ion-spinner v-if="loading" name="dots" />
        <span v-else-if="selectedLabel">{{ selectedLabel }}</span>
        <span v-else class="placeholder">
          {{ options.length ? 'Tap to select' : emptyText }}
        </span>
      </div>
    </ion-item>
    <div v-if="error" class="helper-error">{{ error }}</div>

    <ion-modal :is-open="isOpen" @did-dismiss="isOpen = false">
      <ion-header>
        <ion-toolbar>
          <ion-buttons slot="start">
            <ion-button @click="isOpen = false">Cancel</ion-button>
          </ion-buttons>
          <ion-title>{{ label }}</ion-title>
          <ion-buttons v-if="!required && modelValue" slot="end">
            <ion-button color="danger" @click="choose('')">Clear</ion-button>
          </ion-buttons>
        </ion-toolbar>
        <ion-toolbar>
          <ion-searchbar
            v-model="search"
            placeholder="Search"
            :debounce="150"
            animated
          />
        </ion-toolbar>
      </ion-header>
      <ion-content>
        <div v-if="loading" class="center"><ion-spinner /></div>
        <div v-else-if="!filtered.length" class="center placeholder">{{ emptyText }}</div>
        <ion-list v-else>
          <ion-radio-group :value="modelValue">
            <ion-item
              v-for="opt in filtered"
              :key="opt.value"
              button
              @click="choose(opt.value)"
            >
              <ion-radio :value="opt.value" justify="space-between">
                <div class="opt-label">{{ opt.label }}</div>
                <div v-if="opt.label !== opt.value" class="opt-sub">{{ opt.value }}</div>
              </ion-radio>
            </ion-item>
          </ion-radio-group>
        </ion-list>
        <div v-if="loadError" class="center">
          <ion-button fill="clear" @click="load">Retry</ion-button>
        </div>
      </ion-content>
    </ion-modal>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonModal,
  IonRadio,
  IonRadioGroup,
  IonSearchbar,
  IonSpinner,
  IonTitle,
  IonToolbar
} from '@ionic/vue'
import { getAccounts, getCostCenters } from '@/api/xprod'
import type { AccountKind, SelectOption } from '@/types/xprod'
import { showError } from '@/utils/notify'

const props = withDefaults(
  defineProps<{
    label: string
    company: string
    modelValue: string
    required?: boolean
    /** What to load: expense, income or cash/bank accounts, or cost centers. */
    source: AccountKind | 'cost_center'
    /** Validation message shown under the field. */
    error?: string
  }>(),
  { required: false, error: '' }
)

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const options = ref<SelectOption[]>([])
const loading = ref(false)
const loadError = ref(false)
const isOpen = ref(false)
const search = ref('')

const emptyText = computed(() =>
  props.source === 'cost_center' ? 'No cost centers found' : 'No accounts found'
)

const selectedLabel = computed(() => {
  if (!props.modelValue) return ''
  return options.value.find((o) => o.value === props.modelValue)?.label ?? props.modelValue
})

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return options.value
  return options.value.filter(
    (o) => o.label.toLowerCase().includes(q) || o.value.toLowerCase().includes(q)
  )
})

async function load() {
  loading.value = true
  loadError.value = false
  try {
    if (!props.company) {
      options.value = []
    } else if (props.source === 'cost_center') {
      const rows = await getCostCenters(props.company)
      options.value = rows.map((name) => ({ value: name, label: name }))
    } else {
      const rows = await getAccounts(props.company, props.source)
      options.value = rows.map((r) => ({ value: r.name, label: r.account_name || r.name }))
    }
  } catch (err) {
    loadError.value = true
    options.value = []
    await showError(err)
  } finally {
    loading.value = false
  }
}

function open() {
  search.value = ''
  isOpen.value = true
}

function choose(value: string) {
  emit('update:modelValue', value)
  isOpen.value = false
}

onMounted(load)
watch(() => [props.company, props.source], load)
</script>

<style scoped>
.value {
  padding: 6px 0 10px;
  min-height: 24px;
  width: 100%;
}
.placeholder {
  color: var(--ion-color-medium);
}
.req {
  color: var(--ion-color-danger);
}
.center {
  display: flex;
  justify-content: center;
  padding: 24px;
}
.opt-label {
  white-space: normal;
}
.opt-sub {
  font-size: 12px;
  color: var(--ion-color-medium);
  white-space: normal;
}
</style>
