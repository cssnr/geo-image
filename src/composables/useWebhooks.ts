import { ref, onMounted, onUnmounted } from 'vue'
import { getWebhooks, WEBHOOKS_KEY } from '@/utils/webhooks.ts'
import type { Ref } from 'vue'
import type { Webhook } from '@/utils/webhooks.ts'

export function useWebhooks(): Ref<Webhook[]> {
  console.debug('%c useWebhooks - LOADED', 'color: SpringGreen')

  const items = ref<Webhook[]>([])

  const onChanged = async (changes: any) => {
    console.log('%c useWebhooks - onChanged:', 'color: SkyBlue', changes)
    if (WEBHOOKS_KEY in changes) {
      console.log('%c useWebhooks - CHANGE DETECTED ', 'color: Salmon')
      items.value = await getWebhooks()
      console.log('useWebhooks - items.value:', items.value)
    }
  }

  if (!chrome.storage.sync.onChanged.hasListener(onChanged)) {
    console.debug('%c useWebhooks - addListener', 'color: PowderBlue')
    chrome.storage.sync.onChanged.addListener(onChanged)
  }

  onMounted(() => getWebhooks().then((results) => (items.value = results)))
  onUnmounted(() => chrome.storage.sync.onChanged.removeListener(onChanged))

  return items
}
