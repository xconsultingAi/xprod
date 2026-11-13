import { toastController } from '@ionic/vue'
import { describeError } from '@/api/errors'

export async function showToast(message: string, color: 'danger' | 'success' | 'medium' = 'danger') {
  const toast = await toastController.create({
    message,
    color,
    duration: 4000,
    position: 'bottom'
  })
  await toast.present()
}

export async function showError(err: unknown) {
  await showToast(describeError(err), 'danger')
}

export async function showSuccess(message: string) {
  await showToast(message, 'success')
}
