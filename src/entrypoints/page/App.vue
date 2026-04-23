<script setup lang="ts">
import { i18n } from '#imports'
import { onMounted, ref } from 'vue'
import { getGeoUrl, processUrl, LocationData } from '@/utils/api.ts'
import { showToast } from '@/composables/useToast.ts'
import { openOptions } from '@/utils/extension.ts'
import { getConfidenceClass } from '@/utils/index.ts'
import { isMobile } from '@/utils/system.ts'
import ToastAlerts from '@/components/ToastAlerts.vue'
import PanelHeader from '@/components/PanelHeader.vue'
import ResultsTable from '@/components/ResultsTable.vue'

const srcUrl = ref<string | null>(null)
const errorMessage = ref('')
const hasError = ref(false)
const isProcessing = ref(true)
const historyShown = ref(false)

const geoHref = ref('')
const data = ref<LocationData | null>(null)

const toggleHistory = () => (historyShown.value = !historyShown.value)

const manifest = chrome.runtime.getManifest()
const title = `${manifest.name} ${i18n.t('page.processing')}`
if (document.title === '') document.title = title

function copyText(text?: string) {
  if (!text) {
    showToast(i18n.t('form.nothingToCopy'))
  } else {
    navigator.clipboard.writeText(text).then(() => showToast(i18n.t('form.copiedToClipboard')))
  }
}

function copyMarkdown() {
  console.debug('copyMarkdown:', data.value)
  if (!data.value) return
  const r = data.value
  let text = `# ${r.city}, ${r.state}, ${r.country}\n`
  text += `## ${r.location}\n\n`
  text += `**${r.longitude}/${r.latitude}** - [GeoHack](${geoHref.value})\n\n`
  text += `${r.description}\n\n${r.explanation}`
  copyText(text)
}

function setErrorIcon() {
  const href = chrome.runtime.getURL('/images/error128.png')
  const link = document.querySelector<HTMLLinkElement>('link[rel*="icon"]')
  if (!link) return console.warn('favicon link not found')
  link.href = href
  console.debug('link.href:', link.href)
  // document.querySelectorAll<HTMLLinkElement>('link[rel*="icon"]').forEach((link) => {
  //   link.href = href
  //   console.debug('link.href:', link.href)
  // })
}

async function process(): Promise<LocationData> {
  const params = new URLSearchParams(window.location.search)
  const url = params.get('url')
  console.debug('url:', url)
  if (url === 'message') {
    const response = await chrome.runtime.sendMessage('hello')
    console.log('response:', response)
    if (!response.imageData) throw new Error(i18n.t('page.noImageData'))
    srcUrl.value = response.imageData
    throw new Error(i18n.t('page.localNotSupported'))
  } else {
    srcUrl.value = url
    return await processUrl(url)
  }
}

onMounted(() => {
  process()
    .then((result) => {
      console.debug('result:', result)
      data.value = result
      geoHref.value = getGeoUrl(data.value)
      document.title = `${data.value.location} - ${title}`
    })
    .catch((e) => {
      console.log(e)
      errorMessage.value = e.message
      document.title = `${title} - ${i18n.t('page.error')}`
      setErrorIcon()
      showToast(e.message, 'danger')
      hasError.value = true
    })
    .finally(() => {
      isProcessing.value = false
    })
})
</script>

<template>
  <header class="flex-shrink-0">
    <PanelHeader />
  </header>

  <main class="flex-grow-1 overflow-auto">
    <div class="container-fluid p-3 h-100">
      <div v-if="!historyShown" class="pb-5">
        <div
          v-if="isProcessing"
          id="processing"
          class="fs-1 text-center py-5 h-100 img-thumbnail"
          :style="{ backgroundImage: 'url(' + srcUrl + ')' }"
        >
          <p>{{ i18n.t('page.processingMsg') }}</p>
          <p><i class="fa-solid fa-sync fa-spin fa-xl"></i></p>
        </div>

        <div v-if="hasError">
          <h1>{{ i18n.t('page.errorMsg') }}</h1>
          <div class="alert alert-danger my-3" role="alert">{{ errorMessage }}</div>
          <p class="fst-italic">{{ i18n.t('page.errorTip') }}</p>
          <div class="d-flex gap-2">
            <button type="button" class="btn btn-outline-primary" @click="openOptions()">
              <i class="fa-solid fa-cog me-1"></i> {{ i18n.t('ctx.openOptions') }}
            </button>
          </div>
          <hr />
          <img v-if="srcUrl" :src="srcUrl" alt="Image" class="img-thumbnail" />
        </div>

        <div v-if="data">
          <div class="row g-4">
            <div class="col-12 col-md-7 col-lg-8 d-flex flex-column gap-2">
              <div>
                <h2 class="mb-0">
                  <span>{{ data.city }}</span
                  ><span class="text-muted">,</span>
                  <span>{{ data.state }}</span>
                </h2>
                <h4 class="text-muted mb-0">{{ data.country }}</h4>
              </div>

              <h5 class="mb-0">{{ data.location }}</h5>

              <div :class="['d-flex', 'flex-wrap', isMobile ? 'gap-1' : 'gap-3']">
                <div class="d-flex align-items-center gap-1">
                  <i class="fa-solid fa-grip-lines text-secondary"></i>
                  <span class="fw-semibold font-monospace small">{{ data.latitude || 'N/A' }}</span>
                </div>
                <div class="d-flex align-items-center gap-1">
                  <i class="fa-solid fa-grip-lines-vertical text-secondary"></i>
                  <span class="fw-semibold font-monospace small">{{ data.longitude || 'N/A' }}</span>
                </div>
                <div class="d-flex align-items-center gap-1">
                  <i class="fa-solid fa-percent text-secondary"></i>
                  <span class="fw-semibold font-monospace small" :class="getConfidenceClass(data.confidence)">{{
                    data.confidence || 'N/A'
                  }}</span>
                </div>
                <a v-if="geoHref" :href="geoHref" class="btn btn-sm btn-outline-success" target="_blank" rel="noopener">
                  <i class="fa-solid fa-map me-1"></i> GeoHack
                </a>
                <button class="btn btn-sm btn-outline-info" data-bs-toggle="modal" data-bs-target="#exampleModal">
                  <i class="fa-solid fa-share-nodes me-1"></i> {{ i18n.t('ui.action.share') }}
                </button>
              </div>

              <hr class="my-1" />

              <p class="lead mb-1">{{ data.description }}</p>
              <p class="mb-0">{{ data.explanation }}</p>
            </div>
            <!-- data -->

            <div class="col-12 col-md-5 col-lg-4">
              <a v-if="srcUrl" :href="srcUrl" target="_blank" rel="noopener">
                <img v-if="srcUrl" :src="srcUrl" :alt="i18n.t('page.imageAlt')" class="img-thumbnail w-100 h-auto" />
              </a>
            </div>
          </div>
        </div>
      </div>
      <ResultsTable v-else :new-tab="false" class="pb-5" />
    </div>
  </main>

  <!--<footer class="flex-shrink-0"></footer>-->

  <button
    v-if="!isProcessing"
    id="toggle-history"
    type="button"
    :class="['btn', historyShown ? 'btn-primary' : 'btn-link']"
    @click="toggleHistory"
  >
    <i class="fa-solid fa-table-list"></i>
  </button>

  <Teleport to="body">
    <div class="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
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
              <button type="button" class="btn btn-primary" @click="copyMarkdown">
                <i class="fa-brands fa-markdown me-1"></i> {{ i18n.t('ui.action.copy') }} Markdown Results
              </button>
              <button type="button" class="btn btn-success" @click="copyText(geoHref)">
                <i class="fa-solid fa-map me-1"></i> {{ i18n.t('ui.action.copy') }} GeoHack URL
              </button>
              <button type="button" class="btn btn-info" @click="copyText(data?.url)">
                <i class="fa-regular fa-image me-1"></i>
                {{ i18n.t('ui.action.copy') }} {{ i18n.t('ui.text.image') }} URL
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

  <!--<OptionsOffscreen />-->

  <ToastAlerts />
  <!--<BackToTop />-->
</template>

<style scoped>
#processing {
  background-size: cover;
  background-position: center;
  position: relative;
}

#processing::before {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 0;
}

#processing p {
  color: white;
  text-shadow:
    2px 2px 12px rgba(0, 0, 0, 0.9),
    0 0 30px rgba(0, 0, 0, 0.6);
  position: relative;
  z-index: 1;
}

#toggle-history {
  position: fixed;
  bottom: 10px;
  left: -8px;
  z-index: 3;
}
</style>
