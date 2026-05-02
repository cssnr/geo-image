<script setup lang="ts">
import { i18n } from '#imports'
import { ref } from 'vue'
import { Modal } from 'bootstrap'

defineExpose({ show })

const emit = defineEmits(['delete'])

const modalEl = ref<HTMLElement | null>(null)

const targetRef = ref('')

function show(value: string) {
  if (!modalEl.value) return console.error('no modalEl')
  targetRef.value = value
  Modal.getOrCreateInstance(modalEl.value).show()
}

function hide() {
  if (!modalEl.value) return
  Modal.getInstance(modalEl.value)?.hide()
}

function onDelete() {
  console.log('DeleteModal.vue - onDelete:', targetRef.value)
  emit('delete', targetRef.value)
  hide()
}

const printUrl = (url: string) => url.slice(8, 60) + '*****'
</script>

<template>
  <Teleport to="body">
    <div class="modal fade" ref="modalEl" tabindex="-1" aria-labelledby="delete-modal-label" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h1 class="modal-title fs-5 text-truncate" id="delete-modal-label">
              {{ i18n.t('results.delete') }} Webhook
            </h1>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              :aria-label="i18n.t('ui.action.close')"
              tabindex="-1"
            ></button>
          </div>
          <div class="modal-body p-2 d-flex justify-content-center align-items-baseline gap-1">
            <kbd class="text-truncate" style="min-width: 0">{{ printUrl(targetRef) }}</kbd>
          </div>
          <div class="modal-footer p-2">
            <button type="button" class="btn btn-secondary me-auto" data-bs-dismiss="modal">
              {{ i18n.t('ui.action.cancel') }}
            </button>
            <button type="button" class="btn btn-danger" @click.prevent="onDelete">
              <i class="fa-regular fa-trash-can me-2"></i> {{ i18n.t('results.delete') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<!--<style scoped></style>-->
