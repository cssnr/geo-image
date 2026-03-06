<script setup lang="ts">
import { computed } from 'vue'
import { isFirefox, isMobile } from '@/utils/system.ts'

import ResultsTable from '@/components/ResultsTable.vue'
import ToastAlerts from '@/components/ToastAlerts.vue'
import BackToTop from '@/components/BackToTop.vue'
import PanelHeader from '@/components/PanelHeader.vue'
import SearchBox from '@/components/SearchBox.vue'
import PermsCheck from '@/components/PermsCheck.vue'

let isBrowser = isFirefox ? '390px' : null
const width = computed(() => (isMobile ? '100%' : isBrowser))
console.log('width:', width.value)
</script>

<template>
  <div id="popupContainer">
    <PanelHeader :close-window="true" :popup-button="false" />

    <div class="d-grid gap-2 p-1">
      <PermsCheck />
      <SearchBox :close-window="true" />
      <ResultsTable :close-window="true" />
    </div>

    <ToastAlerts />
    <BackToTop />
  </div>
</template>

<style scoped>
#popupContainer {
  width: v-bind(width);
}
</style>
