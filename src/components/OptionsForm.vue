<script setup lang="ts">
import { i18n } from '#imports'
import { ref } from 'vue'
import { validateJSON } from '@/utils/index.ts'
import { saveKeyValue } from '@/utils/options.ts'
import { useOptions } from '@/composables/useOptions.ts'
import { showToast } from '@/composables/useToast.ts'
import FormSwitch from '@/components/FormSwitch.vue'

withDefaults(
  defineProps<{
    compact?: boolean
    switches?: string[]
  }>(),
  {
    compact: false,
    switches: () => ['contextMenu', 'showUpdate'],
  },
)

const options = useOptions()

const geoPrompt = ref('')
const promptInvalid = ref('')
const geoJSON = ref('')
const jsonInvalid = ref('')

watch(
  options,
  (opts) => {
    geoPrompt.value = opts.geoPrompt
    geoJSON.value = opts.geoJSON
  },
  { once: true },
)

function promptChange() {
  console.debug('promptChange')
  const data = geoPrompt.value
  console.debug('data:', data)
  if (!data) {
    promptInvalid.value = 'Prompt must NOT be empty.'
  }
  const isUnder8KB = new Blob([JSON.stringify(data)]).size < 8000
  console.debug('data:', data, 'under 8KB:', isUnder8KB)
  if (!isUnder8KB) {
    promptInvalid.value = 'Prompt must be less than 8kb of data.'
  }
}

function jsonChange() {
  console.debug('jsonChange')
  try {
    const data = JSON.parse(geoJSON.value)
    console.debug('data:', data)
    const errors = validateJSON(data)
    if (errors.length) {
      console.debug('errors:', errors)
      jsonInvalid.value = errors.join(', ')
      return
    }
    const result = JSON.stringify(data, null, 2)
    console.debug('result:', result)
    saveKeyValue('geoJSON', result)
    geoJSON.value = result
  } catch (e) {
    console.debug('JSON.parse error:', e)
    // let err = i18n.t('import.errorJson')
    // if (e instanceof Error) err += `: ${e}`
    // TODO: Ensure error is shown...
    if (e instanceof Error) jsonInvalid.value = e.message
  }
}

const authTokenInput = ref<HTMLInputElement | null>(null)

function showHidePassword(el: HTMLInputElement | null) {
  console.debug('showHidePassword:', el)
  if (!el) return
  el.type = el.type === 'password' ? 'text' : 'password'
}

async function copyInput(el: HTMLInputElement | null) {
  console.debug('copyInput:', el)
  if (!el?.value) {
    return showToast(i18n.t('form.nothingToCopy'), 'warning')
  }
  await navigator.clipboard.writeText(el.value)
  showToast(el.dataset.toast || i18n.t('form.copiedToClipboard'))
}
</script>

<template>
  <form>
    <div>
      <div class="form-text float-end" id="authTokenHelp">
        <a class="text-decoration-none" href="https://aistudio.google.com/app/api-keys" target="_blank" rel="noopener">
          {{ i18n.t('form.getKey') }} <i class="fa-solid fa-arrow-up-right-from-square fa-xs"></i
        ></a>
      </div>

      <label for="authToken" class="form-label"
        ><i class="fa-solid fa-key me-2"></i> {{ i18n.t('form.geminiApiKey') }}</label
      >
      <div class="input-group col-12">
        <input
          v-model="options.authToken"
          @change="saveKeyValue('authToken', options.authToken)"
          :data-toast="i18n.t('form.geminiKeyCopied')"
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
          data-bs-toggle="tooltip"
          data-bs-placement="bottom"
          data-bs-trigger="hover"
          :data-bs-title="i18n.t('form.showHideKey')"
          v-bs
        >
          <i class="fa-regular fa-eye"></i>
        </button>
        <button
          @click="copyInput(authTokenInput)"
          id="authTokenCopy"
          class="btn btn-success"
          type="button"
          data-bs-toggle="tooltip"
          data-bs-placement="bottom"
          data-bs-trigger="hover"
          :data-bs-title="i18n.t('form.copyKey')"
          v-bs
        >
          <i class="fa-solid fa-copy"></i>
        </button>
      </div>
      <div class="form-text mb-3" id="authTokenHelp">
        {{ i18n.t('form.keyNotice') }}
      </div>
    </div>

    <div>
      <template v-for="id in switches" :key="id">
        <FormSwitch :id="id" v-model="options[id]" :class="{ 'col-12': true, 'col-sm-6': !compact }" />
      </template>
    </div>

    <div class="mt-2">
      <button
        class="btn btn-danger w-100"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#collapseExample"
        aria-expanded="false"
        aria-controls="collapseExample"
      >
        Show Advanced Settings
      </button>

      <div class="collapse" id="collapseExample">
        <div class="d-grid gap-2 mt-2">
          <!--TODO: Make the input-groups a re-usable component-->
          <div class="input-group has-validation">
            <div class="form-floating" :class="{ 'is-invalid': promptInvalid }">
              <textarea
                v-model="geoPrompt"
                class="form-control"
                :class="{ 'is-invalid': promptInvalid }"
                placeholder="Leave a comment here"
                id="floatingTextarea2"
                style="height: 220px"
                @change="promptChange"
                @input="promptInvalid = ''"
              ></textarea>
              <label for="floatingTextarea2">Instructions</label>
            </div>
            <div class="invalid-feedback">{{ promptInvalid }}</div>
          </div>

          <div class="input-group has-validation">
            <div class="form-floating" :class="{ 'is-invalid': jsonInvalid }">
              <textarea
                v-model="geoJSON"
                class="form-control"
                :class="{ 'is-invalid': jsonInvalid }"
                placeholder="Leave a comment here"
                id="floatingTextarea2"
                style="height: 240px"
                @change="jsonChange"
                @input="jsonInvalid = ''"
              ></textarea>
              <label for="floatingTextarea2">JSON Object</label>
            </div>
            <div class="invalid-feedback">{{ jsonInvalid }}</div>
          </div>
        </div>
      </div>
    </div>
  </form>
</template>
