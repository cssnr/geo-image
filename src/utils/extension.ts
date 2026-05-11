import { debug } from '@/utils/logger.ts'

// NOTE: All functions below are ported from VanillaJS

export function openSidePanel(close = false) {
  debug('openSidePanel - close:', close)
  if (chrome.sidePanel) {
    // debug('chrome.sidePanel')
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      chrome.sidePanel
        .open({ windowId: tab.windowId })
        .then(() => {
          if (close) window.close()
        })
        .catch(console.warn)
    })
  } else if (chrome.sidebarAction) {
    // debug('chrome.sidebarAction')
    chrome.sidebarAction.open()
    if (close) window.close()
  } else {
    console.log('Side Panel Not Supported')
  }
}

export function openOptions(close = false) {
  debug('openOptions')
  chrome.runtime
    .openOptionsPage()
    .then(() => {
      if (close) window.close()
    })
    .catch(console.warn)
}

export async function openPopup() {
  debug('openPopup')
  // Note: This fails if popup is already open (ex. double clicks)
  try {
    await chrome.action.openPopup()
  } catch (e) {
    debug('catch:', e)
  }
}

export async function openExtPanel(close = false) {
  debug('openExtPanel:', close)

  const panelPath = 'popout.html'
  const [defaultWidth, defaultHeight] = [390, 600]
  const type = chrome.windows.CreateType.POPUP

  if (!chrome.windows) return console.log('Browser does not support: chrome.windows')

  const local = await chrome.storage.local.get([
    'lastPanelID',
    'panelWidth',
    'panelHeight',
  ])
  debug('local:', local)

  const lastPanelID = local.lastPanelID as number | undefined
  debug('lastPanelID:', lastPanelID)

  try {
    if (lastPanelID) {
      // NOTE: This throws if lastPanelID is not an existing window ID
      const panel = await chrome.windows.get(lastPanelID)
      // debug('panel', panel)
      // debug('panel?.id', panel?.id)
      if (panel?.id) {
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
        // debug('tabs:', tabs)
        // debug('tabs[0]?.windowId:', tabs[0]?.windowId)
        if (panel.id != tabs[0]?.windowId) {
          debug('%cPanel found:', 'color: SpringGreen', panel.id)
          await chrome.windows.update(panel.id, { focused: true })
          if (close) window.close()
          return
        }
      }
    }
  } catch (e) {
    debug('catch:', e)
  }

  const panelWidth = local.panelWidth as number | undefined
  // debug('panelWidth:', panelWidth)
  const panelHeight = local.panelHeight as number | undefined
  // debug('panelHeight:', panelHeight)
  const width = panelWidth || defaultWidth // NOSONAR
  const height = panelHeight || defaultHeight // NOSONAR
  // debug(`width, height:`, width, height)
  const url = chrome.runtime.getURL(panelPath)
  // debug('url:', url)
  const panel = await chrome.windows.create({ type, url, width, height })
  // debug('panel:', panel)
  if (panel) {
    debug(`%cCreated new window: ${panel.id}`, 'color: Magenta')
    chrome.storage.local.set({ lastPanelID: panel.id }).catch(console.warn)
  }
  if (close) window.close()
}

export async function activateOrOpen(url: string, open = true) {
  debug('activateOrOpen:', url, open)
  // Note: To Get Tab from Tabs (requires host permissions or tabs)
  const tabs = await chrome.tabs.query({ currentWindow: true })
  // debug('tabs:', tabs)
  for (const tab of tabs) {
    if (tab.url === url) {
      debug('%cTab found, activating:', 'color: Lime', tab)
      return await chrome.tabs.update(tab.id, { active: true })
    }
  }
  if (open) {
    debug('%cTab not found, opening url:', 'color: Yellow', url)
    return await chrome.tabs.create({ active: true, url })
  }
  console.warn('tab not found and open not set for url:', url)
}

export function clickOpen(e: Event, close = false) {
  const target = e.currentTarget as HTMLAnchorElement
  let url = target.href
  debug('clickOpen:', close, url)
  if (!url || url === '#') return
  if (url.startsWith('/')) {
    url = chrome.runtime.getURL(url)
  }
  activateOrOpen(url)
    .then(() => {
      if (close || target.dataset.close === 'true') window.close()
    })
    .catch(console.warn)
}

// NOTE: This is ONLY used in ResultsTable.vue
export async function openResult(id: number) {
  debug('openResult - id:', id)
  const pageUrl = chrome.runtime.getURL('page.html')
  // debug('pageUrl:', pageUrl)
  // const contexts = await chrome.runtime.getContexts({
  //   contextTypes: ['TAB'],
  //   documentUrls: [pageUrl],
  // })
  const contexts = await chrome.runtime.getContexts({ contextTypes: ['TAB'] })
  debug('contexts:', contexts)
  const filtered = contexts.filter((c) => c.documentUrl?.startsWith(pageUrl))
  debug('filtered:', filtered)
  if (filtered.length) {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
    if (tabs.length) {
      const tab = tabs[0]
      debug('tab:', tab)
      const isInFiltered = filtered.some((c) => c.tabId === tab.id)
      debug('isInFiltered:', isInFiltered)
      if (isInFiltered) {
        await chrome.tabs.update(tab.id, { active: true })
        debug('%c --- SEND MESSAGE ---', 'color: Lime')
        await chrome.runtime.sendMessage({ id, tabId: tab.id })
        return
      }
    }

    const context = filtered[0]
    await chrome.tabs.update(context.tabId, { active: true })
    debug('%c --- SEND MESSAGE ---', 'color: Lime')
    await chrome.runtime.sendMessage({ id, tabId: context.tabId })
    return

    // for (const context of filtered) {
    //   debug('context:', context)
    //   if (context.documentUrl?.startsWith(pageUrl)) {
    //     const tabId = context.tabId
    //     debug('FOUND - tabId:', tabId)
    //     await chrome.tabs.update(tabId, { active: true })
    //     debug('chrome.runtime.sendMessage:', { srcUrl, tabId })
    //     await chrome.runtime.sendMessage({ srcUrl, tabId })
    //     return
    //   }
    // }
  }

  debug('%cTab NOT found... await openPageUrl()', 'color: Tomato')
  // pageArgs.open = true
  await openPage(id, true)
}

export function openPage(id: number, open = false) {
  const encoded = encodeURIComponent(id)
  const url = chrome.runtime.getURL(`page.html?id=${encoded}`)
  debug('openPage - url:', url)
  if (open) return chrome.tabs.create({ active: true, url })
  return activateOrOpen(url)
}

// export async function openResult(srcUrl: string) {
//   debug('openResult - srcUrl:', srcUrl)
//   const pageUrl = chrome.runtime.getURL('page.html')
//   debug('pageUrl:', pageUrl)
//   try {
//     const tabs = await chrome.tabs.query({ currentWindow: true })
//     debug('tabs:', tabs)
//     for (const tab of tabs) {
//       debug(`tab.url ${tab.id}:`, tab.url)
//       if (tab.id && tab.url?.startsWith(pageUrl)) {
//         debug('%cTab found, sendMessage:', 'color: PaleGreen', tab)
//         await chrome.tabs.update(tab.id, { active: true })
//         await chrome.runtime.sendMessage({ srcUrl })
//         return
//       }
//     }
//   } catch (e) {
//     console.error(e)
//   }
//   debug('%cTab NOT found, openPageUrl', 'color: Tomato')
//   await openPageUrl(srcUrl, true)
// }
