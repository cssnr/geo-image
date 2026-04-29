import { i18n } from '#imports'

const config: chrome.contextMenus.CreateProperties[] = [
  { contexts: ['image'], id: 'analyzeImage' },
  { contexts: ['action', 'page'], id: 'openPopup' },
  { contexts: ['action', 'page'], id: 'openSidePanel' },
  { contexts: ['action', 'page'], id: 'openExtPanel' },
  { contexts: ['action', 'page'], id: 'separator' },
  { contexts: ['action', 'page'], id: 'openOptions' },
]

const getContexts = (): chrome.contextMenus.CreateProperties[] =>
  config.map((entry) => ({
    ...entry,
    contexts: entry.contexts ? [...entry.contexts] : undefined,
    ...(entry.id === 'separator'
      ? { type: 'separator', id: crypto.randomUUID() }
      : { title: i18n.t(`ctx.${entry.id}` as any) }),
  }))

export async function updateContextMenus(enabled?: boolean) {
  console.debug('%cupdateContextMenus:', `color: ${enabled ? 'Lime' : 'Yellow'}`, enabled)
  if (!chrome.contextMenus) return console.debug('Skipping: chrome.contextMenus')
  const contexts = getContexts()
  chrome.contextMenus.removeAll().then(() => {
    for (const [i, item] of contexts.entries()) {
      // console.log(`item.contexts: ${i}`, item.contexts)
      if (!enabled && item.contexts?.includes('action')) {
        const idx = item.contexts.indexOf('page')
        if (idx != -1) item.contexts.splice(idx, 1)
      }
      console.log(`create: ${i}`, item.id, item.contexts)
      chrome.contextMenus.create(item)
    }
  })
}
