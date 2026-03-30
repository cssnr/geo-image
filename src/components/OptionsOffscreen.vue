<script setup lang="ts">
import { i18n } from '#imports'
import OptionsForm from '@/components/OptionsForm.vue'
import ThemeSwitch from '@/components/ThemeSwitch.vue'
</script>

<template>
  <button
    id="toggle-button"
    class="btn btn-link opacity-75"
    type="button"
    data-bs-toggle="offcanvas"
    data-bs-target="#optionsOffcanvas"
    aria-controls="optionsOffcanvas"
  >
    <i class="fa-solid fa-gears"></i>
  </button>

  <div
    class="offcanvas offcanvas-end glass"
    tabindex="-1"
    id="optionsOffcanvas"
    aria-labelledby="optionsOffcanvasLabel"
  >
    <div class="offcanvas-header">
      <ThemeSwitch />
      <h5 class="offcanvas-title ms-2" id="optionsOffcanvasLabel">{{ i18n.t('options.title') }}</h5>
      <button
        type="button"
        class="btn-close"
        data-bs-dismiss="offcanvas"
        :aria-label="i18n.t('ui.action.close')"
      ></button>
    </div>
    <div class="offcanvas-body p-2">
      <OptionsForm :compact="true" />
    </div>
  </div>
</template>

<style scoped>
#toggle-button {
  position: fixed;
  bottom: 10px;
  right: -8px;
  z-index: 3;
  /*border-bottom-right-radius: 0;*/
  /*border-top-right-radius: 0;*/
}

/*#optionsOffcanvas {*/
/*  background-color: rgba(var(--bs-emphasis-bg-rgb), 60%);*/
/*}*/
</style>
