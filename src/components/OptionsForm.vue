<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { saveOptions, updateOptions } from '@/utils/options.ts'
import { isMobile } from '@/utils/system.ts'
import { showToast } from '@/composables/useToast.ts'

const props = withDefaults(
  defineProps<{
    compact?: boolean
  }>(),
  {
    compact: false,
  },
)

chrome.storage.onChanged.addListener(onChanged)

const authTokenInput = ref<HTMLInputElement | null>(null)

function onChanged(changes: object, namespace: string) {
  for (const [key, _] of Object.entries(changes)) {
    console.debug('onChanged:', namespace, key)
    if (namespace === 'sync' && key === 'options') {
      updateOptions()
    }
  }
}

function showHidePassword() {
  console.debug('showHidePassword:', authTokenInput.value)
  if (authTokenInput.value?.type === 'password') {
    authTokenInput.value.type = 'text'
  } else if (authTokenInput.value?.value) {
    authTokenInput.value.type = 'password'
  }
}

async function copyInput(_event: MouseEvent, text = 'Copied to Clipboard.') {
  console.debug('copyInput:', authTokenInput.value)
  if (!authTokenInput.value?.value) {
    return showToast('No Data to Copy.', 'warning')
  }
  await navigator.clipboard.writeText(authTokenInput.value.value)
  showToast(text)
}

onMounted(() => {
  updateOptions()
})
</script>

<template>
  <form>
    <div v-if="!props.compact" class="mb-2">
      <div class="form-text float-end" id="authTokenHelp">
        <a class="text-decoration-none" href="https://aistudio.google.com/app/api-keys" target="_blank" rel="noopener">
          Get your API Key <i class="fa-solid fa-arrow-up-right-from-square fa-xs"></i
        ></a>
      </div>

      <label for="authToken" class="form-label"><i class="fa-solid fa-key me-2"></i> Gemini API Key</label>
      <div class="input-group col-12">
        <input
          id="authToken"
          ref="authTokenInput"
          aria-describedby="authTokenHelp"
          type="password"
          class="form-control"
          autocomplete="off"
          @change="saveOptions"
        />
        <button
          class="btn btn-outline-warning"
          type="button"
          v-bs
          data-bs-toggle="tooltip"
          data-bs-placement="bottom"
          data-bs-trigger="hover"
          data-bs-title="Show/Hide API Key."
          @click="showHidePassword"
        >
          <i class="fa-regular fa-eye"></i>
        </button>
        <button
          id="authTokenCopy"
          class="btn btn-outline-success"
          type="button"
          v-bs
          data-bs-toggle="tooltip"
          data-bs-placement="bottom"
          data-bs-trigger="hover"
          data-bs-title="Copy API Key."
          @click="copyInput"
        >
          <i class="fa-solid fa-copy"></i>
        </button>
      </div>
      <div class="form-text mb-3" id="authTokenHelp">
        The API key and images you analyze are sent to the related service for processing.
      </div>
    </div>

    <div v-if="!isMobile" class="form-check form-switch">
      <input class="form-check-input" id="contextMenu" type="checkbox" role="switch" @change="saveOptions" />
      <label class="form-check-label" for="contextMenu">Enable Right Click Menu</label>
      <i
        class="fa-solid fa-circle-info p-1"
        v-bs
        data-bs-toggle="tooltip"
        data-bs-title="Show Context Menu on Right Click."
      ></i>
    </div>
    <div class="form-check form-switch">
      <input class="form-check-input" id="showUpdate" type="checkbox" role="switch" @change="saveOptions" />
      <label class="form-check-label" for="showUpdate">Show Release Notes on Update</label>
      <i
        class="fa-solid fa-circle-info p-1"
        v-bs
        data-bs-toggle="tooltip"
        data-bs-title="Show Release Notes on Version Update."
      ></i>
    </div>
  </form>
</template>

<!--<style scoped></style>-->
