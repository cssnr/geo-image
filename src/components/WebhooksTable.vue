<script setup lang="ts">
// import { i18n } from '#imports'
import { ref, useTemplateRef } from 'vue'
import { addWebhook, deleteWebhook } from '@/utils/webhooks.ts'
import { showToast } from '@/composables/useToast.ts'
import { useWebhooks } from '@/composables/useWebhooks.ts'
import { Modal } from 'bootstrap'
import DeleteModal from '@/components/DeleteModal.vue'

console.debug('%c WebhooksTable - LOADED', 'color: Orange')

const items = useWebhooks()

const deleteModal = ref<InstanceType<typeof DeleteModal> | null>(null)

const webhookModal = useTemplateRef('webhookModal')
const nameInput = useTemplateRef('nameInput')
const urlInput = useTemplateRef('urlInput')

const webhookName = ref('')
const webhookUrl = ref('')

function onSubmit(e: SubmitEvent) {
  console.log('onSubmit:', e)
  console.log('name:', webhookName.value)
  console.log('url:', webhookUrl.value)

  // if (!webhookName.value) {
  //   showToast('No Webhooks Name Set', 'warning')
  //   return nameInput.value?.focus()
  // }
  if (!webhookUrl.value) {
    showToast('No Webhooks Text Set', 'warning')
    return urlInput.value?.focus()
  }

  addWebhook(webhookName.value, webhookUrl.value)
    .then(() => {
      showToast(`Webhooks Added: ${webhookName.value}`)
      webhookName.value = ''
      webhookUrl.value = ''
      Modal.getOrCreateInstance(webhookModal.value!).hide()
    })
    .catch((e) => {
      showToast(e.message, 'warning')
    })
}

function openDeleteModal(value: string) {
  console.log('openDeleteModal:', value)
  if (!deleteModal.value) return
  deleteModal.value.show(value)
}

async function confirmDelete(name: string) {
  console.log('confirmDelete:', name)
  await deleteWebhook(name)
}
</script>

<template>
  <div>
    <!-- Button trigger modal -->
    <button type="button" class="btn btn-discord mb-2" data-bs-toggle="modal" data-bs-target="#webhookModal">
      <i class="fa-brands fa-discord me-2"></i> Add Discord Webhook
    </button>

    <div class="table-wrapper">
      <table id="webhooks-table" class="table table-sm table-hover small w-100" style="table-layout: fixed">
        <caption>
          <i class="fa-regular fa-cloud me-2"></i>
          Discord Webhooks
        </caption>
        <thead class="">
          <tr>
            <th class="bg-transparent">Name</th>
            <th class="bg-transparent">Webhook URL</th>
            <th class="bg-transparent text-center" style="width: 28px"><i class="fa-solid fa-trash-can"></i></th>
          </tr>
        </thead>
        <tbody id="links-body">
          <template v-if="items?.length">
            <tr v-for="item of items" :key="item.url">
              <td class="bg-transparent text-truncate">{{ item.name }}</td>
              <td class="bg-transparent text-truncate">{{ item.url }}</td>
              <td class="bg-transparent">
                <a @click.prevent="openDeleteModal(item.url)" title="Delete" class="link-danger" role="button" href="#"
                  ><i class="fa-regular fa-trash-can"></i
                ></a>
              </td>
            </tr>
          </template>
          <tr v-else>
            <td class="bg-transparent text-center text-muted fw-bold" colspan="3">No Saved Webhooks</td>
          </tr>
        </tbody>
      </table>
    </div>

    <DeleteModal ref="deleteModal" @delete="confirmDelete" />
  </div>

  <Teleport to="body">
    <!-- Modal -->
    <div
      ref="webhookModal"
      class="modal fade"
      id="webhookModal"
      tabindex="-1"
      aria-labelledby="webhookModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h1 class="modal-title fs-5" id="webhookModalLabel">
              <i class="fa-solid fa-indent me-2"></i> Add Webhooks
            </h1>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p>Add a Discord Webhook to automatically post results too.</p>
            <form @submit.prevent="onSubmit" id="webhooks-form" class="mb-1">
              <label class="form-label visually-hidden" for="webhookName">Display Name</label>
              <input
                v-model="webhookName"
                ref="nameInput"
                id="webhookName"
                type="text"
                class="form-control"
                placeholder="Display Name"
                aria-label="Display Name"
                autocomplete="nickname"
              />

              <div class="form-floating mb-3">
                <input
                  v-model="webhookUrl"
                  ref="urlInput"
                  id="floatingInput"
                  type="text"
                  class="form-control"
                  placeholder="https://discord.com/api/webhooks/123/abc"
                  aria-label="Discord Webhook URL"
                  autocomplete="off"
                  required
                />
                <label for="floatingInput">Discord Webhook URL</label>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary me-auto" data-bs-dismiss="modal">Cancel</button>
            <button type="submit" form="webhooks-form" class="btn btn-primary">Add Webhook</button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<!--<style scoped></style>-->
