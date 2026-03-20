<script setup lang="ts">
import { clickOpen, openExtPanel, openOptions, openPopup, openSidePanel } from '@/utils/extension.ts'
import { isMobile } from '@/utils/system.ts'
import ThemeSwitch from '@/components/ThemeSwitch.vue'

const props = withDefaults(
  defineProps<{
    panelButton?: boolean
    sideButton?: boolean
    popupButton?: boolean
    optionsButton?: boolean
    closeWindow?: boolean
  }>(),
  {
    panelButton: true,
    sideButton: true,
    popupButton: true,
    optionsButton: true,
    closeWindow: false,
  },
)

const manifest = chrome.runtime.getManifest()
</script>

<template>
  <div class="container-fluid p-2">
    <div class="d-flex flex-row align-items-center text-nowrap">
      <ThemeSwitch />

      <div class="d-flex flex-grow-1 overflow-hidden align-items-baseline">
        <a
          title="Home Page"
          class="link-body-emphasis text-decoration-none fs-4"
          :href="manifest.homepage_url"
          target="_blank"
          @click.prevent="clickOpen($event, props.closeWindow)"
        >
          <img src="/images/logo32.png" alt="L" class="mb-1" style="height: 1.1em" />
          {{ manifest.name }}</a
        >
        <a
          title="Release Notes"
          class="link-body-emphasis text-decoration-none small ms-1"
          :href="`${manifest.homepage_url}/releases/tag/${manifest.version}`"
          target="_blank"
          @click.prevent="clickOpen($event, props.closeWindow)"
        >
          v<span class="version">{{ manifest.version }}</span></a
        >
      </div>

      <div v-if="!isMobile && props.panelButton" class="ms-1">
        <a
          title="Extension Panel"
          class="btn btn-sm btn-outline-info"
          role="button"
          @click="openExtPanel(props.closeWindow)"
        >
          <i class="fa-regular fa-window-restore me-1"></i
        ></a>
      </div>
      <div v-if="!isMobile && props.sideButton" class="ms-1">
        <a
          title="Side Panel"
          class="btn btn-sm btn-outline-info"
          role="button"
          @click="openSidePanel(props.closeWindow)"
        >
          <i class="fa-solid fa-table-columns"></i
        ></a>
      </div>
      <div v-if="!isMobile && props.popupButton" class="ms-1">
        <a title="Open Popup" class="btn btn-sm btn-outline-info" role="button" @click="openPopup()">
          <i class="fa-solid fa-window-maximize"></i
        ></a>
      </div>
      <div v-if="props.optionsButton" class="ms-1">
        <a
          title="Options"
          class="btn btn-sm btn-outline-info"
          role="button"
          href="/options.html"
          target="_blank"
          @click.prevent="openOptions(props.closeWindow)"
        >
          <i class="fa-solid fa-gears"></i
        ></a>
      </div>
    </div>
  </div>
  <!-- container-fluid -->

  <hr class="my-0" />
</template>

<!--<style scoped></style>-->
