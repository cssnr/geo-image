<script setup lang="ts">
import { useAppConfig } from '#imports'
import GeoIcon from '@/assets/icon.svg?raw'
import { getGeoUrl, LocationData } from '@/utils/api.ts'
import { showToast } from '@/composables/useToast.ts'
import { computed, ref, useTemplateRef } from 'vue'
import { Modal } from 'bootstrap'

defineExpose({ show })

const modalEl = useTemplateRef('modalEl')

const data = ref<LocationData | null>(null)
const geoHref = computed(() => (data.value ? getGeoUrl(data.value) : undefined))

const config = useAppConfig()

function show(location: LocationData) {
  console.log('show:', location)
  data.value = location
  if (modalEl.value) Modal.getOrCreateInstance(modalEl.value).show()
}

function copyText(text?: string) {
  if (text) {
    navigator.clipboard.writeText(text).then(() => showToast(i18n.t('form.copiedToClipboard')))
  } else {
    showToast(i18n.t('form.nothingToCopy'))
  }
}

function copyMarkdown() {
  console.debug('copyMarkdown:', data.value)
  if (!data.value) return
  const r = data.value
  const lines = [
    `## ${r.city}, ${r.state}, ${r.country}`,
    `\`${r.longitude}/${r.latitude}\` [Open in GeoHack](${geoHref.value})`,
    !r.url.startsWith('data:') && `${r.url}`,
    `### ${r.location}`,
    `${r.description}`,
    `> ${r.explanation}`,
  ].filter(Boolean)
  copyText(lines.join('\n'))
}
</script>

<template>
  <Teleport to="body">
    <div
      ref="modalEl"
      class="modal fade"
      id="exampleModal"
      tabindex="-1"
      aria-labelledby="exampleModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h1 class="modal-title fs-5" id="exampleModalLabel">
              <i class="fa-solid fa-share-nodes me-1"></i> {{ i18n.t('ui.action.share') }}
            </h1>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="d-grid gap-2">
              <button type="button" class="btn btn-outline-primary" @click="copyMarkdown">
                <i class="fa-brands fa-markdown me-1"></i> {{ i18n.t('ui.action.copy') }} Markdown Results
              </button>
              <button type="button" class="btn btn-outline-success" @click="copyText(geoHref)">
                <i class="fa-solid fa-map me-1"></i> {{ i18n.t('ui.action.copy') }} GeoHack URL
              </button>
              <button type="button" class="btn btn-outline-info" @click="copyText(data?.url)">
                <i class="fa-regular fa-image me-1"></i>
                {{ i18n.t('ui.action.copy') }} {{ i18n.t('ui.text.image') }} URL
              </button>
              <button type="button" class="btn btn-outline-secondary" @click="copyText(config.homepageUrl)">
                <span class="icon me-1" v-html="GeoIcon" /> {{ i18n.t('ui.action.share') }} {{ config.name }}
              </button>
            </div>
          </div>
          <!--<div class="modal-footer">-->
          <!--  <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">-->
          <!--    {{ i18n.t('ui.action.close') }}-->
          <!--  </button>-->
          <!--</div>-->
        </div>
      </div>
    </div>
  </Teleport>
</template>
