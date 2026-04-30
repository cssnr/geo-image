<script setup lang="ts">
import { computed } from 'vue'
import { isFirefox, isMobile } from '@/utils/system.ts'
import ResultsTable from '@/components/ResultsTable.vue'
import ToastAlerts from '@/components/ToastAlerts.vue'
import PanelHeader from '@/components/PanelHeader.vue'
import SearchBox from '@/components/SearchBox.vue'
import PermsCheck from '@/components/PermsCheck.vue'

const width = computed(() => (isMobile ? '100%' : '390px'))
const gutter = computed(() => (isFirefox ? 'stable' : undefined))
</script>

<template>
  <div id="popupContainer">
    <PanelHeader :close-window="true" :popup-button="false" />

    <div class="d-grid gap-2 p-1">
      <PermsCheck :close-window="true" />
      <SearchBox :close-window="true" />
      <ResultsTable :close-window="true" />
    </div>

    <ToastAlerts />
  </div>
</template>

<style scoped>
#popupContainer {
  width: v-bind(width);
  min-height: 320px;
  overflow-y: auto;
  scrollbar-gutter: v-bind(gutter);
}
</style>
