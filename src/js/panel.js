// JS for panel.html

import { debounce, onChanged, showToast, updateTable } from './export.js'

chrome.storage.onChanged.addListener(onChanged)

document.addEventListener('DOMContentLoaded', domContentLoaded)
document
    .querySelectorAll('.close-panel')
    .forEach((el) => el.addEventListener('click', closePanel))

window.addEventListener('resize', debounce(windowResize))

/**
 * DOMContentLoaded
 * @function domContentLoaded
 */
async function domContentLoaded() {
    console.debug('domContentLoaded')
    // Note: This can not be reliably set in: export.js > openExtPanel
    chrome.windows.getCurrent().then((window) => {
        chrome.storage.local.set({ lastPanelID: window.id }).then(() => {
            console.debug(`%c Set lastPanelID: ${window.id}`, 'color: Aqua')
        })
    })
    // chrome.storage.sync.get(['options']).then((items) => {
    //     console.debug('options:', items.options)
    // })

    updateTable().catch((e) => showToast(e.message))
}

async function windowResize() {
    // console.debug('windowResize:', event)
    const size = { panelWidth: window.outerWidth, panelHeight: window.outerHeight }
    console.debug('windowResize:', size)
    await chrome.storage.local.set(size).catch((e) => console.warn(e))
}

/**
 * Close Panel Click Callback
 * @function closePanel
 * @param {Event} [event]
 */
function closePanel(event) {
    console.debug('closePanel:', event)
    event?.preventDefault()
    window.close()
}
