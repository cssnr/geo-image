<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Modal } from 'bootstrap'
import { showToast } from '@/composables/useToast.ts'
import { useLocationsDB } from '@/composables/useLocationsDB'
import { openPageUrl } from '@/utils/extension.ts'
import { getConfidenceClass } from '@/utils'
import { LocationData } from '@/utils/api.ts'

const { getAllLocations, deleteLocation, locationDBChannel } = useLocationsDB()

const props = withDefaults(
  defineProps<{
    newTab?: boolean
    closeWindow?: boolean
  }>(),
  {
    newTab: true,
    closeWindow: false,
  },
)

console.debug('ResultsTable.vue: props.newTab:', props.newTab)

const locations = ref<LocationData[]>([])

const hostToDelete = ref<string>('')
const deleteModalEl = ref<HTMLElement | null>(null)

function getPageUrl(srcUrl: string) {
  return chrome.runtime.getURL(`page.html?url=${encodeURIComponent(srcUrl)}`)
}

function urlClick(e: Event, srcUrl: string) {
  console.log('urlClick:', srcUrl)
  if (!props.newTab) {
    console.debug('props.newTab:', props.newTab)
    return
  }
  e.preventDefault()
  openPageUrl(srcUrl).then(() => {
    if (props.closeWindow) window.close()
  })
}

function showDeleteModal(hostId: string) {
  hostToDelete.value = hostId
  console.log('showDeleteModal - hostToDelete:', hostToDelete.value)
  Modal.getOrCreateInstance(deleteModalEl.value!).show()
}

async function confirmDelete() {
  console.log('confirmDelete - hostToDelete:', hostToDelete.value)

  await deleteLocation(Number(hostToDelete.value)) // NOTE: can silently delete nothing
  updateLocations()
  showToast(`Deleted Analysis ID: ${hostToDelete.value}`, 'warning')

  Modal.getOrCreateInstance(deleteModalEl.value!).hide()
}

function updateLocations() {
  getAllLocations().then((results) => (locations.value = results.reverse()))
}

onMounted(() => {
  updateLocations()
  locationDBChannel.onmessage = updateLocations
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
      <tbody>
        <tr v-for="loc of locations" :key="loc.id">
          <td class="text-center">{{ loc.id }}</td>
          <td class="text-truncate">
            <a
              @click="urlClick($event, loc.url)"
              :title="loc.url"
              :href="getPageUrl(loc.url)"
              :target="newTab ? '_blank' : undefined"
              >{{ loc.location }}</a
            >
          </td>
          <td class="text-center" :class="getConfidenceClass(loc.confidence)">{{ loc.confidence }}</td>
          <td class="text-center">
            <a
              @click="showDeleteModal(loc.id?.toString() ?? '')"
              title="Delete"
              :data-id="loc.id"
              :data-url="loc.url"
              class="link-danger"
              role="button"
              ><i class="fa-regular fa-trash-can"></i
            ></a>
          </td>
        </tr>
      </tbody>
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
