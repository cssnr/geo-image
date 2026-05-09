import { getAppConfig } from '#imports'
import { debug } from '@/utils/logger.ts'
import { isFirefox } from '@/utils/system.ts'
import { defineBackground } from 'wxt/utils/define-background'
import { processNewUrl } from '@/utils/api.ts'
import { openExtPanel, openPopup, openSidePanel } from '@/utils/extension.ts'
import { type Options, defaultOptions, getOptions } from '@/utils/options.ts'
import { updateContextMenus } from './menus.ts'

const config = getAppConfig()
const banner = `      %cGeo%cImage   %cv${config.version}%c
        _,--',   _._.--._____
 .--.--';_'-.', ";_      _.,-'
.'--'.  _.'    {\`'-;_ .-.>.'
      '-:_      )  / \`' '=.
        ) >     {_/,     /~)
        |/               \`^ .'
%c${config.githubUrl}`

export default defineBackground(() => {
  // console.log(`Loaded: %c${chrome.runtime.id}`, 'Color: Cyan')
  console.log(
    banner,
    'color: #ee00ff',
    'color: #0dcaf0',
    'color: MediumSeaGreen',
    '',
    'color: MediumSlateBlue',
  )
  if (import.meta.env.DEV) {
    console.log('%cWARNING: DEV MODE ENABLED', 'color: Tomato')
  }
  if (import.meta.env.WXT_FAKE_DATA) {
    console.log('%cWARNING: FAKE DATA ENABLED', 'color: Tomato')
    console.log('WXT_FAKE_DELAY:', import.meta.env.WXT_FAKE_DELAY)
  }

  chrome.runtime.onInstalled.addListener(onInstalled)
  chrome.runtime.onStartup.addListener(onStartup)
  chrome.storage.sync.onChanged.addListener(onChanged)
  chrome.commands?.onCommand.addListener(onCommand)
  chrome.contextMenus?.onClicked.addListener(onClicked)
  chrome.runtime.onMessage.addListener(onMessage)
})

async function onInstalled(details: chrome.runtime.InstalledDetails) {
  debug('onInstalled:', details)

  const options = await setDefaultOptions(defaultOptions)
  debug('options:', options)
  updateContextMenus(options.contextMenu).catch(console.warn)
  setUninstall().catch(console.warn)

  const manifest = chrome.runtime.getManifest()
  debug('manifest:', manifest)

  if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
    const hasPerms = await chrome.permissions.contains({
      origins: manifest.host_permissions,
    })
    debug('hasPerms:', hasPerms)
    if (hasPerms) {
      await chrome.runtime.openOptionsPage()
    } else {
      const url = chrome.runtime.getURL('permissions.html')
      await chrome.tabs.create({ active: true, url })
    }
  } else if (details.reason === chrome.runtime.OnInstalledReason.UPDATE) {
    if (options.showUpdate && manifest.version !== details.previousVersion) {
      const url = `${manifest.homepage_url}/releases/tag/${manifest.version}`
      await chrome.tabs.create({ active: false, url })
    }
  }
}

async function onStartup() {
  debug('onStartup')
  if (isFirefox) {
    debug('Firefox Startup Workarounds')
    const options = await getOptions()
    debug('options:', options)
    updateContextMenus(options.contextMenu).catch(console.warn)
    setUninstall().catch(console.warn)
  }
}

function onChanged(changes: Record<string, chrome.storage.StorageChange>) {
  // debug('%c background/index.ts - onChanged:', 'color: Cyan', changes)
  if (changes?.options) {
    const oldValue = changes.options?.oldValue as Options | undefined
    const newValue = changes.options?.newValue as Options | undefined
    if (!oldValue || !newValue) return console.log('missing oldValue or newValue')

    if (oldValue?.contextMenu !== newValue.contextMenu) {
      updateContextMenus(newValue.contextMenu).catch(console.warn)
    }
  }
}

async function onCommand(command: string, tab?: chrome.tabs.Tab) {
  debug('onCommand:', command, tab)
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
  debug('onClicked:', ctx, tab)
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
    // return openPageUrl({ srcUrl: ctx.srcUrl ?? '' })
    debug('%c TODO - HANDLE IMAGE CLICK HERE - URL', 'color: Orange')
    // TODO: Work Here
    debug('ctx.srcUrl:', ctx.srcUrl)
    processNewUrl(ctx.srcUrl).catch(console.error) // send notification
  } else {
    console.error(`Unknown ctx.menuItemId: ${ctx.menuItemId}`)
  }
}

function onMessage(message: any, sender: chrome.runtime.MessageSender) {
  debug('%c background/index.ts - onMessage:', 'Color: Plum', message, sender)
  if (message.imageSrc) {
    debug('%c TODO - HANDLE IMAGE UPLOAD HERE - DATA', 'color: Orange')
    // TODO: Work Here
    debug('message.imageSrc:', message.imageSrc)
    processNewUrl(message.imageSrc).catch(console.error) // send notification
  }
}

async function setDefaultOptions(defaultOptions: object) {
  debug('setDefaultOptions', defaultOptions)
  const options = await getOptions()
  let changed = false
  for (const [key, value] of Object.entries(defaultOptions)) {
    // debug(`${key}: default: ${value} current: ${options[key]}`)
    if (options[key] === undefined) {
      changed = true
      options[key] = value
      debug(`Set %c${key}:`, 'color: Khaki', value)
    }
  }
  if (changed) {
    await chrome.storage.sync.set({ options })
    debug('set changed options:', options)
  }
  return options
}

async function setUninstall() {
  // NOTE: Calling this setUninstallURL and using getAppConfig breaks WXT
  // const config = getAppConfig()
  const url = new URL(config.uninstallUrl)
  url.searchParams.append('version', config.version)
  url.searchParams.append('id', chrome.runtime.id)
  debug('setUninstallURL:', url.href)
  await chrome.runtime.setUninstallURL(url.href)
}
