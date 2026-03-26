import { i18n } from '#imports'
import { openExtPanel, openPageUrl, openSidePanel } from '@/utils/extension.ts'

const config: chrome.contextMenus.CreateProperties[] = [
  { contexts: ['image'], id: 'analyzeImage' },
  { contexts: ['all'], id: 'separator' },
  { contexts: ['all'], id: 'openPopup' },
  { contexts: ['all'], id: 'openSidePanel' },
  { contexts: ['all'], id: 'openExtPanel' },
  { contexts: ['all'], id: 'separator' },
  { contexts: ['all'], id: 'openOptions' },
]

const contexts: chrome.contextMenus.CreateProperties[] = config.map((entry) => ({
  ...entry,
  ...(entry.id === 'separator'
    ? { type: 'separator', id: crypto.randomUUID() }
    : { title: i18n.t(`ctx.${entry.id}` as any) }),
}))

// NOTE: Below is ported from VanillaJS

export function createContextMenus() {
  console.debug('createContextMenus')
  if (!chrome.contextMenus) {
    return console.debug('Skipping: chrome.contextMenus')
  }
  chrome.contextMenus.removeAll().then(() => {
    contexts.forEach((item) => chrome.contextMenus.create(item))
  })
}

export async function onClicked(
  ctx: chrome.contextMenus.OnClickData,
  tab?: chrome.tabs.Tab,
) {
  console.debug('onClicked:', ctx, tab)
  if (ctx.menuItemId === 'openOptions') {
    await chrome.runtime.openOptionsPage()
  } else if (ctx.menuItemId === 'openPopup') {
    await openPopup()
  } else if (ctx.menuItemId === 'openExtPanel') {
    await openExtPanel()
  } else if (ctx.menuItemId === 'openSidePanel') {
    openSidePanel()
  } else if (ctx.menuItemId === 'analyzeImage') {
    // const encoded = encodeURIComponent(ctx.srcUrl ?? '')
    // const url = chrome.runtime.getURL(`page.html?url=${encoded}`)
    // return activateOrOpen(url)
    return openPageUrl(ctx.srcUrl ?? '')
  } else {
    console.error(`Unknown ctx.menuItemId: ${ctx.menuItemId}`)
  }
}
