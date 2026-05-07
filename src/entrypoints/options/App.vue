<script setup lang="ts">
import { i18n } from '#imports'
import { useTitle } from '@/composables/useTitle.ts'
import BackToTop from '@/components/BackToTop.vue'
import PermsCheck from '@/components/PermsCheck.vue'
import ToastAlerts from '@/components/ToastAlerts.vue'
import OptionsForm from '@/components/OptionsForm.vue'
import KeyboardShortcuts from '@/components/KeyboardShortcuts.vue'
import PageFooter from '@/components/PageFooter.vue'
import HorizontalRule from '@/components/HorizontalRule.vue'
import CopySupport from '@/components/CopySupport.vue'
import PageHeader from '@/components/PageHeader.vue'
import WebhooksTable from '@/components/WebhooksTable.vue'

useTitle(i18n.t('options.title'))
</script>

<template>
  <div class="d-flex align-items-center justify-content-center p-1 p-sm-3 h-100 w-100">
    <div class="m-auto pb-4 w-100">
      <div id="options-wrapper" class="glass-outline rounded rounded-3 p-2 p-sm-3 m-auto w-100">
        <PageHeader />

        <KeyboardShortcuts />

        <HorizontalRule class="my-2">{{ i18n.t('options.extension') }}</HorizontalRule>
        <OptionsForm />

        <HorizontalRule class="my-2">Discord Webhooks</HorizontalRule>
        <WebhooksTable />

        <PermsCheck :show-info="true" class="my-3" />

        <p class="my-3"><i class="fa-solid fa-skull-crossbones"></i> {{ i18n.t('options.madeFor') }}</p>

        <CopySupport :message="i18n.t('options.copySupportMsg')" :tip="i18n.t('options.copySupportTip')">{{
          i18n.t('options.copySupport')
        }}</CopySupport>

        <hr class="" />

        <PageFooter />
      </div>
    </div>
  </div>

  <ToastAlerts />
  <BackToTop />
</template>

<style scoped>
#options-wrapper {
  max-width: 767px;
}
</style>
