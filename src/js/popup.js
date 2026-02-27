// JS for popup.html

import {
    checkPerms,
    grantPerms,
    linkClick,
    saveOptions,
    showToast,
    updateManifest,
    updatePlatform,
    updateTable,
} from './export.js'

document.addEventListener('DOMContentLoaded', initPopup)
document
    .querySelectorAll('.grant-permissions')
    .forEach((el) => el.addEventListener('click', (e) => grantPerms(e, true)))
document
    .querySelectorAll('a[href]')
    .forEach((el) => el.addEventListener('click', (e) => linkClick(e, true)))
document
    .querySelectorAll('.options input')
    .forEach((el) => el.addEventListener('change', saveOptions))
document
    .querySelectorAll('form.options')
    .forEach((el) => el.addEventListener('submit', (e) => e.preventDefault()))
document
    .querySelectorAll('[data-bs-toggle="tooltip"]')
    .forEach((el) => new bootstrap.Tooltip(el))

/**
 * Initialize Popup
 * @function initPopup
 */
async function initPopup() {
    console.debug('initPopup')
    updateManifest().catch((e) => console.warn(e))
    updatePlatform().catch((e) => console.warn(e))

    // Check Host Permissions
    checkPerms().then((hasPerms) => {
        if (!hasPerms) {
            return console.log('%cHost Permissions Not Granted', 'color: Red')
        }
    })

    updateTable().catch((e) => showToast(e.message))
}
