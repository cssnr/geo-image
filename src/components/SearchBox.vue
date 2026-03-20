<script setup lang="ts">
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

console.debug('closeWindow:', props.closeWindow)

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
      <label for="image-input" class="visually-hidden">Image Link</label>
      <div class="input-group">
        <input
          id="image-input"
          type="text"
          class="form-control form-control-sm"
          placeholder="Link to an Image to Analyze"
          aria-label="Link to an Image to Analyze"
          aria-describedby="submit-image"
          required
        />
        <button class="btn btn-success" type="submit" id="submit-image">Go</button>
      </div>
    </form>
  </div>
</template>

<!--<style scoped></style>-->
