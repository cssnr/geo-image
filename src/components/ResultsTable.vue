<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Modal } from 'bootstrap'
import { showToast } from '@/composables/useToast.ts'
import { useLocationsDB } from '@/composables/useLocationsDB'
import { activateOrOpen } from '@/utils/extension.ts'
import { getConfidenceClass } from '@/utils'

const { getAllLocations, deleteLocation, locationDBChannel } = useLocationsDB()

const props = withDefaults(
  defineProps<{
    closeWindow?: boolean
  }>(),
  {
    closeWindow: false,
  },
)

const hostToDelete = ref<string>('')
const deleteModalEl = ref<HTMLElement | null>(null)

async function updateTable() {
  const tbody = document.querySelector('#history-table tbody') as HTMLTableElement
  if (!tbody) return console.debug('#history-table tbody not found')
  tbody.innerHTML = ''

  const entries = await getAllLocations()
  console.debug('updateTable: entries:', entries.length)

  for (const data of entries.reverse()) {
    const num = data.id
    const row = tbody.insertRow()

    const cell1 = row.insertCell()
    cell1.classList.add('text-center')
    cell1.appendChild(document.createTextNode(`${num}`))

    const cell2 = row.insertCell()
    const hostLink = document.createElement('a')
    hostLink.textContent = `${data.country}, ${data.state}, ${data.city}`
    hostLink.title = data.url
    const srcUrl = encodeURIComponent(data.url)
    hostLink.href = chrome.runtime.getURL(`page.html?url=${srcUrl}`)
    hostLink.target = '_blank'
    hostLink.addEventListener('click', (e) => {
      e.preventDefault()
      activateOrOpen(hostLink.href).then(() => {
        if (props.closeWindow) window.close()
      })
    })
    cell2.classList.add('text-truncate')
    cell2.appendChild(hostLink)

    const cell3 = row.insertCell()
    cell3.classList.add('text-center', getConfidenceClass(data.confidence))
    cell3.appendChild(document.createTextNode(data.confidence.toString()))

    const cell4 = row.insertCell()
    const deleteBtn = document.createElement('a')
    const icon = document.createElement('i')
    icon.className = 'fa-regular fa-trash-can'
    deleteBtn.appendChild(icon)
    deleteBtn.title = 'Delete'
    deleteBtn.dataset.id = data.id?.toString()
    deleteBtn.dataset.url = data.url
    deleteBtn.classList.add('link-danger')
    deleteBtn.setAttribute('role', 'button')
    deleteBtn.addEventListener('click', () => {
      showDeleteModal(data.id?.toString() ?? '')
    })
    cell4.classList.add('text-center')
    cell4.appendChild(deleteBtn)
  }
}

function showDeleteModal(hostId: string) {
  hostToDelete.value = hostId
  console.log('showDeleteModal - hostToDelete:', hostToDelete.value)
  Modal.getOrCreateInstance(deleteModalEl.value!).show()
}

async function confirmDelete() {
  console.log('confirmDelete - hostToDelete:', hostToDelete.value)

  await deleteLocation(Number(hostToDelete.value)) // NOTE: can silently delete nothing
  await updateTable()
  showToast(`Deleted Analysis ID: ${hostToDelete.value}`, 'warning')

  Modal.getOrCreateInstance(deleteModalEl.value!).hide()
}

onMounted(() => {
  updateTable()
  locationDBChannel.onmessage = updateTable
})
</script>

<template>
  <div>
    <table id="history-table" class="table table-sm table-striped" style="table-layout: fixed">
      <thead>
        <tr>
          <th class="text-center" style="width: 28px"><i class="fa-solid fa-list-ol"></i></th>
          <th>Location</th>
          <th class="text-center" style="width: 42px"><i class="fa-solid fa-percent"></i></th>
          <th class="text-center" style="width: 28px"><i class="fa-solid fa-trash-can"></i></th>
        </tr>
      </thead>
      <tbody></tbody>
    </table>

    <div
      class="modal fade"
      id="delete-modal"
      ref="deleteModalEl"
      tabindex="-1"
      aria-labelledby="delete-modal-label"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h1 class="modal-title fs-5" id="delete-modal-label">Delete Analysis</h1>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" tabindex="-1"></button>
          </div>
          <div class="modal-body text-center p-2">
            <p class="mb-1">
              Confirm deleting analysis <kbd>{{ hostToDelete }}</kbd> ?
            </p>
          </div>
          <div class="modal-footer p-2">
            <button type="button" class="btn btn-danger me-auto" @click="confirmDelete">
              Delete <i class="fa-regular fa-trash-can ms-2"></i>
            </button>
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
