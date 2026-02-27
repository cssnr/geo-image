// JS for sidepanel.html

import {
    linkClick,
    onChanged,
    openPopup,
    showToast,
    updateManifest,
    updateTable,
} from './export.js'

chrome.storage.onChanged.addListener(onChanged)

document.addEventListener('DOMContentLoaded', domContentLoaded)
document
    .querySelectorAll('a[href]')
    .forEach((el) => el.addEventListener('click', linkClick))
document
    .querySelectorAll('.open-popup')
    .forEach((el) => el.addEventListener('click', openPopup))
document
    .querySelectorAll('.close-panel')
    .forEach((el) => el.addEventListener('click', closePanel))

/**
 * DOMContentLoaded
 * @function domContentLoaded
 */
async function domContentLoaded() {
    console.debug('domContentLoaded')
    updateManifest().catch((e) => console.warn(e))

    updateTable().catch((e) => showToast(e.message))
}

/**
 * Close Side Panel Click Callback
 * @function closePanel
 * @param {Event} [event]
 */
async function closePanel(event) {
    console.debug('closePanel:', event)
    event?.preventDefault()
    // noinspection JSUnresolvedReference
    if (
        typeof browser !== 'undefined' &&
        typeof browser?.runtime?.getBrowserInfo === 'function'
    ) {
        // noinspection JSUnresolvedReference
        await browser.sidebarAction.close()
    } else {
        window.close()
    }
}
