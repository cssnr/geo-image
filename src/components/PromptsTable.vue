<script setup lang="ts">
// import { i18n } from '#imports'
import { addPrompt, deletePrompt } from '@/utils/prompt.ts'
import { showToast } from '@/composables/useToast.ts'
import { usePrompts } from '@/composables/usePrompts.ts'
import DeleteModal from '@/components/DeleteModal.vue'

console.debug('%cLOADED: components/PromptsTable.vue', 'color: Orange')

const items = usePrompts()

const deleteModal = ref<InstanceType<typeof DeleteModal> | null>(null)

const nameRef = ref<HTMLInputElement | null>(null)
const textRef = ref<HTMLInputElement | null>(null)

const promptName = ref('')
const promptText = ref('')

function onSubmit(e: SubmitEvent) {
  console.log('onSubmit:', e)
  console.log('name:', promptName.value)
  console.log('prompt:', promptText.value)

  if (!promptName.value) {
    showToast('No Prompt Name Set', 'warning')
    return nameRef.value?.focus()
  }
  if (!promptText.value) {
    showToast('No Prompt Text Set', 'warning')
    return textRef.value?.focus()
  }

  addPrompt(promptName.value, promptText.value)
    .then(() => {
      showToast(`Prompt Added: ${promptName.value}`)
      promptName.value = ''
      promptText.value = ''
      nameRef.value?.focus()
    })
    .catch((e) => {
      showToast(e.message, 'warning')
    })
}

function openDeleteModal(name: string) {
  console.log('openDeleteModal:', name)
  if (!deleteModal.value) return
  deleteModal.value.show(name)
}

async function confirmDelete(name: string) {
  console.log('confirmDelete:', name)
  await deletePrompt(name)
}
</script>

<template>
  <div>
    <form @submit.prevent="onSubmit" id="prompts-form" class="mb-1">
      <h5>
        <label class="form-label" for="promptName"><i class="fa-solid fa-indent me-2"></i> Add Prompt</label>
      </h5>
      <div class="input-group">
        <input
          v-model="promptName"
          ref="nameRef"
          id="promptName"
          type="text"
          class="form-control"
          aria-describedby="submit-prompt-btn"
          placeholder="Prompt Name for Context Menu"
          aria-label="Prompt Name for Context Menu"
          autocomplete="off"
          required
        />
        <button class="btn btn-success" type="submit" id="submit-prompt-btn">
          Add <i class="fa-solid fa-circle-plus ms-1"></i>
        </button>
      </div>

      <div class="form-floating">
        <textarea
          v-model="promptText"
          ref="textRef"
          id="textRef"
          class="form-control"
          placeholder="Enter the full prompt text sent with the image for analysis."
          style="height: 80px"
          required
        ></textarea>
        <label for="textRef">Full Prompt Text for Analysis</label>
      </div>
    </form>

    <h5><i class="fa-solid fa-filter me-2"></i> Saved Prompts</h5>

    <div class="table-wrapper">
      <table id="prompts-table" class="table table-sm table-hover small w-100" style="table-layout: fixed">
        <thead class="">
          <tr>
            <th class="bg-transparent">Name</th>
            <th class="bg-transparent">Prompt</th>
            <th class="bg-transparent text-center" style="width: 28px"><i class="fa-solid fa-trash-can"></i></th>
          </tr>
        </thead>
        <tbody id="links-body">
          <tr v-if="items?.length" v-for="item of items">
            <td class="bg-transparent text-truncate">{{ item.name }}</td>
            <td class="bg-transparent text-truncate">{{ item.prompt }}</td>
            <td class="bg-transparent">
              <a @click.prevent="openDeleteModal(item.name)" title="Delete" class="link-danger" role="button" href="#"
                ><i class="fa-regular fa-trash-can"></i
              ></a>
            </td>
          </tr>
          <tr v-else>
            <td class="bg-transparent text-center text-muted fw-bold" colspan="3">No Saved Prompts</td>
          </tr>
        </tbody>
      </table>
    </div>

    <DeleteModal ref="deleteModal" @delete="confirmDelete" />
  </div>
</template>

<!--<style scoped></style>-->
