<script setup lang="ts">
import { useTemplateRef } from 'vue'
import { showToast } from '@/composables/useToast.ts'
import { processNewItem } from '@/utils/api.ts'

const fileInput = useTemplateRef('fileInput')

async function uploadClick() {
  console.log('uploadClick')
  console.debug('fileInput.value:', fileInput.value)
  fileInput.value?.click()
}

async function fileInputChange(event: Event) {
  console.debug('fileInputChange:', event)
  try {
    const target = event.currentTarget as HTMLInputElement
    console.debug('target:', target)
    const file = target.files?.item(0)
    if (!file) return showToast('File Not Found', 'error')
    console.debug('file:', file)
    const id = await processNewItem({ blob: file })
    console.debug('id:', id)
    await chrome.runtime.sendMessage({ processNewItem: id })
  } catch (e) {
    const message = e instanceof Error ? e.message : i18n.t('ui.error.unknown')
    showToast(message, 'danger')
  }
}

// const blobToDataUrl = (blob: Blob): Promise<string> =>
//   new Promise((resolve, reject) => {
//     const reader = new FileReader()
//     reader.onload = () => resolve(reader.result as string)
//     reader.onerror = () => reject(reader.error)
//     reader.readAsDataURL(blob)
//   })
</script>

<template>
  <div>
    <div
      class="border border-2 border-primary rounded rounded-2 border-dashed text-center text-truncate p-1"
      role="button"
      @click="uploadClick"
    >
      Drag and Drop an
      <i class="fa-regular fa-file-image"></i> Image or <i class="fa-solid fa-arrow-pointer"></i> Click Here...
    </div>

    <input ref="fileInput" type="file" style="display: none" @change.prevent="fileInputChange" />
  </div>
</template>

<style scoped>
.border-dashed {
  border-style: dashed !important;
}
</style>
