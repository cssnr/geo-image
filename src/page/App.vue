<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { getGeoUrl, processUrl, LocationData } from '@/utils/api.ts'
import { showToast } from '@/composables/useToast.ts'
import { openOptions } from '@/utils/extension.ts'

import ToastAlerts from '@/components/ToastAlerts.vue'
import BackToTop from '@/components/BackToTop.vue'
import PanelHeader from '@/components/PanelHeader.vue'

const srcUrl = ref<string | null>(null)
const errorMessage = ref('')
const hasError = ref(false)
const isProcessing = ref(true)

const geoHref = ref('')
const data = ref<LocationData | null>(null)

const manifest = chrome.runtime.getManifest()
console.debug('manifest:', manifest)
const title = `${manifest.name} Processing...`
if (document.title === '') document.title = title

function setErrorIcon() {
  const href = chrome.runtime.getURL('/images/error128.png')
  document.querySelectorAll<HTMLLinkElement>('link[rel*="icon"]').forEach((link) => {
    link.href = href
    console.debug('link.href:', link.href)
  })
}

onMounted(() => {
  const params = new URLSearchParams(window.location.search)
  const url = params.get('url')
  console.debug('url:', url)

  srcUrl.value = url

  processUrl(url)
    .then((result) => {
      console.debug('result:', result)
      data.value = result
      geoHref.value = getGeoUrl(data.value)
      document.title = `${data.value.location} - ${title}`
    })
    .catch((e) => {
      console.log(e)
      errorMessage.value = e.message
      document.title = `${title} - Error`
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

  <main class="flex-grow-1">
    <div class="container-fluid p-3 h-100">
      <div
        v-if="isProcessing"
        id="processing"
        class="fs-1 text-center py-5 h-100 img-thumbnail"
        :style="{ backgroundImage: 'url(' + srcUrl + ')' }"
      >
        <p>Processing Image...</p>
        <p><i class="fa-solid fa-sync fa-spin fa-xl"></i></p>
      </div>

      <div v-if="hasError">
        <h1>GeoImage Analysis Error</h1>
        <div class="alert alert-danger my-3" role="alert">{{ errorMessage }}</div>
        <p class="fst-italic">Tip: once the error is resolved you can refresh this page...</p>
        <div class="d-flex gap-2">
          <button type="button" class="btn btn-primary" @click="openOptions()">
            <i class="fa-solid fa-cog me-1"></i> Options Page
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

            <div class="d-flex flex-wrap gap-3">
              <div class="d-flex align-items-center gap-2">
                <i class="fa-solid fa-grip-lines text-secondary"></i>
                <span class="fw-semibold font-monospace small">{{ data.latitude || 'N/A' }}</span>
              </div>
              <div class="d-flex align-items-center gap-2">
                <i class="fa-solid fa-grip-lines-vertical text-secondary"></i>
                <span class="fw-semibold font-monospace small">{{ data.longitude || 'N/A' }}</span>
              </div>
              <a v-if="geoHref" :href="geoHref" class="btn btn-sm btn-secondary" target="_blank" rel="noopener">
                <i class="fa-solid fa-map me-1"></i>GeoHack
              </a>
            </div>

            <hr class="my-1" />

            <p class="lead mb-1">{{ data.description }}</p>
            <p class="mb-0">{{ data.explanation }}</p>
          </div>
          <!-- data -->

          <div class="col-12 col-md-5 col-lg-4">
            <a v-if="srcUrl" :href="srcUrl" target="_blank" rel="noopener">
              <img v-if="srcUrl" :src="srcUrl" alt="Image" class="img-thumbnail w-100 h-auto" />
            </a>
          </div>
        </div>
      </div>
    </div>
  </main>

  <!--<footer class="flex-shrink-0"></footer>-->

  <ToastAlerts />
  <BackToTop />
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
</style>
