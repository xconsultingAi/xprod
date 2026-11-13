<template>
  <ion-button
    expand="block"
    :color="color"
    :disabled="disabled || loading"
    @click="emit('click')"
  >
    <ion-spinner v-if="loading" name="crescent" slot="start" class="spinner" />
    {{ label }}
  </ion-button>
</template>

<script setup lang="ts">
import { IonButton, IonSpinner } from '@ionic/vue'

withDefaults(
  defineProps<{
    label: string
    loading?: boolean
    disabled?: boolean
    color?: string
  }>(),
  { loading: false, disabled: false, color: 'primary' }
)

const emit = defineEmits<{ click: [] }>()
</script>

<style scoped>
.spinner {
  width: 18px;
  height: 18px;
  margin-right: 8px;
}
</style>
