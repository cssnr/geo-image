// JS for options.html

import {
    checkPerms,
    grantPerms,
    linkClick,
    onAdded,
    onRemoved,
    revokePerms,
    saveOptions,
    showToast,
    updateManifest,
    updateBrowser,
    updateOptions,
    updatePlatform,
    onChanged,
} from './export.js'

chrome.storage.onChanged.addListener(onChanged)
chrome.permissions.onAdded.addListener(onAdded)
chrome.permissions.onRemoved.addListener(onRemoved)

document.addEventListener('DOMContentLoaded', initOptions)
document.getElementById('copy-support').addEventListener('click', copySupport)
document
    .querySelectorAll('.revoke-permissions')
    .forEach((el) => el.addEventListener('click', revokePerms))
document
    .querySelectorAll('.grant-permissions')
    .forEach((el) => el.addEventListener('click', grantPerms))
document
    .querySelectorAll('a[href]')
    .forEach((el) => el.addEventListener('click', linkClick))
document
    .querySelectorAll('.options input')
    .forEach((el) => el.addEventListener('change', saveOptions))
document
    .querySelectorAll('form.options')
    .forEach((el) => el.addEventListener('submit', (e) => e.preventDefault()))
document
    .querySelectorAll('[data-bs-toggle="tooltip"]')
    .forEach((el) => new bootstrap.Tooltip(el))

document
    .querySelectorAll('[data-show-hide]')
    .forEach((el) => el.addEventListener('click', showHidePassword))
document
    .querySelectorAll('[data-copy-input]')
    .forEach((el) => el.addEventListener('click', copyInput))

document.getElementById('chrome-shortcuts').addEventListener('click', () => {
    // noinspection JSIgnoredPromiseFromCall
    chrome.tabs.update({ url: 'chrome://extensions/shortcuts' })
})

/**
 * Initialize Options
 * @function initOptions
 */
async function initOptions() {
    console.debug('initOptions')
    updateManifest().catch((e) => console.warn(e))
    updateBrowser().catch((e) => console.warn(e))
    updatePlatform().catch((e) => console.warn(e))
    checkPerms().catch((e) => console.warn(e))
    setShortcuts().catch((e) => console.warn(e))
    chrome.storage.sync.get(['options']).then((items) => {
        // console.debug('options:', items.options)
        updateOptions(items.options)
    })
}

/**
 * Set Keyboard Shortcuts
 * @function setShortcuts
 * @param {String} [selector]
 */
async function setShortcuts(selector = '#keyboard-shortcuts') {
    if (!chrome.commands) {
        return console.debug('Skipping: chrome.commands')
    }
    const table = document.querySelector(selector)
    table.classList.remove('d-none')
    const tbody = table.querySelector('tbody')
    const source = table.querySelector('tfoot > tr').cloneNode(true)
    const commands = await chrome.commands.getAll()
    for (const command of commands) {
        // console.debug('command:', command)
        const row = source.cloneNode(true)
        let description = command.description
        // Note: Chrome does not parse the description for _execute_action in manifest.json
        if (!description && command.name === '_execute_action') {
            description = 'Open Popup' // NOTE: Also defined in: manifest.json
        }
        row.querySelector('.description').textContent = description
        row.querySelector('kbd').textContent = command.shortcut || 'Not Set'
        tbody.appendChild(row)
    }
}

/**
 * Copy Support Click Callback
 * @function copySupport
 * @param {MouseEvent} event
 */
async function copySupport(event) {
    console.debug('copySupport:', event)
    event.preventDefault()
    const manifest = chrome.runtime.getManifest()
    const permissions = await chrome.permissions.getAll()
    const { options } = await chrome.storage.sync.get(['options'])
    delete options.authToken

    const items = await chrome.storage.local.get(null)
    const keys = Object.keys(items).filter((k) => k.startsWith('http'))

    const result = [
        `${manifest.name} - ${manifest.version}`,
        navigator.userAgent,
        `permissions.origins: ${JSON.stringify(permissions.origins)}`,
        `options: ${JSON.stringify(options)}`,
        `keys: ${keys.length}`,
    ]
    const commands = await chrome.commands?.getAll()
    if (commands) {
        result.push(`commands: ${JSON.stringify(commands)}`)
    }
    await navigator.clipboard.writeText(result.join('\n'))
    showToast('Support Information Copied.')
}

function showHidePassword(event) {
    console.debug('showHidePassword:', event)
    const element = event.target.closest('button')
    const input = document.querySelector(element.dataset.showHide)
    if (input.type === 'password') {
        input.type = 'text'
    } else {
        input.type = 'password'
    }
}

async function copyInput(event) {
    console.debug('copyInput:', event)
    const element = event.target.closest('button')
    console.debug('element.dataset.copyInput:', element.dataset.copyInput)
    const input = document.querySelector(element.dataset.copyInput)
    console.debug('input:', input)
    if (!input.value) {
        showToast('No Data to Copy.', 'warning')
        return
    }
    await navigator.clipboard.writeText(input.value)
    if (element.dataset.copyText) {
        showToast(element.dataset.copyText)
    } else {
        showToast('Copied to Clipboard.')
    }
}
