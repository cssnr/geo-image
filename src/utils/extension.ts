// NOTE: All functions below are ported from VanillaJS

export function openSidePanel(close?: boolean) {
  console.debug('openSidePanel:', close)
  if (chrome.sidePanel) {
    console.debug('chrome.sidePanel')
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      chrome.sidePanel
        .open({ windowId: tab.windowId })
        .then(() => {
          if (close) window.close()
        })
        .catch(console.warn)
    })
  } else if (chrome.sidebarAction) {
    console.debug('chrome.sidebarAction')
    chrome.sidebarAction.open()
    if (close) window.close()
  } else {
    console.log('Side Panel Not Supported')
  }
}

export function openOptions(close = false) {
  console.debug('openOptions')
  chrome.runtime
    .openOptionsPage()
    .then(() => {
      if (close) window.close()
    })
    .catch(console.warn)
}

export async function openPopup() {
  console.debug('openPopup')
  // Note: This fails if popup is already open (ex. double clicks)
  try {
    await chrome.action.openPopup()
  } catch (e) {
    console.debug(e)
  }
}

export async function openExtPanel(close = false) {
  console.debug('openExtPanel:', close)

  const panelPath = 'popout.html'
  const [defaultWidth, defaultHeight] = [390, 600]
  const type = chrome.windows.CreateType.POPUP

  if (!chrome.windows) return console.log('Browser does not support: chrome.windows')

  const local = await chrome.storage.local.get([
    'lastPanelID',
    'panelWidth',
    'panelHeight',
  ])
  console.debug('local:', local)

  const lastPanelID = local.lastPanelID as number | undefined
  console.debug('lastPanelID:', lastPanelID)

  try {
    if (lastPanelID) {
      // NOTE: This throws if lastPanelID is not an existing window ID
      const panel = await chrome.windows.get(lastPanelID)
      // console.debug('panel', panel)
      console.debug('panel?.id', panel?.id)
      if (panel?.id) {
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
        // console.debug('tabs:', tabs)
        console.debug('tabs[0]?.windowId:', tabs[0]?.windowId)
        if (panel.id != tabs[0]?.windowId) {
          console.debug('%c Panel found:', 'color: SpringGreen', panel.id)
          await chrome.windows.update(panel.id, { focused: true })
          if (close) window.close()
          return
        }
      }
    }
  } catch (e) {
    console.log(e)
  }

  const panelWidth = local.panelWidth as number | undefined
  console.debug('panelWidth:', panelWidth)
  const panelHeight = local.panelHeight as number | undefined
  console.debug('panelHeight:', panelHeight)
  const width = panelWidth || defaultWidth // NOSONAR
  const height = panelHeight || defaultHeight // NOSONAR
  console.debug(`width, height:`, width, height)
  const url = chrome.runtime.getURL(panelPath)
  console.debug('url:', url)
  const panel = await chrome.windows.create({ type, url, width, height })
  console.debug('panel:', panel)
  if (panel) {
    console.debug(`%c Created new window: ${panel.id}`, 'color: Magenta')
    chrome.storage.local.set({ lastPanelID: panel.id }).catch(console.warn)
  }
  if (close) window.close()
}

export async function activateOrOpen(url: string, open = true) {
  console.debug('activateOrOpen:', url, open)
  // Note: To Get Tab from Tabs (requires host permissions or tabs)
  const tabs = await chrome.tabs.query({ currentWindow: true })
  console.debug('tabs:', tabs)
  for (const tab of tabs) {
    if (tab.url === url) {
      console.debug('%cTab found, activating:', 'color: Lime', tab)
      return await chrome.tabs.update(tab.id, { active: true })
    }
  }
  if (open) {
    console.debug('%cTab not found, opening url:', 'color: Yellow', url)
    return await chrome.tabs.create({ active: true, url })
  }
  console.warn('tab not found and open not set!')
}

export function clickOpen(e: Event, close = false) {
  const target = e.currentTarget as HTMLAnchorElement
  let url = target.href
  console.log('clickOpen:', close, url)
  if (!url || url === '#') return
  if (url.startsWith('/')) {
    url = chrome.runtime.getURL(url)
  }
  activateOrOpen(url)
    .then(() => {
      if (close || target.dataset.close === 'true') window.close()
    })
    .catch(console.log)
}

export function openPageUrl(srcUrl: string, open = false) {
  const encoded = encodeURIComponent(srcUrl)
  const url = chrome.runtime.getURL(`page.html?url=${encoded}`)
  console.log('openPageUrl - url:', url)
  if (open) return chrome.tabs.create({ active: true, url })
  return activateOrOpen(url)
}

// NOTE: This is a WIP method to open an existing page...
export async function openResult(srcUrl: string) {
  console.log('openResult - srcUrl:', srcUrl)
  const pageUrl = chrome.runtime.getURL('page.html')
  // console.log('pageUrl:', pageUrl)
  // const contexts = await chrome.runtime.getContexts({
  //   contextTypes: ['TAB'],
  //   documentUrls: [pageUrl],
  // })
  const contexts = await chrome.runtime.getContexts({ contextTypes: ['TAB'] })
  console.log('contexts:', contexts)
  const filtered = contexts.filter((c) => c.documentUrl?.startsWith(pageUrl))
  console.log('filtered:', filtered)
  if (filtered.length) {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
    if (tabs.length) {
      const tab = tabs[0]
      console.log('tab:', tab)
      const isInFiltered = filtered.some((c) => c.tabId === tab.id)
      console.log('isInFiltered:', isInFiltered)
      if (isInFiltered) {
        await chrome.tabs.update(tab.id, { active: true })
        await chrome.runtime.sendMessage({ srcUrl, tabId: tab.id })
        return
      }
    }

    const context = contexts[0]
    await chrome.tabs.update(context.tabId, { active: true })
    await chrome.runtime.sendMessage({ srcUrl, tabId: context.tabId })
    return

    // for (const context of filtered) {
    //   console.log('context:', context)
    //   if (context.documentUrl?.startsWith(pageUrl)) {
    //     const tabId = context.tabId
    //     console.log('FOUND - tabId:', tabId)
    //     await chrome.tabs.update(tabId, { active: true })
    //     console.log('chrome.runtime.sendMessage:', { srcUrl, tabId })
    //     await chrome.runtime.sendMessage({ srcUrl, tabId })
    //     return
    //   }
    // }
  }

  console.debug('%cTab NOT found... await openPageUrl()', 'color: Tomato')
  await openPageUrl(srcUrl, true)
}

// export async function openResult(srcUrl: string) {
//   console.log('openResult - srcUrl:', srcUrl)
//   const pageUrl = chrome.runtime.getURL('page.html')
//   console.log('pageUrl:', pageUrl)
//   try {
//     const tabs = await chrome.tabs.query({ currentWindow: true })
//     console.debug('tabs:', tabs)
//     for (const tab of tabs) {
//       console.debug(`tab.url ${tab.id}:`, tab.url)
//       if (tab.id && tab.url?.startsWith(pageUrl)) {
//         console.debug('%cTab found, sendMessage:', 'color: PaleGreen', tab)
//         await chrome.tabs.update(tab.id, { active: true })
//         await chrome.runtime.sendMessage({ srcUrl })
//         return
//       }
//     }
//   } catch (e) {
//     console.error(e)
//   }
//   console.debug('%cTab NOT found, openPageUrl', 'color: Tomato')
//   await openPageUrl(srcUrl, true)
// }
