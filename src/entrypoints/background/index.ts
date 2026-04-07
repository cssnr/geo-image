import { openExtPanel, openPageUrl, openSidePanel } from '@/utils/extension.ts'
import { isFirefox } from '@/utils/system.ts'
import { defaultOptions, getOptions } from '@/utils/options.ts'
import { createContextMenus } from './menus.ts'
import { STORE_KEY } from '@/utils/prompt.ts'

export default defineBackground(() => {
  console.log(`Loaded: %c${chrome.runtime.id}`, 'Color: Cyan')

  chrome.runtime.onInstalled.addListener(onInstalled)
  chrome.runtime.onStartup.addListener(onStartup)
  chrome.storage.sync.onChanged.addListener(onChanged)
  chrome.commands?.onCommand.addListener(onCommand)
  chrome.contextMenus?.onClicked.addListener(onClicked)
})

async function setDefaultOptions(defaultOptions: object) {
  console.log('setDefaultOptions', defaultOptions)
  const options = await getOptions()
  let changed = false
  for (const [key, value] of Object.entries(defaultOptions)) {
    // console.log(`${key}: default: ${value} current: ${options[key]}`)
    if (options[key] === undefined) {
      changed = true
      options[key] = value
      console.log(`Set %c${key}:`, 'color: Khaki', value)
    }
  }
  if (changed) {
    await chrome.storage.sync.set({ options })
    console.log('changed options:', options)
  }
  return options
}

async function onInstalled(details: chrome.runtime.InstalledDetails) {
  console.log('onInstalled:', details)

  const options = await setDefaultOptions(defaultOptions)
  console.debug('options:', options)

  if (options.contextMenu) createContextMenus().catch(console.warn)

  const manifest = chrome.runtime.getManifest()
  console.debug('manifest:', manifest)

  await chrome.runtime.setUninstallURL(`${manifest.homepage_url}/issues`)

  if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
    // await chrome.runtime.openOptionsPage()
    // const hasPerms = await checkPerms(manifest)
    const hasPerms = await chrome.permissions.contains({
      origins: manifest.host_permissions,
    })
    console.debug('hasPerms:', hasPerms)
    if (hasPerms) {
      await chrome.runtime.openOptionsPage()
    } else {
      const url = chrome.runtime.getURL('permissions.html')
      await chrome.tabs.create({ active: true, url })
    }
  } else if (details.reason === chrome.runtime.OnInstalledReason.UPDATE) {
    if (options.showUpdate) {
      if (manifest.version !== details.previousVersion) {
        const url = `${manifest.homepage_url}/releases/tag/${manifest.version}`
        await chrome.tabs.create({ active: false, url })
      }
    }
  }
}

async function onStartup() {
  console.log('onStartup')
  if (isFirefox) {
    console.log('Firefox Startup Workarounds')
    // NOTE: Confirm these checks are still necessary...
    const options = await getOptions()
    console.debug('options:', options)
    if (options.contextMenu) createContextMenus().catch(console.warn)

    const manifest = chrome.runtime.getManifest()
    console.debug('manifest:', manifest)
    await chrome.runtime.setUninstallURL(`${manifest.homepage_url}/issues`)
  }
}

function onChanged(changes: Record<string, chrome.storage.StorageChange>) {
  console.log('%c background/index.ts - onChanged:', 'color: Cyan', changes)
  // process and type options
  if ('options' in changes) {
    const oldValue = changes.options?.oldValue as Options | undefined
    const newValue = changes.options?.newValue as Options | undefined
    // if (!oldValue || !newValue) return console.log('missing oldValue or newValue')
    if (!oldValue) return console.log('onChanged: missing options oldValue')
    if (!newValue) return console.warn('onChanged: missing options newValue')

    if (oldValue?.contextMenu !== newValue.contextMenu) {
      if (newValue.contextMenu) {
        console.log('%c Enabled contextMenu...', 'color: Lime')
        createContextMenus().catch(console.warn)
      } else {
        console.log('%c Disabled contextMenu...', 'color: OrangeRed')
        chrome.contextMenus?.removeAll().catch(console.warn)
      }
    }
  }

  if (STORE_KEY in changes) {
    console.log('%c STORE KEY IN CHANGES YOU DID IT BOBBY', 'color: Lime')
    getOptions().then((options) => {
      if (options.contextMenu) createContextMenus().catch(console.warn)
    })
  }
}

async function onCommand(command: string, tab?: chrome.tabs.Tab) {
  console.debug('onCommand:', command, tab)
  if (command === 'openOptions') {
    await chrome.runtime.openOptionsPage()
  } else if (command === 'openExtPanel') {
    await openExtPanel()
  } else if (command === 'openSidePanel') {
    openSidePanel()
  } else {
    console.warn(`Unknown Command: ${command}`)
  }
}

async function onClicked(ctx: chrome.contextMenus.OnClickData, tab?: chrome.tabs.Tab) {
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
