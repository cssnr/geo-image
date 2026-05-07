import { ref, onMounted, onUnmounted } from 'vue'
import { debug } from '@/utils/logger.ts'
import { WEBHOOKS_KEY, getWebhooks } from '@/utils/webhooks.ts'
import type { Ref } from 'vue'
import type { Webhook } from '@/utils/webhooks.ts'

export function useWebhooks(): Ref<Webhook[]> {
  debug('%c useWebhooks - LOADED', 'color: SpringGreen')

  const items = ref<Webhook[]>([])

  const onChanged = async (changes: any) => {
    debug('%c useWebhooks - onChanged:', 'color: SkyBlue', changes)
    if (WEBHOOKS_KEY in changes) {
      debug('%c useWebhooks - CHANGE DETECTED ', 'color: Salmon')
      items.value = await getWebhooks()
      debug('useWebhooks - items.value:', items.value)
    }
  }

  if (!chrome.storage.sync.onChanged.hasListener(onChanged)) {
    debug('%c useWebhooks - addListener', 'color: PowderBlue')
    chrome.storage.sync.onChanged.addListener(onChanged)
  }

  onMounted(() => getWebhooks().then((results) => (items.value = results)))
  onUnmounted(() => chrome.storage.sync.onChanged.removeListener(onChanged))

  return items
}
