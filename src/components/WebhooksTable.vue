<script setup lang="ts">
import { i18n } from '#imports'
import { onMounted, ref, useTemplateRef } from 'vue'
import { copyText } from '@/utils/ui.ts'
import { addWebhook, deleteWebhook, getWebhook, validateWebhook } from '@/utils/webhooks.ts'
import { showToast } from '@/composables/useToast.ts'
import { useWebhooks } from '@/composables/useWebhooks.ts'
import { Modal } from 'bootstrap'
import DeleteModal from '@/components/DeleteModal.vue'

console.debug('%c WebhooksTable - LOADED', 'color: Orange')

const items = useWebhooks()

const deleteModal = ref<InstanceType<typeof DeleteModal> | null>(null)

const webhookModal = useTemplateRef('webhookModal')
const urlInput = useTemplateRef('urlInput')

const webhookName = ref('')
const webhookUrl = ref('')

async function onSubmit(e: SubmitEvent) {
  console.log('onSubmit:', e)
  console.log('name:', webhookName.value.trim())
  console.log('url:', webhookUrl.value.trim())

  if (!webhookUrl.value) {
    showToast('Webhook URL Required!', 'warning')
    return urlInput.value?.focus()
  }

  try {
    new URL(webhookUrl.value)
    const hook = await getWebhook(webhookUrl.value)
    console.log('hook:', hook)
    if (hook) {
      showToast(i18n.t('webhooks.webhookExists'), 'warning')
      return urlInput.value?.focus()
    }
    const data = await validateWebhook(webhookUrl.value)
    console.log('data:', data)
    webhookName.value = webhookName.value || data.name
  } catch (e) {
    console.log(e)
    const message = e instanceof Error ? e.message : i18n.t('ui.error.unknown')
    showToast(message, 'warning')
    return urlInput.value?.focus()
  }

  addWebhook(webhookName.value, webhookUrl.value)
    .then(() => {
      showToast(`${i18n.t('webhooks.webhookAdded')}: ${webhookName.value}`)
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

const printUrl = (url: string) => url.slice(8, 60) + '*****'

onMounted(() => {
  webhookModal.value!.addEventListener('shown.bs.modal', () => {
    urlInput.value?.focus()
  })
})
</script>

<template>
  <div>
    <!-- Button trigger modal -->
    <button type="button" class="btn btn-discord mb-2" data-bs-toggle="modal" data-bs-target="#webhookModal">
      <i class="fa-brands fa-discord me-2"></i> {{ i18n.t('webhooks.addDiscordWebhook') }}
    </button>

    <div class="table-wrapper">
      <table id="webhooks-table" class="table table-sm table-hover small w-100" style="table-layout: fixed">
        <caption>
          <i class="fa-regular fa-cloud me-2"></i>
          {{
            i18n.t('webhooks.discordWebhooks')
          }}
        </caption>
        <thead class="">
          <tr>
            <th class="bg-transparent text-center" style="width: 28px"><i class="fa-solid fa-copy"></i></th>
            <th class="bg-transparent" style="width: 30%">{{ i18n.t('ui.text.name') }}</th>
            <th class="bg-transparent" style="width: 70%">{{ i18n.t('webhooks.discordUrl') }}</th>
            <th class="bg-transparent text-center" style="width: 28px"><i class="fa-solid fa-trash-can"></i></th>
          </tr>
        </thead>
        <tbody id="links-body">
          <template v-if="items?.length">
            <tr v-for="item of items" :key="item.url">
              <td class="bg-transparent">
                <a @click.prevent="copyText(item.url)" title="Copy" class="link-info" role="button" href="#"
                  ><i class="fa-regular fa-copy"></i
                ></a>
              </td>
              <td class="bg-transparent text-truncate">{{ item.name }}</td>
              <td class="bg-transparent text-truncate">{{ printUrl(item.url) }}</td>
              <td class="bg-transparent">
                <a @click.prevent="openDeleteModal(item.url)" title="Delete" class="link-danger" role="button" href="#"
                  ><i class="fa-regular fa-trash-can"></i
                ></a>
              </td>
            </tr>
          </template>
          <tr v-else>
            <td class="bg-transparent text-center text-muted fw-bold" colspan="4">
              {{ i18n.t('webhooks.noSaved') }}
            </td>
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
              <i class="fa-solid fa-cloud me-2"></i> {{ i18n.t('webhooks.addWebhook') }}
            </h1>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p>Add a Discord Webhook to automatically post results too.</p>
            <form @submit.prevent="onSubmit" id="webhooks-form" class="mb-1">
              <div class="mb-2">
                <label class="form-label visually-hidden" for="webhookName"
                  >{{ i18n.t('ui.text.name') }} ({{ i18n.t('ui.text.optional') }})</label
                >
                <input
                  v-model="webhookName"
                  id="webhookName"
                  type="text"
                  class="form-control"
                  :placeholder="i18n.t('ui.text.name')"
                  :aria-label="i18n.t('ui.text.name')"
                  autocomplete="nickname"
                />
              </div>

              <div class="form-floating mb-3">
                <input
                  v-model="webhookUrl"
                  ref="urlInput"
                  id="floatingInput"
                  type="text"
                  class="form-control"
                  placeholder="https://discord.com/api/webhooks/123/abc"
                  :aria-label="i18n.t('webhooks.discordUrl')"
                  autocomplete="off"
                  required
                />
                <label for="floatingInput">{{ i18n.t('webhooks.discordUrl') }}</label>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary me-auto" data-bs-dismiss="modal">
              {{ i18n.t('ui.action.cancel') }}
            </button>
            <button type="submit" form="webhooks-form" class="btn btn-primary">
              {{ i18n.t('webhooks.addWebhook') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
