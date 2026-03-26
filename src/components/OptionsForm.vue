<script setup lang="ts">
import { i18n } from '#imports'
import { ref } from 'vue'
import { saveOptions } from '@/utils/options.ts'
import { useOptions } from '@/composables/useOptions.ts'
import { showToast } from '@/composables/useToast.ts'
import FormSwitch from '@/components/FormSwitch.vue'

withDefaults(
  defineProps<{
    compact?: boolean
  }>(),
  {
    compact: false,
  },
)

const options = useOptions()

const authTokenInput = ref<HTMLInputElement | null>(null)

const toggleOptions = ['contextMenu', 'showUpdate'].map((key) => ({
  key,
  label: i18n.t(`option_toggle_${key}` as any),
  tooltip: i18n.t(`option_toggle_${key}Tip` as any),
}))
console.log('toggleOptions:', toggleOptions)

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
          @change="saveOptions"
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
      <template v-for="option in toggleOptions" :key="option.key">
        <FormSwitch
          :class="{ 'col-12': true, 'col-sm-6': !compact }"
          :value="(options[option.key] as boolean) || false"
          :name="option.key"
          :label="option.label"
          :tooltip="option.label"
          @save="saveOptions"
        />
      </template>
    </div>
  </form>
</template>

<!--<style scoped></style>-->
