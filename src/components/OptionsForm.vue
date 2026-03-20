<script setup lang="ts">
import { ref } from 'vue'
import { saveOptions } from '@/utils/options.ts'
import { useOptions } from '@/composables/useOptions.ts'
import { showToast } from '@/composables/useToast.ts'
import { isMobile } from '@/utils/system.ts'

// withDefaults(
//   defineProps<{
//     compact?: boolean
//   }>(),
//   {
//     compact: false,
//   },
// )

const options = useOptions()

const authTokenInput = ref<HTMLInputElement | null>(null)

function showHidePassword(el: HTMLInputElement | null) {
  console.debug('showHidePassword:', el)
  if (el?.type === 'password') {
    el.type = 'text'
  } else if (el?.value) {
    el.type = 'password'
  }
}

async function copyInput(el: HTMLInputElement | null) {
  console.debug('copyInput:', el)
  if (!el?.value) {
    return showToast('Nothing to Copy.', 'warning')
  }
  await navigator.clipboard.writeText(el.value)
  showToast(el.dataset.toast || 'Copied to Clipboard.')
}
</script>

<template>
  <form>
    <div>
      <div class="form-text float-end" id="authTokenHelp">
        <a class="text-decoration-none" href="https://aistudio.google.com/app/api-keys" target="_blank" rel="noopener">
          Get your API Key <i class="fa-solid fa-arrow-up-right-from-square fa-xs"></i
        ></a>
      </div>

      <label for="authToken" class="form-label"><i class="fa-solid fa-key me-2"></i> Gemini API Key</label>
      <div class="input-group col-12">
        <input
          v-model="options.authToken"
          @change="saveOptions"
          data-toast="Gemini API Key Copied."
          ref="authTokenInput"
          id="authToken"
          aria-describedby="authTokenHelp"
          type="password"
          class="form-control"
          autocomplete="off"
        />
        <button
          @click="showHidePassword(authTokenInput)"
          class="btn btn-warning"
          type="button"
          v-bs
          data-bs-toggle="tooltip"
          data-bs-placement="bottom"
          data-bs-trigger="hover"
          data-bs-title="Show/Hide API Key."
        >
          <i class="fa-regular fa-eye"></i>
        </button>
        <button
          @click="copyInput(authTokenInput)"
          id="authTokenCopy"
          class="btn btn-success"
          type="button"
          v-bs
          data-bs-toggle="tooltip"
          data-bs-placement="bottom"
          data-bs-trigger="hover"
          data-bs-title="Copy API Key."
        >
          <i class="fa-solid fa-copy"></i>
        </button>
      </div>
      <div class="form-text mb-3" id="authTokenHelp">
        The API key and images you analyze are sent to the related service for processing.
      </div>
    </div>

    <div>
      <div v-if="!isMobile" class="form-check form-switch">
        <input
          v-model="options.contextMenu"
          @change="saveOptions"
          id="contextMenu"
          class="form-check-input"
          type="checkbox"
          role="switch"
        />
        <label class="form-check-label" for="contextMenu">Enable Right Click Menu</label>
        <i
          class="fa-solid fa-circle-info p-1"
          v-bs
          data-bs-toggle="tooltip"
          data-bs-title="Show Context Menu on Right Click."
        ></i>
      </div>
      <div class="form-check form-switch">
        <input
          v-model="options.showUpdate"
          @change="saveOptions"
          id="showUpdate"
          class="form-check-input"
          type="checkbox"
          role="switch"
        />
        <label class="form-check-label" for="showUpdate">Show Release Notes on Update</label>
        <i
          class="fa-solid fa-circle-info p-1"
          v-bs
          data-bs-toggle="tooltip"
          data-bs-title="Show Release Notes on Version Update."
        ></i>
      </div>
    </div>
  </form>
</template>

<!--<style scoped></style>-->
