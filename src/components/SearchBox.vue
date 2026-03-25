<script setup lang="ts">
import { i18n } from '#imports'
import { openPageUrl } from '@/utils/extension.ts'
import { showToast } from '@/composables/useToast.ts'

const props = withDefaults(
  defineProps<{
    closeWindow?: boolean
  }>(),
  {
    closeWindow: false,
  },
)

// console.debug('SearchBox.vue:', props)

async function processForm(event: Event) {
  console.debug('processForm:', event)
  try {
    const target = event.currentTarget as HTMLFormElement
    event.preventDefault()
    console.debug('target:', target)
    const input = target.elements.namedItem('image-input') as HTMLInputElement
    console.debug('input:', input)
    const link = input.value.trim()
    console.debug('link:', link)
    const url = new URL(link)
    console.debug('url:', url)
    // await openPage(url.href)

    target.reset()
    // const encoded = encodeURIComponent(url.href)
    // const page = chrome.runtime.getURL(`page.html?url=${encoded}`)
    // await activateOrOpen(page)
    await openPageUrl(url.href)
    if (props.closeWindow) window.close()
  } catch (e) {
    if (e instanceof Error) showToast(e.message, 'danger')
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

<!--<style scoped></style>-->
