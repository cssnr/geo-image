import { openExtPanel, openSidePanel } from '@/utils/extension.ts'
import { defaultOptions, getOptions } from '@/utils/options.ts'
import { isFirefox } from '@/utils/system.ts'
import { createContextMenus, onClicked } from '@/entrypoints/background/menus.ts'

export default defineBackground(() => {
  console.log('Hello background!', { id: browser.runtime.id })

  chrome.runtime.onInstalled.addListener(onInstalled)
  chrome.runtime.onStartup.addListener(onStartup)
  chrome.contextMenus?.onClicked.addListener(onClicked)
  chrome.commands?.onCommand.addListener(onCommand)
  chrome.storage.onChanged.addListener(onChanged)
})

async function onInstalled(details: chrome.runtime.InstalledDetails) {
  console.log('onInstalled:', details)

  const options = await setDefaultOptions(defaultOptions)
  console.debug('options:', options)

  if (options.contextMenu) createContextMenus()

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
      const url = chrome.runtime.getURL('/src/permissions/index.html')
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
    if (options.contextMenu) createContextMenus()

    const manifest = chrome.runtime.getManifest()
    console.debug('manifest:', manifest)
    await chrome.runtime.setUninstallURL(`${manifest.homepage_url}/issues`)
  }
}

// NOTE: Below is ported from VanillaJS

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

function onChanged(changes: object, namespace: string) {
  // console.debug('onChanged:', changes, namespace)
  for (const [key, { oldValue, newValue }] of Object.entries(changes)) {
    if (namespace === 'sync' && key === 'options' && oldValue && newValue) {
      if (oldValue.contextMenu !== newValue.contextMenu) {
        if (newValue?.contextMenu) {
          console.log('%c Enabled contextMenu...', 'color: Lime')
          createContextMenus()
        } else {
          console.log('%c Disabled contextMenu...', 'color: OrangeRed')
          chrome.contextMenus?.removeAll()
        }
      }
    }
  }
}
