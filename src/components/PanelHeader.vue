<script setup lang="ts">
import { i18n } from '#imports'
import { clickOpen, openExtPanel, openOptions, openPopup, openSidePanel } from '@/utils/extension.ts'
import { isMobile } from '@/utils/system.ts'
import ThemeSwitch from '@/components/ThemeSwitch.vue'

withDefaults(
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
          :title="i18n.t('options.homePage')"
          class="link-body-emphasis text-decoration-none fs-4"
          :href="manifest.homepage_url"
          target="_blank"
          @click.prevent="clickOpen($event, closeWindow)"
        >
          <img src="/images/logo32.png" alt="L" class="mb-1" style="height: 1.1em" />
          {{ manifest.name }}</a
        >
        <a
          :title="i18n.t('options.releaseNotes')"
          class="link-body-emphasis text-decoration-none small ms-1"
          :href="`${manifest.homepage_url}/releases/tag/${manifest.version}`"
          target="_blank"
          @click.prevent="clickOpen($event, closeWindow)"
        >
          v<span class="version">{{ manifest.version }}</span></a
        >
      </div>

      <div v-if="!isMobile && panelButton" class="ms-1">
        <a
          :title="i18n.t('ctx.openExtPanel')"
          class="btn btn-sm btn-outline-info"
          role="button"
          @click="openExtPanel(closeWindow)"
        >
          <i class="fa-regular fa-window-restore me-1"></i
        ></a>
      </div>
      <div v-if="!isMobile && sideButton" class="ms-1">
        <a
          :title="i18n.t('ctx.openSidePanel')"
          class="btn btn-sm btn-outline-info"
          role="button"
          @click="openSidePanel(closeWindow)"
        >
          <i class="fa-solid fa-table-columns"></i
        ></a>
      </div>
      <div v-if="!isMobile && popupButton" class="ms-1">
        <a :title="i18n.t('ctx.openPopup')" class="btn btn-sm btn-outline-info" role="button" @click="openPopup()">
          <i class="fa-solid fa-window-maximize"></i
        ></a>
      </div>
      <div v-if="optionsButton" class="ms-1">
        <a
          :title="i18n.t('ctx.openOptions')"
          class="btn btn-sm btn-outline-info"
          role="button"
          href="/options.html"
          target="_blank"
          @click.prevent="openOptions(closeWindow)"
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
