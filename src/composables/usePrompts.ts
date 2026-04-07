import { ref, onMounted, onUnmounted } from 'vue'
import { getPrompts, STORE_KEY } from '@/utils/prompt.ts'
import type { Ref } from 'vue'
import type { Prompt } from '@/utils/prompt.ts'

export function usePrompts(): Ref<Prompt[]> {
  console.debug('%cLOADED composables/usePrompts.ts', 'color: Orange')

  const items = ref<Prompt[]>([])

  const onChanged = async (changes: any) => {
    console.log('usePrompts - onChanged:', changes)
    if (STORE_KEY in changes) {
      console.log('%c composables/usePrompts.ts - CHANGE DETECTED ', 'color: Yellow')
      items.value = await getPrompts()
      console.log('usePrompts - items.value:', items.value)
    }
  }

  if (!chrome.storage.sync.onChanged.hasListener(onChanged)) {
    console.debug('%c usePrompts - addListener', 'color: Lime')
    chrome.storage.sync.onChanged.addListener(onChanged)
  }

  onMounted(() => getPrompts().then((results) => (items.value = results)))
  onUnmounted(() => chrome.storage.sync.onChanged.removeListener(onChanged))

  return items
}
