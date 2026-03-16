<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Modal } from 'bootstrap'
import Uppy from '@uppy/core'
import DropTarget from '@uppy/drop-target'
import '@uppy/core/css/style.css'
import '@uppy/drop-target/css/style.css'

const imageModal = ref<HTMLElement | null>(null)
let modal: Modal

const imageSrc = ref<string | null>(null)
let uppy: Uppy

function analyzeImage() {
  modal.hide()
  console.log('Data to Process:', imageSrc.value)
  const url = chrome.runtime.getURL('page.html') + '?url=message'
  console.log('url:', url)
  chrome.tabs
    .create({ active: true, url })
    .then(() => {
      chrome.runtime.onMessage.addListener((message: any, _sender, sendResponse) => {
        console.log('onMessage:', message)
        const response = { imageData: imageSrc.value }
        console.log('response:', response)
        sendResponse(response)
      })
    })
    .finally(() => {
      // imageSrc.value = null
      uppy.clear()
    })
}

onMounted(() => {
  modal = new Modal(imageModal.value!)

  imageModal.value!.addEventListener('hidden.bs.modal', () => {
    // imageSrc.value = null
    uppy.clear()
  })

  uppy = new Uppy().use(DropTarget, {
    target: document.body,
  })

  uppy.on('file-added', (file) => {
    const reader = new FileReader()
    reader.onload = (e: ProgressEvent<FileReader>) => {
      console.log('File contents:', e.target?.result)
      imageSrc.value = e.target?.result as string
      modal.show()
    }
    reader.readAsDataURL(file.data as File)
  })
})

onUnmounted(() => {
  uppy.destroy()
})
</script>

<template>
  <div
    class="modal fade"
    id="image-modal"
    ref="imageModal"
    tabindex="-1"
    aria-labelledby="image-modal-label"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h1 class="modal-title fs-5" id="image-modal-label">Analyze Image</h1>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" tabindex="-1"></button>
        </div>
        <div class="modal-body text-center p-2">
          <div class="modal-body text-center p-2">
            <img v-if="imageSrc" :src="imageSrc" alt="Image" class="img-fluid img-thumbnail" />
          </div>
        </div>
        <div class="modal-footer p-2">
          <button type="button" class="btn btn-success me-auto" @click="analyzeImage()">
            Analyze <i class="fa-solid fa-rotate ms-2"></i>
          </button>
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>

<!--<style scoped></style>-->
