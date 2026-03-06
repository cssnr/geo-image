// system

export const isFirefox =
  typeof browser !== 'undefined' && typeof browser?.runtime?.getBrowserInfo === 'function'

// export const isMobile = !!chrome.contextMenus
export const isMobile = typeof chrome.contextMenus !== 'object'
