// JS Exports

export const githubURL = 'https://github.com/cssnr/geo-image'

/**
 * Save Options Callback
 * @function saveOptions
 * @param {UIEvent} event
 */
export async function saveOptions(event) {
    console.debug('saveOptions:', event)
    const { options } = await chrome.storage.sync.get(['options'])
    let key = event.target.id
    let value
    if (event.target.type === 'radio') {
        key = event.target.name
        const radios = document.getElementsByName(key)
        for (const input of radios) {
            if (input.checked) {
                value = input.id
                break
            }
        }
    } else if (event.target.type === 'checkbox') {
        value = event.target.checked
    } else if (event.target.type === 'number') {
        const number = Number.parseFloat(event.target.value)
        let min = Number.parseFloat(event.target.min)
        let max = Number.parseFloat(event.target.max)
        if (!Number.isNaN(number) && number >= min && number <= max) {
            event.target.value = number.toString()
            value = number
        } else {
            event.target.value = options[event.target.id]
            return
        }
    } else {
        value = event.target.value
    }
    if (value !== undefined) {
        options[key] = value
        console.log(`Set %c${key}:`, 'color: Khaki', value)
        await chrome.storage.sync.set({ options })
    } else {
        console.warn(`No Value for key: ${key}`)
    }
}

/**
 * Update Options
 * @function initOptions
 * @param {Object} options
 */
export function updateOptions(options) {
    console.debug('updateOptions:', options)
    for (let [key, value] of Object.entries(options)) {
        if (value === undefined) {
            console.warn('Value undefined for key:', key)
            continue
        }
        // Option Key should be `radioXXX` and values should be the option IDs
        if (key.startsWith('radio')) {
            key = value //NOSONAR
            value = true //NOSONAR
        }
        // console.debug(`${key}: ${value}`)
        const el = document.getElementById(key)
        if (!el) {
            continue
        }
        if (el.tagName !== 'INPUT') {
            el.textContent = value.toString()
        } else if (typeof value === 'boolean') {
            el.checked = value
        } else {
            el.value = value
        }
        if (el.dataset.related) {
            hideShowElement(`#${el.dataset.related}`, value)
        }
    }
}

/**
 * Hide or Show Element with JQuery
 * @function hideShowElement
 * @param {String} selector
 * @param {Boolean} [show]
 * @param {String} [speed]
 */
function hideShowElement(selector, show, speed = 'fast') {
    const element = $(`${selector}`)
    // console.debug('hideShowElement:', show, element)
    if (show) {
        element.show(speed)
    } else {
        element.hide(speed)
    }
}

/**
 * Link Click Callback
 * Note: Firefox popup requires a call to window.close()
 * @function linkClick
 * @param {MouseEvent|Event} event
 * @param {Boolean} [close]
 */
export async function linkClick(event, close = false) {
    console.debug('linkClick:', close, event)
    const target = event.currentTarget
    const href = target.getAttribute('href').replace(/^\.+/, '')
    console.debug('href:', href)
    let url
    if (href.startsWith('#')) {
        console.debug('return on anchor link')
        return
    }
    event.preventDefault()
    if (href.endsWith('html/options.html')) {
        await chrome.runtime.openOptionsPage()
        if (close) window.close()
        return
    } else if (href.endsWith('html/panel.html')) {
        await openExtPanel()
        if (close) window.close()
        return
    } else if (href.endsWith('html/sidepanel.html')) {
        await openSidePanel()
        if (close) window.close()
        return
    } else if (href.startsWith('http') || href.includes('/html/page.html?url=')) {
        url = href
    } else {
        url = chrome.runtime.getURL(href)
    }
    console.debug('url:', url)
    await activateOrOpen(url)
    if (close) window.close()
}

/**
 * Activate or Open Tab from URL
 * @function activateOrOpen
 * @param {String} url
 * @param {Boolean} [open]
 * @return {Promise<chrome.tabs.Tab>}
 */
export async function activateOrOpen(url, open = true) {
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

/**
 * Update DOM with Manifest Details
 * @function updateManifest
 */
export async function updateManifest() {
    const manifest = chrome.runtime.getManifest()
    console.debug('updateManifest:', manifest)
    document.querySelectorAll('.version').forEach((el) => {
        el.textContent = manifest.version
    })
    document.querySelectorAll('[href="homepage_url"]').forEach((el) => {
        el.href = manifest.homepage_url
    })
    document.querySelectorAll('[href="version_url"]').forEach((el) => {
        el.href = `${githubURL}/releases/tag/${manifest.version}`
    })
}

/**
 * @function updateBrowser
 * @return {Promise<void>}
 */
export async function updateBrowser() {
    let selector = '.chrome'
    // noinspection JSUnresolvedReference
    if (
        typeof browser !== 'undefined' &&
        typeof browser?.runtime?.getBrowserInfo === 'function'
    ) {
        selector = '.firefox'
    }
    console.debug('updateBrowser:', selector)
    document.querySelectorAll(selector).forEach((el) => el.classList.remove('d-none'))
}

/**
 * @function updatePlatform
 * @return {Promise<chrome.runtime.PlatformInfo>}
 */
export async function updatePlatform() {
    const platform = await chrome.runtime.getPlatformInfo()
    console.debug('updatePlatform:', platform)
    const splitCls = (cls) => cls.split(' ').filter(Boolean)
    if (platform.os === 'android' && typeof document !== 'undefined') {
        // document.querySelectorAll('[class*="mobile-"]').forEach((el) => {
        document
            .querySelectorAll(
                '[data-mobile-add],[data-mobile-remove],[data-mobile-replace]',
            )
            .forEach((el) => {
                if (el.dataset.mobileAdd) {
                    for (const cls of splitCls(el.dataset.mobileAdd)) {
                        // console.debug('mobileAdd:', cls)
                        el.classList.add(cls)
                    }
                }
                if (el.dataset.mobileRemove) {
                    for (const cls of splitCls(el.dataset.mobileRemove)) {
                        // console.debug('mobileAdd:', cls)
                        el.classList.remove(cls)
                    }
                }
                if (el.dataset.mobileReplace) {
                    const split = splitCls(el.dataset.mobileReplace)
                    // console.debug('mobileReplace:', split)
                    for (let i = 0; i < split.length; i += 2) {
                        const one = split[i]
                        const two = split[i + 1]
                        // console.debug(`replace: ${one} >> ${two}`)
                        el.classList.replace(one, two)
                    }
                }
            })
    }
    return platform
}

/**
 * Check Host Permissions
 * @function checkPerms
 * @return {Promise<Boolean>}
 */
export async function checkPerms() {
    const hasPerms = await chrome.permissions.contains({
        origins: ['*://*/*'],
    })
    console.debug('checkPerms:', hasPerms)
    // Firefox still uses DOM Based Background Scripts
    if (typeof document === 'undefined') {
        return hasPerms
    }
    const hasPermsEl = document.querySelectorAll('.has-perms')
    const grantPermsEl = document.querySelectorAll('.grant-perms')
    if (hasPerms) {
        hasPermsEl.forEach((el) => el.classList.remove('d-none'))
        grantPermsEl.forEach((el) => el.classList.add('d-none'))
    } else {
        grantPermsEl.forEach((el) => el.classList.remove('d-none'))
        hasPermsEl.forEach((el) => el.classList.add('d-none'))
    }
    return hasPerms
}

/**
 * Grant Permissions Click Callback
 * @function grantPerms
 * @param {MouseEvent|Event} event
 * @param {Boolean} [close]
 */
export async function grantPerms(event, close = false) {
    console.debug('grantPerms:', event)
    requestPerms().catch((e) => console.warn(e))
    if (close) window.close()
}

/**
 * Request Host Permissions
 * @function requestPerms
 * @return {Promise<Boolean>}
 */
export async function requestPerms() {
    return await chrome.permissions.request({
        origins: ['*://*/*'],
    })
}

/**
 * Revoke Permissions Click Callback
 * Note: This method does not work on Chrome if permissions are required.
 * @function revokePerms
 * @param {MouseEvent} event
 */
export async function revokePerms(event) {
    console.debug('revokePerms:', event)
    const permissions = await chrome.permissions.getAll()
    console.debug('permissions:', permissions)
    try {
        await chrome.permissions.remove({
            origins: permissions.origins,
        })
        await checkPerms()
    } catch (e) {
        console.log(e)
        showToast(e.toString(), 'danger')
    }
}

/**
 * Permissions On Added Callback
 * @param {chrome.permissions} permissions
 */
export async function onAdded(permissions) {
    console.debug('onAdded', permissions)
    await checkPerms()
}

/**
 * Permissions On Removed Callback
 * @param {chrome.permissions} permissions
 */
export async function onRemoved(permissions) {
    console.debug('onRemoved', permissions)
    await checkPerms()
}

/**
 * Open Extension Panel
 * @function openExtPanel
 * @param {String} [url]
 * @param {Number} [width]
 * @param {Number} [height]
 * @param {String} [type]
 * @return {Promise<chrome.windows.Window|undefined>}
 */
export async function openExtPanel(
    url = '/html/panel.html',
    width = 0,
    height = 0,
    type = 'panel',
) {
    if (!chrome.windows) {
        console.log('Browser does not support: chrome.windows')
        showToast('Browser does not support windows', 'danger')
        return
    }
    let { lastPanelID, panelWidth, panelHeight } = await chrome.storage.local.get([
        'lastPanelID',
        'panelWidth',
        'panelHeight',
    ])
    console.debug(`local panel: ${lastPanelID} - ${panelWidth}/${panelHeight}`)

    width = Number.parseInt(width || panelWidth || 340)
    height = Number.parseInt(height || panelHeight || 600)
    console.debug(`openExtPanel: ${url}`, width, height)

    try {
        const window = await chrome.windows.get(lastPanelID)
        // console.debug('window', window)
        if (window) {
            console.debug(`%c Window found: ${window.id}`, 'color: Lime')
            return await chrome.windows.update(lastPanelID, {
                focused: true,
            })
        }
    } catch (e) {
        console.log(e)
    }

    // noinspection JSCheckFunctionSignatures
    const window = await chrome.windows.create({ type, url, width, height })
    console.debug(`%c Created new window: ${window.id}`, 'color: Magenta')
    chrome.storage.local.set({ lastPanelID: window.id }).catch((e) => console.warn(e))
    return window
}

/**
 * Open Side Panel Callback
 * @function openSidePanel
 * @param {Event} [event]
 */
export async function openSidePanel(event) {
    console.debug('openSidePanel:', event)
    if (chrome.sidePanel) {
        chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
            chrome.sidePanel.open({ windowId: tab.windowId })
        })
    } else if (chrome.sidebarAction) {
        // noinspection JSUnresolvedReference
        await chrome.sidebarAction.open()
    } else {
        console.log('Side Panel Not Supported')
        if (event) {
            showToast('Side Panel Not Supported', 'danger')
            return
        }
    }
    if (event) window.close()

    // if (typeof window !== 'undefined') {
    //     window.close()
    // }
}

/**
 * Open Popup Click Callback
 * NOTE: Requires Chrome>=127
 * @function openPopup
 * @param {Event} [event]
 */
export async function openPopup(event) {
    console.debug('openPopup:', event)
    event?.preventDefault()
    // Note: This fails if popup is already open (ex. double clicks)
    try {
        await chrome.action.openPopup()
    } catch (e) {
        console.debug(e)
    }
}

/**
 * Show Bootstrap Toast
 * @function showToast
 * @param {String} message
 * @param {String} type
 */
export function showToast(message, type = 'primary') {
    console.debug(`showToast: ${type}: ${message}`)
    const clone = document.querySelector('#clone > .toast')
    const container = document.getElementById('toast-container')
    if (!clone || !container) {
        return console.warn('Missing clone or container:', clone, container)
    }
    const element = clone.cloneNode(true)
    element.querySelector('.toast-body').textContent = message
    element.classList.add(`text-bg-${type}`)
    container.appendChild(element)
    const toast = new bootstrap.Toast(element)
    element.addEventListener('mousemove', () => toast.hide())
    toast.show()
}

/**
 * DeBounce Function
 * @function debounce
 * @param {Function} fn
 * @param {Number} timeout
 */
export function debounce(fn, timeout = 250) {
    let timeoutID
    return (...args) => {
        clearTimeout(timeoutID)
        timeoutID = setTimeout(() => fn(...args), timeout)
    }
}

/**
 * Open Page
 * @param {string} srcUrl
 * @return {Promise<chrome.tabs.Tab>}
 */
export async function openPage(srcUrl) {
    const encoded = encodeURIComponent(srcUrl)
    const url = chrome.runtime.getURL(`/html/page.html?url=${encoded}`)
    // return chrome.tabs.create({ active: true, url })
    return activateOrOpen(url)
}

/**
 * Process Input Form
 * @param {SubmitEvent|InputEvent} event
 */
export async function processForm(event) {
    try {
        console.debug('processForm:', event)
        const target = event.currentTarget
        event.preventDefault()
        console.debug('target:', target)
        const input = target.elements['image-input']
        console.debug('input:', input)
        const link = input.value.trim()
        console.debug('link:', link)
        const url = new URL(link)
        console.debug('url:', url)
        await openPage(url.href)
        if (target.dataset.close !== undefined) window.close()
    } catch (e) {
        showToast(e.message, 'danger')
    }
}

/**
 * On Changed Callback
 * @function onChanged
 * @param {Object} changes
 * @param {String} namespace
 */
export function onChanged(changes, namespace) {
    console.debug('onChanged:', changes, namespace)
    if (namespace === 'sync') {
        console.debug('onChanged:', changes, namespace)
        for (const [key, { newValue }] of Object.entries(changes)) {
            if (key === 'options') {
                updateOptions(newValue)
            }
        }
    }
    if (namespace === 'local') {
        console.debug('changes:', changes)
        for (const [key, { newValue }] of Object.entries(changes)) {
            console.debug('key:', key)
            if (key.toLowerCase().startsWith('http')) {
                console.debug('newValue:', newValue)
                updateTable().catch((e) => showToast(e.message))
            }
        }
    }
}

export async function updateTable() {
    const items = await chrome.storage.local.get(null)
    console.debug('items:', items)

    // const keys = Object.keys(items).filter((k) => k.startsWith('http'))
    // console.log('keys:', keys)

    const filtered = Object.fromEntries(
        Object.entries(items).filter(([k]) => k.startsWith('http')),
    )
    console.debug('filtered:', filtered)

    const faTrashCan = document.querySelector('#clone > .fa-trash-can')

    const tbody = document.querySelector('table tbody')
    tbody.innerHTML = ''
    for (const [i, [url, data]] of Object.entries(filtered).reverse().entries()) {
        console.debug(`url ${i + 1}:`, url)
        const row = tbody.insertRow()

        const cell1 = row.insertCell()
        cell1.classList.add('text-center')
        cell1.appendChild(document.createTextNode(`${i + 1}`))

        const cell2 = row.insertCell()
        const hostLink = document.createElement('a')
        hostLink.textContent = `${data.country}, ${data.state}, ${data.city}`
        hostLink.title = url
        hostLink.href = url
        hostLink.target = '_blank'
        cell2.classList.add('overflow-hidden', 'text-ellipsis')
        cell2.appendChild(hostLink)

        const cell3 = row.insertCell()
        const deleteBtn = document.createElement('a')
        deleteBtn.appendChild(faTrashCan.cloneNode(true))
        deleteBtn.title = 'Delete'
        deleteBtn.dataset.url = url
        deleteBtn.classList.add('link-danger')
        deleteBtn.setAttribute('role', 'button')
        deleteBtn.addEventListener('click', deleteHost)
        cell3.classList.add('text-center')
        cell3.appendChild(deleteBtn)
    }
}

/**
 * Delete Host Click Callback
 * @function deleteHost
 * @param {MouseEvent} event
 */
async function deleteHost(event) {
    console.debug('deleteHost:', event)
    event.preventDefault()
    const url = event.currentTarget?.dataset?.url
    console.info(`Delete URL: ${url}`)
    await chrome.storage.local.remove(url)
    showToast('Deleted Analysis', 'warning')
}
