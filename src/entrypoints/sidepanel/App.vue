<script setup lang="ts">
import ResultsTable from '@/components/ResultsTable.vue'
import ToastAlerts from '@/components/ToastAlerts.vue'
import BackToTop from '@/components/BackToTop.vue'
import PanelHeader from '@/components/PanelHeader.vue'
import SearchBox from '@/components/SearchBox.vue'
import PanelFooter from '@/components/PanelFooter.vue'
import PermsCheck from '@/components/PermsCheck.vue'
import UppyDrop from '@/components/UppyDrop.vue'
import FileInput from '@/components/FileInput.vue'
</script>

<template>
  <header class="flex-shrink-0">
    <PanelHeader :side-button="false" />
    <SearchBox class="m-1" />
    <FileInput class="m-1 mx-2" />
  </header>

  <main class="flex-grow-1 overflow-auto p-1">
    <div class="d-grid gap-2">
      <PermsCheck />
      <ResultsTable />
    </div>
  </main>

  <footer class="flex-shrink-0">
    <PanelFooter />
  </footer>

  <UppyDrop />
  <ToastAlerts />
  <BackToTop />
</template>
