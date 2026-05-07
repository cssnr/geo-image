import { showToast } from '@/composables/useToast.ts'

export function copyText(text?: string) {
  if (text) {
    navigator.clipboard
      .writeText(text)
      .then(() => showToast(i18n.t('form.copiedToClipboard')))
  } else {
    showToast(i18n.t('form.nothingToCopy'))
  }
}
