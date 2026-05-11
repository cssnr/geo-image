<script setup lang="ts">
import { i18n } from '#imports'
import { debug } from '@/utils/logger.ts'
import { showToast } from '@/composables/useToast.ts'
import { processNewItem } from '@/utils/api.ts'

const props = defineProps<{
  closeWindow?: boolean
}>()

async function processForm(event: Event) {
  debug('processForm:', event)
  try {
    const target = event.currentTarget as HTMLFormElement
    event.preventDefault()
    debug('target:', target)
    const input = target.elements.namedItem('image-input') as HTMLInputElement
    debug('input:', input)
    const link = input.value.trim()
    debug('link:', link)
    const url = new URL(link)
    debug('url:', url)
    target.reset()
    const id = await processNewItem({ url: url.href })
    console.debug('id:', id)
    await chrome.runtime.sendMessage({ processNewItem: id })
    if (props.closeWindow) window.close()
  } catch (e) {
    const message = e instanceof Error ? e.message : i18n.t('ui.error.unknown')
    showToast(message, 'danger')
  }
}
</script>

<template>
  <div>
    <form id="search-form" @submit.prevent="processForm">
      <label for="image-input" class="visually-hidden">{{ i18n.t('search.label') }}</label>
      <div class="input-group">
        <input
          id="image-input"
          type="text"
          class="form-control form-control-sm"
          :placeholder="i18n.t('search.placeholder')"
          :aria-label="i18n.t('search.placeholder')"
          aria-describedby="submit-image"
          required
        />
        <button class="btn btn-success" type="submit" id="submit-image">{{ i18n.t('search.go') }}</button>
      </div>
    </form>
  </div>
</template>
